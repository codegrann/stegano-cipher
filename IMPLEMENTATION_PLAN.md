# 🎭 EvilEmoji — Zero-Width Steganography Dashboard

## Implementation Blueprint v1.0

---

## 🎨 Design Philosophy: "Snapchat Gone Rogue"

### Aesthetic Direction

The visual identity merges **Snapchat's playful, emoji-centric UI** with **hacker terminal aesthetics** and **OSINT tool professionalism**.

#### Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary Background** | Void Black | `#09090b` | Main canvas (zinc-950) |
| **Secondary Background** | Carbon | `#18181b` | Cards, panels (zinc-900) |
| **Tertiary Background** | Graphite | `#27272a` | Inputs, hover states (zinc-800) |
| **Primary Accent** | Toxic Green | `#10b981` | Success, CTA buttons (emerald-500) |
| **Secondary Accent** | Neon Yellow | `#facc15` | Warnings, highlights (yellow-400) |
| **Danger Accent** | Glitch Red | `#ef4444` | Errors, alerts (red-500) |
| **Cyber Accent** | Electric Cyan | `#22d3ee` | Links, info states (cyan-400) |
| **Ghost Text** | Phantom Gray | `#71717a` | Placeholders, muted (zinc-500) |
| **Primary Text** | Pure White | `#fafafa` | Main content (zinc-50) |

#### Typography Stack

```css
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace;
--font-display: 'Inter', 'SF Pro Display', system-ui, sans-serif;
```

- **Headings**: Inter (display font) with tight letter-spacing
- **Data/Code/Inputs**: JetBrains Mono for that authentic terminal feel
- **Body**: Inter for readability

#### Visual Effects

1. **Glow Effects**: Subtle `box-shadow` with accent colors on focus states
2. **Scanline Overlay**: Optional CSS scanline effect for extra "hacker" vibes
3. **Micro-animations**: Smooth transitions (150-300ms) on all interactive elements
4. **Glassmorphism**: Semi-transparent cards with `backdrop-blur`
5. **Dot Grid Pattern**: Subtle background pattern reminiscent of OSINT tools

---

## 🔧 Technical Stack

```
├── Framework:     Next.js 16.1.1 (App Router)
├── Language:      TypeScript 5.x (strict mode)
├── Styling:       Tailwind CSS 4.x
├── Icons:         Lucide React
├── Notifications: Sonner (toast library)
├── Utilities:     clsx, tailwind-merge
└── Fonts:         next/font (Inter + JetBrains Mono)
```

---

## 📁 Project Structure

```
EvilEmoji/
├── app/
│   ├── layout.tsx          # Root layout with fonts, metadata
│   ├── page.tsx             # Main dashboard (Client Component)
│   └── globals.css          # Tailwind directives + custom styles
├── components/
│   ├── ui/
│   │   ├── Button.tsx       # Reusable button component
│   │   ├── Input.tsx        # Styled input with glow effects
│   │   ├── Textarea.tsx     # Multi-line input
│   │   ├── Card.tsx         # Glassmorphic container
│   │   ├── Badge.tsx        # Stats/status badges
│   │   ├── Tabs.tsx         # Encoder/Decoder switcher
│   │   └── Toggle.tsx       # Hex view toggle
│   ├── Encoder.tsx          # Encoding panel
│   ├── Decoder.tsx          # Decoding panel
│   ├── EmojiPicker.tsx      # Cover emoji selector
│   ├── HexViewer.tsx        # Hexadecimal visualization
│   ├── StatsDisplay.tsx     # Payload statistics
│   └── Header.tsx           # App header with branding
├── lib/
│   ├── stego.ts             # Core steganography engine
│   ├── utils.ts             # Helper functions (cn, etc.)
│   └── constants.ts         # Unicode constants, emoji presets
├── hooks/
│   ├── useClipboard.ts      # Clipboard operations
│   └── useAutoDetect.ts     # Auto-decode on paste
├── types/
│   └── index.ts             # TypeScript interfaces
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 🧠 Core Engine: `lib/stego.ts` — Deep Dive

### Unicode Zero-Width Characters Reference

| Character | Unicode | Escape | Binary Mapping | Purpose |
|-----------|---------|--------|----------------|---------|
| Zero-Width Space | U+200B | `\u200B` | `1` | Binary one |
| Zero-Width Non-Joiner | U+200C | `\u200C` | `0` | Binary zero |
| Zero-Width Joiner | U+200D | `\u200D` | — | Delimiter/wrapper |
| Word Joiner | U+2060 | `\u2060` | — | Alt: message boundary |
| Zero-Width No-Break Space | U+FEFF | `\uFEFF` | — | Alt: version marker |

### Encoding Algorithm (Detailed)

```typescript
/**
 * ENCODING FLOW:
 * 
 * Input: "Hi" + 😈
 * 
 * Step 1: Convert to Binary (8-bit per char)
 *   'H' = 72  = 01001000
 *   'i' = 105 = 01101001
 *   Full binary: "0100100001101001"
 * 
 * Step 2: Map to Zero-Width Characters
 *   0 → \u200C (ZWNJ)
 *   1 → \u200B (ZWS)
 *   Result: "\u200C\u200B\u200C\u200C\u200B..."
 * 
 * Step 3: Wrap with Delimiters
 *   Format: [Emoji] + \u200D + [Encoded] + \u200D
 *   Result: "😈\u200D\u200C\u200B\u200C\u200C...\u200D"
 * 
 * Output: Looks like "😈" but contains hidden data!
 */
