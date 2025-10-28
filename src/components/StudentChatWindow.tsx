'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, BookOpen, Brain, Map, Globe } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface StudentChatWindowProps {
  mode: string;
}

const StudentChatWindow: React.FC<StudentChatWindowProps> = ({ mode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message based on mode
  useEffect(() => {
    const welcomeMessages: Record<string, string> = {
      documents: "👋 Hi! I'm your study assistant. Ask me anything about your study materials, and I'll help you find relevant information using AI-powered search.",
      mcq: "👋 Hi! I'm your MCQ practice assistant. Tell me what topic you'd like to practice, and I'll generate multiple choice questions for you. For example: 'Give me 10 MCQs on Ancient India'",
      mindmap: "👋 Hi! I'm your mind map assistant. Tell me what topic you'd like to visualize, and I'll create a hierarchical mind map to help you understand the concepts better.",
      websearch: "👋 Hi! I'm your current affairs assistant. Ask me about recent news, events, or any topic you'd like to research on the web.",
    };

    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: welcomeMessages[mode] || welcomeMessages.documents,
          timestamp: new Date(),
        },
      ]);
    }
  }, [mode]);

  const getModeConfig = () => {
    const configs: Record<
      string,
      { title: string; icon: React.ReactNode; color: string; placeholder: string }
    > = {
      documents: {
        title: 'Browse Documents',
        icon: <BookOpen className="w-5 h-5" />,
        color: 'purple',
        placeholder: 'Ask a question about your study materials...',
      },
      mcq: {
        title: 'Practice MCQs',
        icon: <Brain className="w-5 h-5" />,
        color: 'blue',
        placeholder: 'Request MCQs on a topic (e.g., "10 MCQs on Ancient India")...',
      },
      mindmap: {
        title: 'Mind Maps',
        icon: <Map className="w-5 h-5" />,
        color: 'green',
        placeholder: 'Request a mind map on a topic...',
      },
      websearch: {
        title: 'Web Search',
        icon: <Globe className="w-5 h-5" />,
        color: 'orange',
        placeholder: 'Search for current affairs or any topic...',
      },
    };
    return configs[mode] || configs.documents;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Handle different modes
      if (mode === 'documents') {
        // Call document search API with RAG
        const response = await fetch('/api/documents/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: currentInput,
            studentId: 'student-001', // TODO: Replace with actual student ID from auth
            topK: 5,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Search failed');
        }

        // Format response with sources
        let responseContent = data.answer;

        if (data.sources && data.sources.length > 0) {
          responseContent += '\n\n📚 **Sources:**\n';
          data.sources.forEach((source: any, index: number) => {
            responseContent += `${index + 1}. ${source.fileName}`;
            if (source.subject) responseContent += ` (${source.subject}`;
            if (source.topic) responseContent += ` - ${source.topic}`;
            if (source.subject) responseContent += ')';
            responseContent += '\n';
          });
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else if (mode === 'mcq') {
        // MCQ mode - Phase 3 is now complete!
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I can help you practice MCQs!

To get started:
1. First, make sure you have documents uploaded by your trainer
2. Then visit the MCQ practice page for a specific document: /student/mcq/[documentId]

For example, if you want to practice MCQs for document ID 1:
Visit: /student/mcq/1?studentId=${studentId}

The system will automatically generate MCQs from the document if none exist yet. You can then practice answering them and get instant feedback with explanations!

Would you like me to help you find available documents?`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // For other modes, use placeholder responses (Phase 4+)
        const responses: Record<string, string> = {
          mindmap:
            "I'll create a mind map for you! However, the mind map generation API is not yet implemented. This will be available in Phase 4 when we integrate the mind map generation agent.",
          websearch:
            "I'll search the web for you! However, the web search integration for students is not yet implemented. This will be available in Phase 5 when we integrate the Focus Mode features.",
        };

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responses[mode] || 'Feature coming soon!',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Failed to process your request. Please try again.'}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const config = getModeConfig();

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/student"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className={`p-2 bg-${config.color}-100 dark:bg-${config.color}-900 rounded-lg`}>
            {config.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{config.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered learning assistant
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? `bg-${config.color}-600 text-white`
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user'
                      ? 'text-white/70'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={config.placeholder}
                className="w-full bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={1}
                style={{
                  minHeight: '24px',
                  maxHeight: '120px',
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-3 bg-${config.color}-600 hover:bg-${config.color}-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-2xl transition-colors disabled:cursor-not-allowed`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentChatWindow;

