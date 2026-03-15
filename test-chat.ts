/**
 * Test Beacon AI Chat
 * 
 * Simple script to test the chat API with various queries
 * 
 * Usage: npx tsx test-chat.ts
 */

// Load environment variables first
import { config } from 'dotenv';
config({ path: '.env.local' });

async function testChat(message: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`QUERY: ${message}`);
  console.log('='.repeat(80));

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In production this would be a real session cookie
        // For testing, we'll need the API to work without auth or mock it
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Error (${response.status}):`, error);
      return;
    }

    const data = await response.json();

    console.log('\n📝 RESPONSE:');
    console.log(data.response);

    if (data.sources && data.sources.length > 0) {
      console.log('\n📚 SOURCES:');
      data.sources.forEach((source: any, i: number) => {
        console.log(`  ${i + 1}. [${source.type}] ${source.title} (${(source.similarity * 100).toFixed(1)}% match)`);
      });
    } else {
      console.log('\n⚠️  No sources found (weak context)');
    }

    console.log(`\n🔗 Conversation ID: ${data.conversationId}`);

  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

async function main() {
  console.log('🤖 Testing Beacon AI Chat with RAG\n');
  console.log('⚠️  Make sure your Next.js dev server is running (npm run dev)\n');

  // Test cases
  const queries = [
    'What React projects are currently active?',
    'Tell me about database performance issues',
    'What is the Mobile App Development engagement about?',
    'Are there any PostgreSQL-related signals?',
    'What can you tell me about authentication challenges?',
    'Who is working on machine learning?', // Should return weak context
  ];

  for (const query of queries) {
    await testChat(query);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ Chat testing complete!\n');
}

main().catch(console.error);
