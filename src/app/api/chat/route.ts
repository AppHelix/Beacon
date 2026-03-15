/**
 * Beacon AI Chat API
 * 
 * POST /api/chat
 * 
 * Chat endpoint with RAG grounding.
 * Retrieves relevant context from engagements/signals embeddings,
 * then generates AI responses with citations.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getRAGContext } from '@/lib/retrieval';
import { db } from '@/db/client';
import { conversations, conversationMessages } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationId?: string;
}

interface ChatResponse {
  response: string;
  sources: Array<{
    type: 'engagement' | 'signal';
    id: number;
    title: string;
    similarity: number;
  }>;
  conversationId: string;
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ChatRequest = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[Chat] OpenAI API key not configured');
      return NextResponse.json(
        { error: 'Chat service not configured' },
        { status: 500 }
      );
    }

    // Get RAG context for the user's message
    const ragResult = await getRAGContext(message, 2000);

    // Check if we have sufficient context
    const hasContext = ragResult.sources.length > 0;

    // Get or create conversation
    let conversationDbId: number;
    let conversationExtId: string;
    let conversationHistory: ChatMessage[] = [];

    if (body.conversationId) {
      // Retrieve existing conversation
      const existingConv = await db
        .select()
        .from(conversations)
        .where(eq(conversations.conversationId, body.conversationId))
        .limit(1);

      if (existingConv.length > 0) {
        conversationDbId = existingConv[0].id;
        conversationExtId = existingConv[0].conversationId;

        // Retrieve conversation history
        const messages = await db
          .select()
          .from(conversationMessages)
          .where(eq(conversationMessages.conversationId, conversationDbId))
          .orderBy(conversationMessages.createdAt);

        conversationHistory = messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        }));
      } else {
        // Invalid conversationId, create new
        conversationExtId = `conv_${Date.now()}`;
        const newConv = await db
          .insert(conversations)
          .values({
            conversationId: conversationExtId,
            userId: session.user.email || 'unknown',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .returning();
        conversationDbId = newConv[0].id;
      }
    } else {
      // Create new conversation
      conversationExtId = `conv_${Date.now()}`;
      const newConv = await db
        .insert(conversations)
        .values({
          conversationId: conversationExtId,
          userId: session.user.email || 'unknown',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();
      conversationDbId = newConv[0].id;
    }

    // Build system prompt
    const systemPrompt = hasContext
      ? `You are Beacon, an AI assistant for AppHelix's internal knowledge management system.

Your role is to help employees find information about ongoing projects (engagements) and technical challenges (signals).

You have access to the following context from our knowledge base:

${ragResult.context}

IMPORTANT RULES:
1. Answer questions based ONLY on the provided context above.
2. If the context doesn't contain relevant information, say "I don't have enough information about that in our knowledge base."
3. Always cite your sources by mentioning the engagement or signal name.
4. Be concise and helpful.
5. If asked about something not in the context, acknowledge the limitation clearly.`
      : `You are Beacon, an AI assistant for AppHelix's internal knowledge management system.

Your role is to help employees find information about ongoing projects (engagements) and technical challenges (signals).

Unfortunately, I couldn't find relevant information in our knowledge base to answer your question.

Please try:
- Rephrasing your question
- Being more specific about project names or technologies
- Asking about recent engagements or signals

IMPORTANT: Only respond based on information in our knowledge base. If you don't have the information, say so clearly.`;

    // Build messages array for OpenAI
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
     ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ];

    // Call OpenAI Chat Completions API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('[Chat] OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      );
    }

    const openaiData = await openaiResponse.json();
    const assistantMessage = openaiData.choices[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      );
    }

    // Store user message in database
    await db.insert(conversationMessages).values({
      conversationId: conversationDbId,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    });

    // Store assistant response in database
    await db.insert(conversationMessages).values({
      conversationId: conversationDbId,
      role: 'assistant',
      content: assistantMessage,
      sources: JSON.stringify(ragResult.sources),
      createdAt: new Date().toISOString(),
    });

    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(conversations.id, conversationDbId));

    const response: ChatResponse = {
      response: assistantMessage,
      sources: ragResult.sources,
      conversationId: conversationExtId,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Chat] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