```

### Robust Implementation Features

#### 1. Multi-Encoding Support

```typescript
type EncodingMode = 'ascii' | 'utf8' | 'utf16';

// ASCII: 8 bits per character (fast, English-only)
// UTF-8: Variable width (1-4 bytes), supports most languages
// UTF-16: 16 bits per character (emoji-safe, universal)
```

**Recommendation**: Default to UTF-8 with UTF-16 fallback for emojis in messages.

#### 2. Integrity Checksums

Add a CRC-8 or simple XOR checksum to detect corruption:

```typescript
// Payload Structure:
// [VERSION_BYTE][ENCODING_FLAG][CHECKSUM][LENGTH][DATA]
//     1 bit         2 bits       8 bits   16 bits  N bits

interface EncodedPayload {
  version: number;      // Protocol version (future-proofing)
  encoding: EncodingMode;
  checksum: number;     // XOR of all data bytes
  length: number;       // Original message byte length
  data: string;         // The actual hidden message
}
```

#### 3. Error Detection & Recovery

```typescript
interface DecodeResult {
  success: boolean;
  message: string | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
  errors: string[];
  metadata: {
    visibleChars: number;
    hiddenChars: number;
    byteLength: number;
    detectedEncoding: EncodingMode | null;
  };
}
```

#### 4. Edge Case Handling

| Scenario | Handling |
|----------|----------|
| Empty message | Return error: "Message cannot be empty" |
| Empty cover emoji | Use default: 👁️ (eye emoji) |
| Invalid emoji (text) | Validate using emoji regex, reject non-emoji |
| Binary length overflow | Warn if payload exceeds safe limit (~10KB) |
| Corrupted decode input | Return partial data with low confidence |
| No hidden data found | Return clean "No payload detected" message |
| Mixed visible + hidden | Strip visible, process hidden only |

### Complete `stego.ts` Interface

```typescript
// lib/stego.ts

export const ZERO_WIDTH = {
  SPACE: '\u200B',      // Binary 1
  NON_JOINER: '\u200C', // Binary 0
  JOINER: '\u200D',     // Delimiter
  WORD_JOINER: '\u2060', // Boundary marker
  BOM: '\uFEFF',        // Version marker
} as const;

export interface EncodeOptions {
  coverEmoji: string;
  secretMessage: string;
  encoding?: EncodingMode;
  includeChecksum?: boolean;
}

export interface EncodeResult {
  success: boolean;
  payload: string;           // The steganographic output
  stats: {
    visibleLength: number;   // What the user "sees"
    actualByteLength: number; // True size in bytes
    binaryLength: number;    // Number of ZW chars used
    compressionRatio: number; // Efficiency metric
  };
  error?: string;
}

