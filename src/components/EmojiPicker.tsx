'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { EMOJI_PRESETS, DEFAULT_EMOJI } from '@/lib/constants';

export interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ value, onChange, className }: EmojiPickerProps) {
  const selectedEmoji = value || DEFAULT_EMOJI;
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  const handleSelect = (emoji: string) => {
    onChange(emoji);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Cover Emoji
      </label>

      <div className="flex items-start gap-4">
        {/* Selected Emoji Display */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              'w-16 h-16 rounded-lg flex items-center justify-center',
              'bg-zinc-800/80 border-2 border-zinc-700',
              'text-4xl select-none',
              'transition-all duration-300',
              'hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20',
              'animate-float-subtle'
            )}
          >
            <span className="transition-transform duration-200 hover:scale-110">
              {selectedEmoji}
            </span>
          </div>
          <p className="text-[10px] text-zinc-600 text-center mt-1 font-mono">SELECTED</p>
        </div>

        {/* Quick Select Grid */}
        <div className="flex-1">
          <p className="text-xs text-zinc-500 mb-2 font-mono flex items-center gap-2">
            Quick Select:
            {hoveredEmoji && (
              <span className="text-emerald-400 animate-slide-in-right">
                → {EMOJI_PRESETS.find(p => p.emoji === hoveredEmoji)?.name}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_PRESETS.map(({ emoji, name }, index) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelect(emoji)}
                onMouseEnter={() => setHoveredEmoji(emoji)}
                onMouseLeave={() => setHoveredEmoji(null)}
                title={name}
                style={{ animationDelay: `${index * 30}ms` }}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  'text-xl transition-all duration-200',
                  'hover:bg-zinc-700 hover:scale-125 hover:-translate-y-1',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                  'animate-bounce-in',
                  selectedEmoji === emoji
                    ? 'bg-emerald-500/20 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/30 scale-110'
                    : 'bg-zinc-800/50 hover:shadow-md hover:shadow-zinc-500/10'
                )}
              >
                <span className={cn(
                  'transition-transform duration-150',
                  selectedEmoji === emoji && 'animate-bounce-subtle'
                )}>
                  {emoji}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

