'use client';

import { useState, useCallback } from 'react';
import {
  Target,
  AlertTriangle,
  Copy,
  Check,
  Download,
  ChevronDown,
  Zap,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Textarea, Card, Badge } from './ui';
import { HexViewer } from './HexViewer';
import { encodeInjection, exportInjection } from '@/lib/injection';
import { INJECTION_PRESETS, ENCODING_VARIANTS, MAX_MESSAGE_LENGTH } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type {
  InjectionResult,
  EmbedPosition,
  EncodingVariant,
  ExportFormat,
} from '@/types';

const POSITION_OPTIONS: { value: EmbedPosition; label: string; description: string }[] = [
  { value: 'prefix', label: 'Prefix', description: 'Hidden payload before visible text' },
  { value: 'suffix', label: 'Suffix', description: 'Hidden payload after visible text' },
  { value: 'interleaved', label: 'Interleaved', description: 'Hidden chars mixed within text' },
  { value: 'sandwich', label: 'Sandwich', description: 'Split payload on both sides' },
];

const VARIANT_OPTIONS: { value: EncodingVariant; label: string }[] = [
  { value: 'standard', label: 'Standard (ZWS/ZWNJ)' },
  { value: 'extended', label: 'Extended Invisible' },
  { value: 'combining', label: 'Combining Chars' },
  { value: 'variation', label: 'Variation Selectors' },
];