export interface DecodeOptions {
  input: string;
  strict?: boolean;          // Fail on checksum mismatch
}

export interface DecodeResult {
  success: boolean;
  message: string | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
  hexView: string;           // Hex representation
  binaryView: string;        // Raw binary string
  metadata: {
    hiddenCharsFound: number;
    estimatedEncoding: EncodingMode | null;
  };
  error?: string;
}

// Main exports
export function encode(options: EncodeOptions): EncodeResult;
export function decode(options: DecodeOptions): DecodeResult;
export function hasHiddenData(input: string): boolean;
export function extractHiddenChars(input: string): string;
export function toHexView(input: string): string;
export function toBinaryView(input: string): string;
```

---

## 🖥️ UI Components — Detailed Specifications

### Header Component

```
┌─────────────────────────────────────────────────────────────────┐
│  👁️ EvilEmoji                          [GitHub] [Theme Toggle] │
│  Zero-Width Steganography Terminal                    v1.0.0   │
└─────────────────────────────────────────────────────────────────┘
```

- Animated eye emoji that "blinks" periodically
- Typewriter effect on subtitle (optional)
- Minimal, stays out of the way

### Tab Navigation

```
┌────────────────┬────────────────┐
│  🔒 ENCODER    │  🔓 DECODER    │
│    (active)    │                │
└────────────────┴────────────────┘
```

- Underline animation on active tab
- Keyboard accessible (←/→ arrows)
- Smooth panel transition (slide or fade)

### Encoder Panel (Write Mode)

```
┌─────────────────────────────────────────────────────────────────┐
│ SECRET DATA                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Meeting coordinates: 34.0522, -118.2437                     │ │
│ │ Backup phrase: correct horse battery staple                 │ │
│ │ ▌                                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                    128/2048 chars│
│                                                                 │
│ COVER EMOJI                                                     │
│ ┌─────────┐  ┌───────────────────────────────────────────────┐ │
│ │   😈    │  │  Quick Select: 😀 😎 🔥 💀 👁️ 🎭 🐍 💎 🌙 ⚡  │ │
│ └─────────┘  └───────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                   [ 🔐 ENCRYPT & BIND ]                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ═══════════════════════════════════════════════════════════════ │
│                                                                 │
│ OUTPUT                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                          😈                                  │ │
│ │                    (click to copy)                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐ │
│ │ Visible: 2  │ │ Hidden: 847 │ │ Payload: 1.2 KB             │ │
│ └─────────────┘ └─────────────┘ └─────────────────────────────┘ │
│                                                                 │
│                 [ 📋 Copy to Clipboard ]                        │
└─────────────────────────────────────────────────────────────────┘
```

### Decoder Panel (Read Mode)

```
┌─────────────────────────────────────────────────────────────────┐
│ PASTE SUSPICIOUS INPUT                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │  Paste any text, emoji, or message here...                 │ │
│ │                                                             │ │
│ │  ▌                                                          │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌────────────────────┐        ☐ Show Hex View                   │
│ │  [ 🔍 DECRYPT ]    │        ☐ Auto-detect on paste           │
│ └────────────────────┘                                          │
│                                                                 │
│ ═══════════════════════════════════════════════════════════════ │
│                                                                 │
│ REVEALED MESSAGE                                    [HIGH CONF] │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ │ ░  Meeting coordinates: 34.0522, -118.2437                 ░ │ │
│ │ ░  Backup phrase: correct horse battery staple             ░ │ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ HEX VIEW                                              [Toggle] │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ F0 9F 98 88 E2 80 8D E2 80 8C E2 80 8B E2 80 8C E2 80 8C   │ │
│ │ E2 80 8B E2 80 8C E2 80 8C E2 80 8C E2 80 8C E2 80 8B ...  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎭 Interaction States

### Button States

| State | Visual Treatment |
|-------|------------------|
| Default | `bg-emerald-600` with subtle glow |
| Hover | `bg-emerald-500` + increased glow + scale(1.02) |
| Active | `bg-emerald-700` + pressed effect |
| Disabled | `bg-zinc-700 opacity-50 cursor-not-allowed` |
| Loading | Spinner icon + "Processing..." text |

