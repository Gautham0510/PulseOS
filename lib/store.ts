'use client';

import { create } from 'zustand';
import { type Locale, type Translations, typedTranslations } from './i18n';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type AppStore = {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  activeCurrency: string;
  setActiveCurrency: (c: string) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (v: boolean) => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
  initializePreferences: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  chatOpen: false,
  setChatOpen: (open) => set({ chatOpen: open }),
  messages: [],
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: Math.random().toString(36).slice(2), timestamp: new Date() },
      ],
    })),
  activeCurrency: 'EUR',
  setActiveCurrency: (c) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulse-os-currency', c);
    }
    set({ activeCurrency: c });
  },
  sidebarExpanded: true,
  setSidebarExpanded: (v) => set({ sidebarExpanded: v }),
  locale: 'en',
  setLocale: (l) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulse-os-locale', l);
    }
    set({ locale: l, t: typedTranslations[l] });
  },
  t: typedTranslations.en,
  initializePreferences: () => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('pulse-os-locale') as Locale;
      const savedCurrency = localStorage.getItem('pulse-os-currency');
      set((state) => {
        const nextLocale = savedLocale && (savedLocale === 'en' || savedLocale === 'fr') ? savedLocale : state.locale;
        const nextCurrency = savedCurrency || state.activeCurrency;
        return {
          locale: nextLocale,
          t: typedTranslations[nextLocale],
          activeCurrency: nextCurrency,
        };
      });
    }
  },
}));
