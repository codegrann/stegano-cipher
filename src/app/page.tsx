'use client';

import { useState, useEffect, useMemo } from 'react';
import { Lock, Unlock, Target } from 'lucide-react';
import { Header, Encoder, Decoder, LLMInjection, Card, Tabs, TabPanel } from '@/components';
import { useKeyboardShortcuts } from '@/hooks';
import type { TabType } from '@/types';

// Check if LLM Injection tab is enabled via environment variable
const ENABLE_LLM_INJECTION = process.env.NEXT_PUBLIC_ENABLE_LLM_INJECTION === 'true';

// Matrix rain background component
function MatrixBackground() {
  const [columns, setColumns] = useState<{ char: string; x: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const columnCount = Math.floor(window.innerWidth / 30);

    const newColumns = Array.from({ length: columnCount }, (_, i) => ({
      char: chars[Math.floor(Math.random() * chars.length)],
      x: i * 30,
      delay: Math.random() * 10,
      duration: 5 + Math.random() * 10,
    }));

    setColumns(newColumns);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-0">
      {columns.map((col, i) => (
        <div
          key={i}
          className="absolute text-emerald-500 font-mono text-sm"
          style={{
            left: col.x,
            animation: `matrix-fall ${col.duration}s linear ${col.delay}s infinite`,
          }}
        >
          {col.char}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('encoder');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = useMemo(() => {
    const baseTabs = [
      { id: 'encoder', label: 'ENCODER', icon: <Lock className="w-4 h-4" /> },
      { id: 'decoder', label: 'DECODER', icon: <Unlock className="w-4 h-4" /> },
    ];

    if (ENABLE_LLM_INJECTION) {
      baseTabs.push({ id: 'injection', label: 'LLM INJECTION', icon: <Target className="w-4 h-4" /> });
    }

    return baseTabs;
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'e',
      ctrlKey: true,
      action: () => setActiveTab('encoder'),
    },
    {
      key: 'd',
      ctrlKey: true,
      action: () => setActiveTab('decoder'),
    },
    ...(ENABLE_LLM_INJECTION ? [{
      key: 'i',
      ctrlKey: true,
      action: () => setActiveTab('injection'),
    }] : []),
  ]);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Matrix background effect */}
      {mounted && <MatrixBackground />}

      {/* Scanlines overlay */}
      <div className="scanlines" />

      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl relative z-10">
        {/* Tab Navigation */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabType)}
          className="mb-8"
        />

        {/* Tab Panels */}
        <Card variant="glass" padding="lg">
          <TabPanel isActive={activeTab === 'encoder'}>
            <Encoder />
          </TabPanel>

          <TabPanel isActive={activeTab === 'decoder'}>
            <Decoder />
          </TabPanel>

          {ENABLE_LLM_INJECTION && (
            <TabPanel isActive={activeTab === 'injection'}>
              <LLMInjection />
            </TabPanel>
          )}
        </Card>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-zinc-600 font-mono">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-zinc-800/80 rounded border border-zinc-700 hover:border-emerald-500/50 transition-colors">Ctrl</kbd>
            <span className="text-zinc-700">+</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-800/80 rounded border border-zinc-700 hover:border-emerald-500/50 transition-colors">E</kbd>
            <span className="text-zinc-500">Encoder</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-zinc-800/80 rounded border border-zinc-700 hover:border-emerald-500/50 transition-colors">Ctrl</kbd>
            <span className="text-zinc-700">+</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-800/80 rounded border border-zinc-700 hover:border-emerald-500/50 transition-colors">D</kbd>
            <span className="text-zinc-500">Decoder</span>
          </span>
          {ENABLE_LLM_INJECTION && (
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800/80 rounded border border-zinc-700 hover:border-emerald-500/50 transition-colors">Ctrl</kbd>
              <span className="text-zinc-700">+</span>
              <kbd className="px-1.5 py-0.5 bg-zinc-800/80 rounded border border-zinc-700 hover:border-emerald-500/50 transition-colors">I</kbd>
              <span className="text-zinc-500">Injection</span>
            </span>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-6 mt-auto relative z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-xs text-zinc-600">
          <p className="font-mono flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Built with 🖤 for hiding secrets in plain sight
          </p>
          <p className="mt-1 text-zinc-700">
            Zero-width characters are invisible but present — use responsibly
          </p>
        </div>
      </footer>
    </div>
  );
}
