'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Textarea, Card, Badge, Toggle } from './ui';
import { HexViewer } from './HexViewer';
import { decode, hasHiddenData, type DecodeResult } from '@/lib/stego';
import { cn } from '@/lib/utils';

export function Decoder() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHexView, setShowHexView] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleDecode = useCallback(() => {
    if (!input.trim()) {
      toast.error('Please paste some input to decode', { icon: '⚠️' });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const decodeResult = decode({ input: input.trim(), strict: false });
      setResult(decodeResult);
      setIsLoading(false);

      if (decodeResult.success) {
        toast.success('Hidden message revealed!', { icon: '🔍' });
      } else if (decodeResult.error) {
        toast.error(decodeResult.error, { icon: '⚠️' });
      }
    }, 150);
  }, [input]);

  // Auto-detect on paste
  useEffect(() => {
    if (autoDetect && input.trim() && hasHiddenData(input)) {
      toast.info('Hidden data detected! Auto-decrypting...', { icon: '🔍', duration: 1500 });
      handleDecode();
    }
  }, [input, autoDetect, handleDecode]);

  const handleCopyMessage = useCallback(async () => {
    if (!result?.message) return;

    try {
      await navigator.clipboard.writeText(result.message);
      setCopied(true);
      toast.success('Message copied!', { icon: '📋' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy', { icon: '⚠️' });
    }
  }, [result?.message]);

  const getConfidenceBadge = (confidence: DecodeResult['confidence']) => {
    const config = {
      high: { variant: 'success' as const, label: 'HIGH CONF' },
      medium: { variant: 'warning' as const, label: 'MEDIUM CONF' },
      low: { variant: 'error' as const, label: 'LOW CONF' },
      none: { variant: 'default' as const, label: 'NO DATA' },
    };
    return config[confidence];
  };

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
          Paste Suspicious Input
        </label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste any text, emoji, or message here to check for hidden data... 🕵️"
          className="min-h-[140px]"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          onClick={handleDecode}
          isLoading={isLoading}
          leftIcon={<Search className="w-4 h-4" />}
          disabled={!input.trim()}
        >
          🔍 DECRYPT
        </Button>

        <div className="flex items-center gap-4">
          <Toggle
            checked={showHexView}
            onChange={setShowHexView}
            label="Show Hex View"
          />
          <Toggle
            checked={autoDetect}
            onChange={setAutoDetect}
            label="Auto-detect on paste"
          />
        </div>
      </div>

      {/* Divider */}
      {result && <hr className="border-zinc-800" />}

      {/* Result Section */}
      {result && (
        <div className="space-y-4 animate-slide-in-up">
          {/* Header with confidence */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              {result.success && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              )}
              Revealed Message
            </label>
            <Badge
              {...getConfidenceBadge(result.confidence)}
              glow={result.success}
              pulse={result.success}
            >
              {result.success ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              {getConfidenceBadge(result.confidence).label}
            </Badge>
          </div>

          {/* Message Display */}
          <Card
            variant="cyber"
            className={cn(
              'relative overflow-hidden',
              result.success
                ? 'border-emerald-500/30 animate-success-pop'
                : 'border-red-500/30 animate-error-shake'
            )}
          >
            {result.success && result.message ? (
              <>
                {/* Background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/5 pointer-events-none rounded-xl" />

                {/* Typewriter-style message */}
                <div className="font-mono text-sm whitespace-pre-wrap break-words text-zinc-100 animate-reveal">
                  {result.message}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyMessage}
                  className={cn(
                    'absolute top-2 right-2 transition-all',
                    copied && 'text-emerald-400'
                  )}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-zinc-500 italic">
                  {result.error || 'No hidden message found'}
                </p>
              </div>
            )}
          </Card>

          {/* Metadata */}
          {result.metadata.hiddenCharsFound > 0 && (
            <div className="flex gap-3 text-xs text-zinc-500 font-mono bg-zinc-900/50 rounded-lg p-2 border border-zinc-800">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                Hidden chars: {result.metadata.hiddenCharsFound}
              </span>
              {result.metadata.estimatedEncoding && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  Encoding: {result.metadata.estimatedEncoding.toUpperCase()}
                </span>
              )}
            </div>
          )}

          {/* Hex View */}
          {showHexView && (result.hexView || result.binaryView) && (
            <div className="animate-slide-in-up">
              <HexViewer
                hexData={result.hexView}
                binaryData={result.binaryView}
                showBinary={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}