### Input States

| State | Visual Treatment |
|-------|------------------|
| Default | `border-zinc-700 bg-zinc-900` |
| Focus | `border-emerald-500 ring-2 ring-emerald-500/20` |
| Error | `border-red-500 ring-2 ring-red-500/20` |
| Success | `border-emerald-500` (brief flash on valid input) |

### Toast Notifications (Sonner)

```typescript
// Success
toast.success("Payload copied to clipboard!", {
  icon: "📋",
  duration: 2000,
});

// Error
toast.error("Decryption failed: Invalid payload structure", {
  icon: "⚠️",
  duration: 4000,
});

// Info
toast.info("Hidden data detected! Auto-decrypting...", {
  icon: "🔍",
  duration: 1500,
});
```

---

## 🔐 Security Considerations

### What This Tool IS

- A **proof-of-concept** for zero-width steganography
- An **educational tool** demonstrating Unicode manipulation
- A **fun utility** for hiding Easter eggs in messages

### What This Tool IS NOT

- **Not encryption**: Data is hidden, not encrypted. Anyone who knows to look can decode it.
- **Not secure communication**: Zero-width chars are detectable by security tools.
- **Not undetectable**: Copy-pasting to certain platforms strips ZW chars.

### Recommended Security Enhancements (Optional)

```typescript
// For users who want actual security, layer encryption:
import { encrypt, decrypt } from 'some-crypto-lib';

// Encode flow becomes:
// 1. Encrypt message with password → ciphertext
// 2. Encode ciphertext with steganography → hidden payload
// 3. Result: Both hidden AND encrypted

interface SecureEncodeOptions extends EncodeOptions {
  password?: string;        // AES-256-GCM encryption
  useSteganography: boolean; // Can disable hiding for testing
}
```

---

## 📱 Responsive Design Breakpoints

```css
/* Tailwind breakpoints used */
sm: 640px   /* Stack panels vertically */
md: 768px   /* Side-by-side panels begin */
lg: 1024px  /* Full desktop experience */
xl: 1280px  /* Extra spacing, larger fonts */
```

### Mobile Layout (< 768px)

- Single column, tabs for Encoder/Decoder
- Emoji picker becomes a modal/drawer
- Floating "Copy" button at bottom
- Reduced padding, optimized touch targets (min 44px)

### Desktop Layout (≥ 1024px)

- Optional: Split view showing both panels
- Keyboard shortcuts enabled
- Hover states fully active
- Expanded stats panel

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/⌘ + E` | Focus Encoder tab |
| `Ctrl/⌘ + D` | Focus Decoder tab |
| `Ctrl/⌘ + Enter` | Execute Encrypt/Decrypt |
| `Ctrl/⌘ + Shift + C` | Copy output to clipboard |
| `Ctrl/⌘ + V` | (In decoder) Auto-paste and detect |
| `Escape` | Clear current input |
| `Tab` | Navigate between inputs |

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

```typescript
// lib/stego.test.ts

describe('encode', () => {
  it('encodes ASCII text correctly', () => {});
  it('handles empty message gracefully', () => {});
  it('validates emoji input', () => {});
  it('generates correct binary mapping', () => {});
  it('wraps with proper delimiters', () => {});
});

describe('decode', () => {
  it('decodes valid payload', () => {});
  it('returns null for clean emoji', () => {});
  it('handles partial/corrupted data', () => {});
  it('strips visible characters correctly', () => {});
});

describe('roundtrip', () => {
  it('encode→decode returns original message', () => {});
  it('handles special characters: !@#$%^&*()', () => {});
  it('handles unicode: 日本語, émojis 🎉', () => {});
  it('handles multi-line messages', () => {});
});
```

### E2E Tests (Playwright)

```typescript
// e2e/dashboard.spec.ts

