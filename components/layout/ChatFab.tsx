'use client';

import { MessageSquare } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function ChatFab() {
  const { chatOpen, setChatOpen, messages } = useAppStore();

  if (chatOpen) return null;

  return (
    <button
      onClick={() => setChatOpen(true)}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
    >
      <MessageSquare className="w-5 h-5" />
      {messages.length > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center">
          {messages.length > 9 ? '9+' : messages.length}
        </span>
      )}
    </button>
  );
}
