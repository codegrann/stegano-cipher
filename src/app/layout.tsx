import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EvilEmoji — Zero-Width Steganography Terminal",
  description: "Hide secret messages inside normal text and emojis using invisible zero-width Unicode characters. Encode, decode, and detect hidden payloads that are completely invisible to the human eye.",
  keywords: [
    "steganography", "zero-width", "unicode", "secret messages", "emoji",
    "hidden text", "invisible characters", "text steganography", "zero-width space",
    "ZWNJ", "ZWS", "covert communication", "data hiding", "OSINT", "cybersecurity",
    "infosec", "open source", "stego tool",
  ],
  authors: [{ name: "ariacodez", url: "https://instagram.com/ariacodez" }],
  openGraph: {
    title: "EvilEmoji — Hide Messages in Plain Sight",
    description: "Zero-width steganography tool. Hide entire secret messages inside normal text or emojis using invisible Unicode characters. Open source.",
    type: "website",
    siteName: "EvilEmoji",
  },
  twitter: {
    card: "summary_large_image",
    title: "EvilEmoji — Hide Messages in Plain Sight",
    description: "Zero-width steganography tool. Hide secret messages inside normal text or emojis using invisible Unicode characters.",
    creator: "@AriaCodezz",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: '#18181b',
              border: '1px solid #27272a',
              color: '#fafafa',
              fontFamily: 'var(--font-mono)',
            },
            className: 'font-mono',
          }}
        />
      </body>
    </html>
  );
}
