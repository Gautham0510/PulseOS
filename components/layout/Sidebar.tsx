'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Chrome as Home, TrendingUp, ChartBar as BarChart2, FileText, Globe, FileSliders as Sliders, Download, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarExpanded, setSidebarExpanded, t, activeCurrency } = useAppStore();

  const mainNavItems = [
    { href: '/', label: t.nav.dashboard, icon: Home },
    { href: '/cashflow', label: t.nav.cashflow, icon: TrendingUp },
    { href: '/pl', label: t.nav.pl, icon: BarChart2 },
    { href: '/invoices', label: t.nav.invoices, icon: FileText },
    { href: '/fx', label: t.nav.fx, icon: Globe },
    { href: '/scenarios', label: t.nav.scenarios, icon: Sliders },
    { href: '/reports', label: t.nav.reports, icon: Download },
  ];

  const bottomNavItems = [
    { href: '/input', label: t.nav.input, icon: Upload },
  ];

  return (
    <aside
      className={cn(
        'flex flex-col bg-[#13161f] border-r border-[#2a2f45] transition-all duration-300 flex-shrink-0 z-20',
        sidebarExpanded ? 'w-[220px]' : 'w-[60px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-2.5 px-3 h-14 border-b border-[#2a2f45]',
        !sidebarExpanded && 'justify-center'
      )}>
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {sidebarExpanded && (
          <span className="text-sm font-bold text-white tracking-wide whitespace-nowrap">Pulse OS</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto flex flex-col justify-between">
        <div className="flex flex-col gap-0.5">
          {mainNavItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                title={!sidebarExpanded ? label : undefined}
                className={cn(
                  'flex items-center gap-3 mx-2 px-2.5 py-2 rounded-md text-sm transition-all group',
                  active
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-[#8891aa] hover:text-[#e8eaf0] hover:bg-[#1e2130]',
                  !sidebarExpanded && 'justify-center'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarExpanded && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col gap-0.5 mt-auto pt-3 border-t border-[#2a2f45]/40">
          {bottomNavItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                title={!sidebarExpanded ? label : undefined}
                className={cn(
                  'flex items-center gap-3 mx-2 px-2.5 py-2 rounded-md text-sm transition-all group',
                  active
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-[#8891aa] hover:text-[#e8eaf0] hover:bg-[#1e2130]',
                  !sidebarExpanded && 'justify-center'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarExpanded && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className={cn(
        'border-t border-[#2a2f45] p-3',
        !sidebarExpanded && 'flex justify-center'
      )}>
        {sidebarExpanded ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] text-[#5a6280] truncate">{t.topbar.entity}</p>
              <p className="text-xs text-[#8891aa] font-medium truncate">Arcturus Mfg.</p>
            </div>
            <span className="ml-2 flex-shrink-0 text-[10px] bg-blue-600/20 text-blue-400 border border-blue-600/30 px-1.5 py-0.5 rounded font-medium">{activeCurrency}</span>
          </div>
        ) : null}
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className={cn(
            'mt-2 w-full flex items-center justify-center p-1.5 rounded-md text-[#5a6280] hover:text-[#e8eaf0] hover:bg-[#1e2130] transition-colors',
            !sidebarExpanded && 'mt-0'
          )}
        >
          {sidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
