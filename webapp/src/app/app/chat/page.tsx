'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { queryFoodHistory, ChatMessage } from '@/services/gemini';
import { Bot, Send, Loader2, AlertCircle, History, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTED_PROMPTS = [
  "What foods might be causing my energy dips?",
  "I had stomach issues yesterday, what could have caused it?",
  "How is my processed meat consumption affecting my health?",
  "What patterns do you see in my late-night eating?",
];

interface SavedChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

const STORAGE_KEY = 'datadiet_chat_history';

function loadChatHistory(): SavedChat[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveChatHistory(chats: SavedChat[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats.slice(0, 3)));
}

export default function ChatPage() {
  const { meals, insights, bloodWork } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<SavedChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const shouldScrollRef = useRef(false);

  // Load chat history on mount
  useEffect(() => {
    setChatHistory(loadChatHistory());
  }, []);

  // Only scroll when new messages are added (not on initial render)
  useEffect(() => {
    if (shouldScrollRef.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Save current chat to history when it has messages
  useEffect(() => {
    if (messages.length >= 2) {
      const title = messages[0].content.slice(0, 40) + (messages[0].content.length > 40 ? '...' : '');
      const chatId = currentChatId || Date.now().toString();

      if (!currentChatId) {
        setCurrentChatId(chatId);
      }

      const updatedChat: SavedChat = {
        id: chatId,
        title,
        messages,
        createdAt: Date.now(),
      };

      setChatHistory(prev => {
        const filtered = prev.filter(c => c.id !== chatId);
        const updated = [updatedChat, ...filtered].slice(0, 3);
        saveChatHistory(updated);
        return updated;
      });
    }
  }, [messages, currentChatId]);

  const handleSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return;

    shouldScrollRef.current = true;
    const userMessage: ChatMessage = { role: 'user', content: query.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await queryFoodHistory(
        query.trim(),
        meals,
        insights,
        bloodWork,
        messages
      );
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setError(null);
    shouldScrollRef.current = false;
  };

  const loadChat = (chat: SavedChat) => {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setError(null);
    shouldScrollRef.current = false;
  };

  const hasMeals = meals.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-sage-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
        {/* No meals state */}
        {!hasMeals && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-warm-200 dark:border-neutral-800 p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-warm-400 dark:text-neutral-500" />
            <h3 className="text-lg font-semibold text-warm-900 dark:text-neutral-100 mb-2">No meals logged yet</h3>
            <p className="text-warm-500 dark:text-neutral-400">Start logging meals to chat about your dietary patterns.</p>
          </div>
        )}

        {/* Chat area */}
        {hasMeals && (
          <>
            {/* Chat history bar */}
            {(chatHistory.length > 0 || messages.length > 0) && (
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                <button
                  onClick={startNewChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-100 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400 rounded-lg text-sm font-medium hover:bg-sage-200 dark:hover:bg-sage-900/50 transition-colors flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => loadChat(chat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors flex-shrink-0 max-w-[180px] ${
                      currentChatId === chat.id
                        ? 'bg-warm-200 dark:bg-neutral-700 text-warm-900 dark:text-neutral-100'
                        : 'bg-warm-100 dark:bg-neutral-800 text-warm-600 dark:text-neutral-400 hover:bg-warm-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <History className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="space-y-4 mb-4">
              {/* Empty state */}
              {messages.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-warm-900 dark:text-neutral-100 mb-2">
                    What would you like to know?
                  </h3>
                  <p className="text-warm-500 dark:text-neutral-400 mb-6">
                    Ask me anything about your {meals.length} logged meals
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubmit(prompt)}
                        className="px-4 py-2 bg-white dark:bg-neutral-800 border border-warm-200 dark:border-neutral-700 rounded-full text-sm text-warm-700 dark:text-neutral-300 hover:bg-warm-50 dark:hover:bg-neutral-700 hover:border-sage-300 dark:hover:border-sage-700 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message thread */}
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 py-6 ${index > 0 ? 'border-t border-warm-100 dark:border-neutral-800' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      {message.role === 'assistant' ? (
                        <div className="w-8 h-8 rounded-full bg-sage-600 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-warm-300 dark:bg-neutral-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-warm-700 dark:text-neutral-200">Y</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-500 dark:text-neutral-400 mb-1">
                        {message.role === 'assistant' ? 'DataDiet' : 'You'}
                      </p>
                      <div className="text-base text-warm-900 dark:text-neutral-100 whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 py-6 border-t border-warm-100 dark:border-neutral-800"
                >
                  <div className="w-8 h-8 rounded-full bg-sage-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-warm-500 dark:text-neutral-400 mb-1">DataDiet</p>
                    <Loader2 className="w-5 h-5 text-sage-600 dark:text-sage-400 animate-spin" />
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-rose-700 dark:text-rose-300 text-sm">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>

      {/* Fixed input area */}
      {hasMeals && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-t border-warm-200 dark:border-neutral-800 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your food history..."
                rows={1}
                className="flex-1 px-4 py-3 bg-warm-50 dark:bg-neutral-800 border border-warm-200 dark:border-neutral-700 rounded-xl text-warm-900 dark:text-neutral-100 placeholder-warm-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-sage-500 resize-none"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={() => handleSubmit(input)}
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 bg-sage-600 hover:bg-sage-700 disabled:bg-warm-300 dark:disabled:bg-neutral-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
