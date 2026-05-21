'use client';

import { useState, useEffect } from 'react';
import { Github, Terminal } from 'lucide-react';
import { Button } from './ui';

export function Header() {
  const [isBlinking, setIsBlinking] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  // Periodic eye blink animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000);

    // Random glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 200);
      }
    }, 3000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 group">
          {/* Animated Eye */}
          <div className="relative">
            <span
              className="text-3xl transition-all duration-150 inline-block animate-float-subtle"
              style={{ transform: isBlinking ? 'scaleY(0.1)' : 'scaleY(1)' }}
              aria-hidden="true"
            >
              👁️
            </span>
            {/* Glow effect behind eye */}
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10 animate-pulse-glow" />
          </div>

          <div>
            <h1
              className={`text-xl font-bold text-zinc-50 tracking-tight transition-all ${
                glitchActive ? 'animate-glitch-text' : ''
              }`}
            >
              <span className="neon-text-green">Evil</span>
              <span className="text-zinc-100">Emoji</span>
            </h1>
            <p className="text-xs text-zinc-500 font-mono flex items-center gap-1">
              <Terminal className="w-3 h-3 text-emerald-500" />
              <span className="group-hover:text-emerald-400 transition-colors">
                Zero-Width Steganography Terminal
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
              size="sm"
              onClick={() => window.open('https://github.com/AKCodez/evil-emoji', '_blank')}
            aria-label="View on GitHub"
            className="hover:text-emerald-400 hover:bg-emerald-500/10 transition-all hover-pulse-glow"
          >
            <Github className="w-4 h-4" />
          </Button>
          <span className="text-xs text-emerald-600 font-mono hidden sm:flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            v1.0.0
          </span>
        </div>
      </div>
    </header>
  );
}

