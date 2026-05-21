'use client';

import { Badge } from './ui';
import { formatBytes } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, HardDrive } from 'lucide-react';

export interface Stats {
  visibleLength: number;
  actualByteLength: number;
  binaryLength: number;
  compressionRatio?: number;
}

export interface StatsDisplayProps {
  stats: Stats;
  className?: string;
}

export function StatsDisplay({ stats, className }: StatsDisplayProps) {
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      <Badge variant="default" className="gap-2">
        <Eye className="w-3.5 h-3.5" />
        <span>Visible:</span>
        <span className="text-emerald-400 font-bold">{stats.visibleLength}</span>
      </Badge>

      <Badge variant="default" className="gap-2">
        <EyeOff className="w-3.5 h-3.5" />
        <span>Hidden:</span>
        <span className="text-cyan-400 font-bold">{stats.binaryLength}</span>
      </Badge>

      <Badge variant="default" className="gap-2">
        <HardDrive className="w-3.5 h-3.5" />
        <span>Payload:</span>
        <span className="text-yellow-400 font-bold">{formatBytes(stats.actualByteLength)}</span>
      </Badge>
    </div>
  );
}

