import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ChatPanel from '@/components/layout/ChatPanel';
import ChatFab from '@/components/layout/ChatFab';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pulse OS — Arcturus Manufacturing GmbH',
  description: 'Financial intelligence platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0f1117] text-[#e8eaf0] overflow-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                {children}
              </main>
            </div>
            <ChatPanel />
            <ChatFab />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