export function LLMInjection() {
  // Form state
  const [selectedPreset, setSelectedPreset] = useState('');
  const [payload, setPayload] = useState('');
  const [carrierText, setCarrierText] = useState('');
  const [position, setPosition] = useState<EmbedPosition>('suffix');
  const [encodingVariant, setEncodingVariant] = useState<EncodingVariant>('standard');
  const [repetitions, setRepetitions] = useState(1);
  
  // UI state
  const [result, setResult] = useState<InjectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHex, setShowHex] = useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  // Handle preset selection
  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = INJECTION_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setPayload(preset.payload);
      setShowPresetDropdown(false);
      toast.success(`Loaded: ${preset.name}`, { icon: '\u{1F3AF}' });
    }
  }, []);

  // Generate payload
  const handleGenerate = useCallback(async () => {
    if (!payload.trim()) {
      toast.error('Please enter an injection payload', { icon: '\u26A0\uFE0F' });
      return;
    }

    if ((position === 'interleaved' || position === 'sandwich') && !carrierText.trim()) {
      toast.error(`Carrier text required for ${position} position`, { icon: '\u26A0\uFE0F' });
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const injectionResult = encodeInjection({
        payload: payload.trim(),
        carrierText: carrierText.trim(),
        position,
        encodingVariant,
        repetitions,
      });

      setResult(injectionResult);
      setIsLoading(false);

      if (injectionResult.success) {
        try {
          await navigator.clipboard.writeText(injectionResult.output);
          setCopied(true);
          toast.success('Generated & copied to clipboard!', { icon: '\u{1F4CB}' });
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.success('Payload generated successfully!', { icon: '\u{1F9EA}' });
        }
      } else {
        toast.error(injectionResult.error || 'Generation failed', { icon: '\u26A0\uFE0F' });
      }
    }, 150);
  }, [payload, carrierText, position, encodingVariant, repetitions]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!result?.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      toast.success('Copied to clipboard!', { icon: '\u{1F4CB}' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy', { icon: '\u26A0\uFE0F' });
    }
  }, [result?.output]);

  // Export functionality
  const handleExport = useCallback((format: ExportFormat) => {
    if (!result) return;
    const exported = exportInjection(result, format);
    const blob = new Blob([exported], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `injection-payload-${result.metadata.payloadHash}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as ${format.toUpperCase()}`, { icon: '\u{1F4E5}' });
  }, [result]);

  const selectedPresetData = INJECTION_PRESETS.find(p => p.id === selectedPreset);

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <Card variant="cyber" className="border-amber-500/50 bg-amber-500/5">
        <div className="flex items-start gap-3 p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-400">
              Security Testing Tool - Use Responsibly
            </p>
            <p className="text-xs text-zinc-400">
              Only test systems you have explicit permission to test. This tool is for
              authorized security research and red team exercises only.
            </p>
          </div>
          <Shield className="w-5 h-5 text-amber-500/50 flex-shrink-0" />
        </div>
      </Card>

      {/* Preset Selector */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
          Attack Preset
        </label>
        <div className="relative">
          <button
            onClick={() => setShowPresetDropdown(!showPresetDropdown)}
            className={cn(
              'w-full p-3 rounded-lg font-mono text-sm text-left',
              'bg-zinc-900 border border-zinc-700',
              'hover:border-emerald-500/50 transition-all',
              'flex items-center justify-between',
              showPresetDropdown && 'border-emerald-500'
            )}
          >
            <span className={selectedPresetData ? 'text-zinc-100' : 'text-zinc-500'}>
              {selectedPresetData ? selectedPresetData.name : 'Select an attack pattern...'}
            </span>
            <ChevronDown className={cn(
              'w-4 h-4 text-zinc-500 transition-transform',
              showPresetDropdown && 'rotate-180'
            )} />
          </button>

          {showPresetDropdown && (
            <div className="absolute z-20 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-64 overflow-auto">
              {INJECTION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={cn(
                    'w-full p-3 text-left hover:bg-zinc-800 transition-colors',
                    'border-b border-zinc-800 last:border-0',
                    selectedPreset === preset.id && 'bg-emerald-500/10'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-100">{preset.name}</span>
                    <Badge
                      variant={
                        preset.category === 'jailbreak' ? 'error' :
                        preset.category === 'extraction' ? 'warning' :
                        preset.category === 'confusion' ? 'info' : 'default'
                      }
                      className="text-[10px]"
                    >
                      {preset.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{preset.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payload Input */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
          Injection Payload
        </label>
        <Textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          placeholder="Enter your injection payload or select a preset above..."
          maxLength={MAX_MESSAGE_LENGTH}
          showCount
          className="min-h-[120px]"
        />
      </div>

      {/* Carrier Text */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
          Carrier Text
          <span className="text-zinc-600 font-normal ml-2">(visible wrapper)</span>
        </label>
        <Textarea
          value={carrierText}
          onChange={(e) => setCarrierText(e.target.value)}
          placeholder="Enter innocent-looking text to wrap the hidden payload... e.g., 'Hello, how can I help you today?'"
          maxLength={500}
          showCount
          className="min-h-[80px]"
        />
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Position Selector */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
            Position
          </label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as EmbedPosition)}
            className={cn(
              'w-full p-3 rounded-lg font-mono text-sm',
              'bg-zinc-900 border border-zinc-700 text-zinc-100',
              'hover:border-emerald-500/50 focus:border-emerald-500 focus:outline-none',
              'transition-all cursor-pointer'
            )}
          >
            {POSITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-600 mt-1">
            {POSITION_OPTIONS.find(o => o.value === position)?.description}
          </p>
        </div>

        {/* Encoding Variant */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
            Encoding
          </label>
          <select
            value={encodingVariant}
            onChange={(e) => setEncodingVariant(e.target.value as EncodingVariant)}
            className={cn(
              'w-full p-3 rounded-lg font-mono text-sm',
              'bg-zinc-900 border border-zinc-700 text-zinc-100',
              'hover:border-emerald-500/50 focus:border-emerald-500 focus:outline-none',
              'transition-all cursor-pointer'
            )}
          >
            {VARIANT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-600 mt-1 truncate">
            {ENCODING_VARIANTS[encodingVariant].description}
          </p>
        </div>

        {/* Repetitions */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
            Repetitions
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={repetitions}
            onChange={(e) => setRepetitions(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            className={cn(
              'w-full p-3 rounded-lg font-mono text-sm',
              'bg-zinc-900 border border-zinc-700 text-zinc-100',
              'hover:border-emerald-500/50 focus:border-emerald-500 focus:outline-none',
              'transition-all'
            )}
          />
          <p className="text-xs text-zinc-600 mt-1">
            Repeat payload for emphasis (1-10)
          </p>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        isLoading={isLoading}
        leftIcon={<Zap className="w-4 h-4" />}
        className="w-full h-12 text-base glow-emerald"
        disabled={!payload.trim()}
      >
        {isLoading ? 'GENERATING...' : '\u{1F3AF} GENERATE PAYLOAD'}
      </Button>

      {/* Results Section */}
      {result?.success && (
        <>
          <hr className="border-zinc-800" />

          <div className="space-y-4 animate-slide-in-up">
            {/* Output Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Generated Output
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHex(!showHex)}
                    className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                    {showHex ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showHex ? 'Hide Hex' : 'Show Hex'}
                  </button>
                </div>
              </div>

              <Card
                variant="cyber"
                className={cn(
                  'p-4 cursor-pointer',
                  'hover:border-emerald-500/50 transition-all',
                  'animate-success-pop'
                )}
                onClick={handleCopy}
              >
                <div className="font-mono text-sm text-zinc-100 whitespace-pre-wrap break-all">
                  {result.output || <span className="text-zinc-500">(hidden payload only)</span>}
                </div>
                <p className="text-xs text-emerald-500/70 mt-2">(click to copy)</p>
              </Card>
            </div>

            {/* Hex Viewer */}
            {showHex && (
              <HexViewer hexData={result.hexView} className="animate-slide-in-up" />
            )}

            {/* Character Breakdown */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Character Breakdown
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {result.charBreakdown.map((item, i) => (
                  <div
                    key={i}
                    className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-center"
                  >
                    <div className="text-xs text-emerald-400 font-mono">{item.unicode}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{item.name}</div>
                    <div className="text-lg font-bold text-zinc-100">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-zinc-900/50 rounded border border-zinc-800">
                <span className="text-zinc-500">Total Chars:</span>
                <span className="text-zinc-100 ml-1">{result.metadata.charCount}</span>
              </div>
              <div className="p-2 bg-zinc-900/50 rounded border border-zinc-800">
                <span className="text-zinc-500">Hidden:</span>
                <span className="text-emerald-400 ml-1">{result.metadata.hiddenCharCount}</span>
              </div>
              <div className="p-2 bg-zinc-900/50 rounded border border-zinc-800">
                <span className="text-zinc-500">Hash:</span>
                <span className="text-cyan-400 ml-1 font-mono">{result.metadata.payloadHash.slice(0, 8)}</span>
              </div>
              <div className="p-2 bg-zinc-900/50 rounded border border-zinc-800">
                <span className="text-zinc-500">Method:</span>
                <span className="text-amber-400 ml-1">{result.metadata.encodingMethod}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="cyber"
                onClick={handleCopy}
                leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                className={cn('flex-1', copied && 'border-emerald-500 bg-emerald-500/20')}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleExport('json')}
                leftIcon={<Download className="w-4 h-4" />}
              >
                JSON
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleExport('csv')}
                leftIcon={<Download className="w-4 h-4" />}
              >
                CSV
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleExport('jsonl')}
                leftIcon={<Download className="w-4 h-4" />}
              >
                JSONL
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

