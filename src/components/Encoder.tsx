'use client';

import { useState, useCallback } from 'react';
import { Lock, Copy, Check, Type, Smile } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Textarea, Card } from './ui';
import { EmojiPicker } from './EmojiPicker';
import { StatsDisplay, type Stats } from './StatsDisplay';
import { encode, type EncodeResult } from '@/lib/stego';
import { MAX_MESSAGE_LENGTH, DEFAULT_EMOJI } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { CoverMode } from '@/types';

export function Encoder() {
  const [secretMessage, setSecretMessage] = useState('');
  const [coverEmoji, setCoverEmoji] = useState(DEFAULT_EMOJI);
  const [coverText, setCoverText] = useState('');
  const [coverMode, setCoverMode] = useState<CoverMode>('emoji');
  const [result, setResult] = useState<EncodeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEncode = useCallback(async () => {
    if (!secretMessage.trim()) {
      toast.error('Please enter a secret message', { icon: '⚠️' });
      return;
    }

    if (coverMode === 'text' && !coverText.trim()) {
      toast.error('Please enter cover text', { icon: '⚠️' });
      return;
    }

    setIsLoading(true);

    // Simulate slight delay for UX
    setTimeout(async () => {
      const encodeResult = encode({
        coverEmoji,
        coverText: coverText.trim(),
        coverMode,
        secretMessage: secretMessage.trim(),
        includeChecksum: true,
      });

      setResult(encodeResult);
      setIsLoading(false);

      if (encodeResult.success && encodeResult.payload) {
        // Auto-copy to clipboard
        try {
          await navigator.clipboard.writeText(encodeResult.payload);
          setCopied(true);
          toast.success('Encoded & copied to clipboard!', { icon: '📋' });
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.success('Message encoded successfully!', { icon: '🔒' });
        }
      } else {
        toast.error(encodeResult.error || 'Encoding failed', { icon: '⚠️' });
      }
    }, 150);
  }, [secretMessage, coverEmoji, coverText, coverMode]);

  const handleCopy = useCallback(async () => {
    if (!result?.payload) return;

    try {
      await navigator.clipboard.writeText(result.payload);
      setCopied(true);
      toast.success('Payload copied to clipboard!', { icon: '📋' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard', { icon: '⚠️' });
    }
  }, [result?.payload]);

  const stats: Stats | null = result?.success
    ? {
        visibleLength: result.stats.visibleLength,
        actualByteLength: result.stats.actualByteLength,
        binaryLength: result.stats.binaryLength,
        compressionRatio: result.stats.compressionRatio,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Secret Message Input */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
          Secret Data
        </label>
        <Textarea
          value={secretMessage}
          onChange={(e) => setSecretMessage(e.target.value)}
          placeholder="Enter your secret message here... coordinates, passwords, love letters, whatever you want to hide 🕵️"
          maxLength={MAX_MESSAGE_LENGTH}
          showCount
          className="min-h-[140px]"
        />
      </div>

      {/* Cover Mode Toggle */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
          Cover Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => { setCoverMode('emoji'); setResult(null); }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200',
              coverMode === 'emoji'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'border-zinc-700 bg-zinc-900/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
            )}
          >
            <Smile className="w-4 h-4" />
            Emoji
          </button>
          <button
            onClick={() => { setCoverMode('text'); setResult(null); }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200',
              coverMode === 'text'
                ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                : 'border-zinc-700 bg-zinc-900/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
            )}
          >
            <Type className="w-4 h-4" />
            Text
          </button>
        </div>
      </div>

      {/* Cover Input — Emoji Picker or Text Area */}
      {coverMode === 'emoji' ? (
        <EmojiPicker value={coverEmoji} onChange={setCoverEmoji} />
      ) : (
        <div>
          <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
            Cover Text
            <span className="text-purple-500/70 ml-2 normal-case tracking-normal">— the innocent message everyone sees</span>
          </label>
          <Textarea
            value={coverText}
            onChange={(e) => setCoverText(e.target.value)}
            placeholder="Type any normal text... &quot;Hey, are we still on for dinner tonight?&quot;"
            className="min-h-[80px]"
          />
        </div>
      )}

      {/* Encode Button */}
      <Button
        onClick={handleEncode}
        isLoading={isLoading}
        leftIcon={<Lock className="w-4 h-4" />}
        className={cn(
          'w-full h-12 text-base',
          coverMode === 'text' ? 'glow-purple' : 'glow-emerald'
        )}
        disabled={!secretMessage.trim() || (coverMode === 'text' && !coverText.trim())}
      >
        {isLoading ? 'ENCRYPTING...' : '🔐 ENCRYPT & BIND'}
      </Button>

      {/* Divider */}
      {result && <hr className="border-zinc-800" />}

      {/* Output Section */}
      {result?.success && (
        <div className="space-y-4 animate-slide-in-up">
          <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <span className={cn(
              'w-2 h-2 rounded-full animate-pulse',
              coverMode === 'text' ? 'bg-purple-500' : 'bg-emerald-500'
            )} />
            Output
            {coverMode === 'text' && (
              <span className="text-purple-500/60 normal-case tracking-normal text-xs ml-1">
                — looks normal, but the payload is hidden inside
              </span>
            )}
          </label>

          <Card
            variant="cyber"
            className={cn(
              'flex flex-col items-center justify-center py-8 cursor-pointer',
              'hover:border-emerald-500/50 transition-all duration-300',
              'hover:shadow-lg hover:shadow-emerald-500/20',
              'group animate-success-pop',
              coverMode === 'text' && 'hover:border-purple-500/50 hover:shadow-purple-500/20'
            )}
            onClick={handleCopy}
          >
            {/* Success glow effect */}
            <div className={cn(
              'absolute inset-0 bg-gradient-radial to-transparent rounded-xl pointer-events-none',
              coverMode === 'text' ? 'from-purple-500/10' : 'from-emerald-500/10'
            )} />

            {coverMode === 'text' ? (
              <p className="text-lg text-zinc-200 font-mono px-6 text-center group-hover:scale-[1.02] transition-all duration-300 relative">
                {result.payload}
              </p>
            ) : (
              <span className="text-6xl mb-3 group-hover:scale-125 transition-all duration-300 animate-float-subtle relative">
                {result.payload}
                <span className="absolute inset-0 blur-xl opacity-50 pointer-events-none">
                  {result.payload}
                </span>
              </span>
            )}
            <p className={cn(
              'text-xs font-mono animate-pulse mt-3',
              coverMode === 'text' ? 'text-purple-500/70' : 'text-emerald-500/70'
            )}>
              (click to copy)
            </p>
          </Card>

          {stats && <StatsDisplay stats={stats} />}

          <Button
            variant="cyber"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            className={cn(
              'w-full',
              copied && 'border-emerald-500 bg-emerald-500/20'
            )}
          >
            {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
          </Button>
        </div>
      )}
    </div>
  );
}