test('full encode-decode workflow', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="secret-input"]', 'Test message');
  await page.click('[data-testid="emoji-select"]');
  await page.click('text=😈');
  await page.click('[data-testid="encrypt-btn"]');

  const output = await page.textContent('[data-testid="output"]');

  await page.click('[data-testid="decoder-tab"]');
  await page.fill('[data-testid="decode-input"]', output);
  await page.click('[data-testid="decrypt-btn"]');

  await expect(page.locator('[data-testid="revealed-message"]'))
    .toContainText('Test message');
});
```

---

## 🚀 Deployment Checklist

### Pre-Deploy

- [ ] All TypeScript errors resolved
- [ ] Lighthouse score > 90 (Performance, A11y, Best Practices)
- [ ] Mobile responsiveness tested
- [ ] Dark mode tested
- [ ] Clipboard API works on HTTPS
- [ ] Error boundaries in place
- [ ] Analytics configured (optional)

### Vercel Configuration

```json
// vercel.json (if needed)
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

### Environment Variables

```bash
# .env.local (none required for basic functionality)
# Future: Analytics, error tracking
NEXT_PUBLIC_ANALYTICS_ID=
SENTRY_DSN=
```

---

## 📝 Implementation Order

### Phase 1: Foundation (Day 1)

1. Initialize Next.js 16 project with TypeScript
2. Configure Tailwind CSS with custom theme
3. Set up fonts (Inter + JetBrains Mono)
4. Create base layout and global styles

### Phase 2: Core Engine (Day 1-2)

5. Implement `lib/stego.ts` with full encode/decode
6. Write comprehensive unit tests
7. Add hex/binary view utilities

### Phase 3: UI Components (Day 2-3)

8. Build reusable UI primitives (Button, Input, Card, etc.)
9. Create Encoder component
10. Create Decoder component
11. Implement EmojiPicker
12. Add HexViewer component

### Phase 4: Integration (Day 3)

13. Wire up main page with state management
14. Implement clipboard functionality
15. Add toast notifications
16. Implement auto-detect on paste

### Phase 5: Polish (Day 4)

17. Add animations and transitions
18. Implement keyboard shortcuts
19. Mobile optimization
20. Accessibility audit
21. Final testing and deployment

---

## 🎨 CSS Custom Properties (globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --glow-emerald: 0 0 20px rgba(16, 185, 129, 0.3);
    --glow-cyan: 0 0 20px rgba(34, 211, 238, 0.3);
    --glow-red: 0 0 20px rgba(239, 68, 68, 0.3);

    --scanline-color: rgba(0, 255, 0, 0.03);
    --grid-color: rgba(39, 39, 42, 0.5);
  }

  body {
    @apply bg-zinc-950 text-zinc-50 antialiased;
    background-image:
      radial-gradient(circle at 1px 1px, var(--grid-color) 1px, transparent 0);
    background-size: 24px 24px;
  }

  /* Scanline effect (optional, toggle with class) */
  .scanlines::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      var(--scanline-color),
      var(--scanline-color) 1px,
      transparent 1px,
      transparent 2px
    );
    pointer-events: none;
    z-index: 9999;
  }
}

@layer components {
  .glow-emerald {
    box-shadow: var(--glow-emerald);
  }

  .glow-pulse {
    animation: glow-pulse 2s ease-in-out infinite;
  }

  @keyframes glow-pulse {
    0%, 100% { box-shadow: var(--glow-emerald); }
    50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.5); }
  }

  .terminal-text {
    @apply font-mono text-emerald-400;
    text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  }
}
```

---

## 📦 Package.json Dependencies

```json
{
  "dependencies": {
    "next": "^16.1.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0",
    "sonner": "^1.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "vitest": "^2.1.0",
    "@playwright/test": "^1.49.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.1.1"
  }
}
```

---

## ✅ Success Criteria

The implementation is complete when:

1. **Functional**: User can encode any text into any emoji and decode it back perfectly
2. **Robust**: Edge cases handled gracefully with clear error messages
3. **Beautiful**: UI matches the "rogue hacker" aesthetic described above
4. **Performant**: Page loads in < 1s, operations feel instant
5. **Accessible**: Keyboard navigable, screen reader friendly
6. **Mobile-Ready**: Works flawlessly on phones and tablets
7. **Deployable**: One-click Vercel deployment with no configuration

---

*Document Version: 1.0*
*Last Updated: 2026-01-30*
*Author: EvilEmoji Development Team*

