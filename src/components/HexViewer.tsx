'use client';

import { cn } from '@/lib/utils';

export interface HexViewerProps {
  hexData: string;
  binaryData?: string;
  showBinary?: boolean;
  className?: string;
}

export function HexViewer({
  hexData,
  binaryData,
  showBinary = false,
  className,
}: HexViewerProps) {
  if (!hexData && !binaryData) return null;

  // Format hex data into rows of 16 bytes
  const formatHexRows = (hex: string): string[] => {
    const bytes = hex.split(' ').filter(Boolean);
    const rows: string[] = [];
    for (let i = 0; i < bytes.length; i += 16) {
      rows.push(bytes.slice(i, i + 16).join(' '));
    }
    return rows;
  };

  // Format binary data into rows
  const formatBinaryRows = (binary: string): string[] => {
    const rows: string[] = [];
    for (let i = 0; i < binary.length; i += 32) {
      rows.push(binary.slice(i, i + 32));
    }
    return rows;
  };

  const hexRows = hexData ? formatHexRows(hexData) : [];
  const binaryRows = binaryData ? formatBinaryRows(binaryData) : [];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          {showBinary ? 'Binary View' : 'Hex View'}
        </label>
        <span className="text-xs text-zinc-500 font-mono">
          {showBinary
            ? `${binaryData?.length || 0} bits`
            : `${hexData?.split(' ').filter(Boolean).length || 0} bytes`}
        </span>
      </div>

      <div
        className={cn(
          'rounded-lg p-4 max-h-40 overflow-auto',
          'bg-zinc-950 border border-zinc-800',
          'font-mono text-xs leading-relaxed'
        )}
      >
        {showBinary ? (
          <div className="space-y-1">
            {binaryRows.map((row, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-zinc-600 w-8">{String(i * 32).padStart(4, '0')}</span>
                <span className="text-cyan-400">
                  {row.match(/.{1,8}/g)?.join(' ') || row}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {hexRows.map((row, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-zinc-600 w-8">
                  {(i * 16).toString(16).toUpperCase().padStart(4, '0')}
                </span>
                <span className="text-emerald-400">{row}</span>
              </div>
            ))}
          </div>
        )}
        {hexRows.length === 0 && binaryRows.length === 0 && (
          <span className="text-zinc-500">No data to display</span>
        )}
      </div>
    </div>
  );
}

