'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    type: 'engagement' | 'signal';
    id: number;
    title: string;
    similarity: number;
  }>;
}

export default function BeaconPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        sources: data.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(data.conversationId);

    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground">
            Please sign in to use Beacon AI Assistant.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/')}
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">🤖 Beacon AI Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Ask questions about engagements, signals, and projects
              </p>
            </div>
          </div>
          {conversationId && (
            <Button onClick={startNewConversation} variant="outline">
              New Chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="text-6xl">🤖</div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Beacon AI</h2>
                <p className="text-muted-foreground mb-6">
                  Your intelligent assistant for AppHelix knowledge
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                <Card className="p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => setInput('What React projects are currently active?')}>
                  <p className="font-medium">📊 Active Projects</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    What React projects are currently active?
                  </p>
                </Card>
                <Card className="p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => setInput('Tell me about database performance issues')}>
                  <p className="font-medium">🔧 Technical Signals</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tell me about database performance issues
                  </p>
                </Card>
                <Card className="p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => setInput('What engagements need TypeScript expertise?')}>
                  <p className="font-medium">💼 Skill Matching</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    What engagements need TypeScript expertise?
                  </p>
                </Card>
                <Card className="p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => setInput('Show me recent authentication challenges')}>
                  <p className="font-medium">🔒 Security Topics</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Show me recent authentication challenges
                  </p>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card
                    className={`max-w-[80%] p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm font-semibold mb-2">📚 Sources:</p>
                        <div className="space-y-2">
                          {message.sources.map((source, idx) => (
                            <div key={idx} className="text-sm">
                              <a
                                href={`/${source.type === 'engagement' ? 'engagements' : 'signals'}/${source.id}`}
                                className="text-blue-500 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                [{source.type}] {source.title}
                              </a>
                              <span className="text-muted-foreground ml-2">
                                ({(source.similarity * 100).toFixed(0)}% match)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <Card className="max-w-[80%] p-4 bg-card">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse">🤖</div>
                      <span className="text-muted-foreground">Thinking...</span>
                    </div>
                  </Card>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-card">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Beacon anything about your projects..."
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()}>
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Beacon is powered by AI and grounded in your organization&apos;s knowledge base
          </p>
        </div>
      </div>
    </div>
  );
}
