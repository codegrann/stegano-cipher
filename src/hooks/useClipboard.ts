'use client';

import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  timeout?: number;
}

interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  paste: () => Promise<string | null>;
  error: Error | null;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000 } = options;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        setError(new Error('Clipboard API not available'));
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);

        setTimeout(() => {
          setCopied(false);
        }, timeout);

        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to copy'));
        setCopied(false);
        return false;
      }
    },
    [timeout]
  );

  const paste = useCallback(async (): Promise<string | null> => {
    if (!navigator?.clipboard) {
      setError(new Error('Clipboard API not available'));
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      setError(null);
      return text;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to paste'));
      return null;
    }
  }, []);

  return { copied, copy, paste, error };
}

