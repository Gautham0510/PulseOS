'use client';

import { useEffect, useState } from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/lib/store';
import { type Locale } from '@/lib/i18n';

const currencies = ['EUR', 'INR', 'AED'];
const locales: { value: Locale; label: string; flag: string }[] = [
  { value: 'en', label: 'EN', flag: '🇬🇧' },
  { value: 'fr', label: 'FR', flag: '🇫🇷' },
];

export default function TopBar() {
  const { activeCurrency, setActiveCurrency, locale, setLocale, t, initializePreferences } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initializePreferences();
    setMounted(true);
  }, [initializePreferences]);

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 bg-[#13161f] border-b border-[#2a2f45]">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-[#e8eaf0]">Arcturus Manufacturing GmbH</h1>
          <p className="text-[11px] text-[#5a6280]">{t.topbar.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language switcher */}
        <div className="flex items-center gap-0.5 bg-[#1e2130] border border-[#2a2f45] rounded-md p-0.5">
          {locales.map((l) => (
            <button
              key={l.value}
              onClick={() => setLocale(l.value)}
              title={l.value === 'en' ? 'English' : 'Français'}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                locale === l.value
                  ? 'bg-blue-600 text-white'
                  : 'text-[#8891aa] hover:text-[#e8eaf0]'
              }`}
            >
              <span className="text-sm leading-none">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>

        {/* Currency switcher */}
        <div className="flex items-center gap-1 bg-[#1e2130] border border-[#2a2f45] rounded-md p-0.5">
          {currencies.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCurrency(c)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeCurrency === c
                  ? 'bg-blue-600 text-white'
                  : 'text-[#8891aa] hover:text-[#e8eaf0]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-md text-[#8891aa] hover:text-[#e8eaf0] hover:bg-[#1e2130] transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {mounted && theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Notification bell */}
        <button className="relative p-2 rounded-md text-[#8891aa] hover:text-[#e8eaf0] hover:bg-[#1e2130] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          A
        </div>
      </div>
    </header>
  );
}
