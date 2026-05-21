'use client';

import { type ReactNode, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const activeTabEl = tabRefs.current[activeIndex];
    const container = containerRef.current;

    if (activeTabEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex rounded-lg bg-zinc-900/80 border border-zinc-800 p-1 backdrop-blur-sm',
        className
      )}
      role="tablist"
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-1 bottom-1 bg-emerald-600 rounded-md shadow-lg shadow-emerald-500/30 transition-all duration-300 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />

      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={el => { tabRefs.current[index] = el; }}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md',
            'font-medium text-sm transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
            activeTab === tab.id
              ? 'text-white'
              : 'text-zinc-400 hover:text-zinc-100'
          )}
        >
          <span className={cn(
            'transition-transform duration-200',
            activeTab === tab.id && 'scale-110'
          )}>
            {tab.icon}
          </span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export interface TabPanelProps {
  children: ReactNode;
  isActive: boolean;
  className?: string;
}

export function TabPanel({ children, isActive, className }: TabPanelProps) {
  // Use hidden instead of conditional rendering to persist state
  return (
    <div
      role="tabpanel"
      className={cn(
        isActive ? 'animate-slide-in-up' : 'hidden',
        className
      )}
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
}

