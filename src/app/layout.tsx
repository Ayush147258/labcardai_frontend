// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — Root Layout
// Light theme: #FFFFFF bg, #0A1628 text, #00D4AA teal accent
// Plus Jakarta Sans via next/font (no external Google Fonts link needed)
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Geist } from 'next/font/google';
// @ts-ignore: side-effect import for global stylesheet
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// ── Font — loaded via next/font (auto-optimised, no CLS) ─────────────────────
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display:  'swap',
});

// ── Metadata ──────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title:       'LabCard AI — Visual Health Cards for India',
  description: 'Upload any Indian lab report PDF and get a visual health card, biological age estimate, and Hindi AI chat in 10 seconds.',
  keywords:    'lab report, blood test, AI health, India, Thyrocare, Dr Lal, Apollo, biological age, Hindi',
  openGraph: {
    title:       'LabCard AI — Your Lab Report, Finally Understood',
    description: 'Visual. Vernacular. Verifiable. India\'s AI-powered health card.',
    type:        'website',
  },
  twitter: {
    card:        'summary',
    title:       'LabCard AI',
    description: 'Upload any Indian lab PDF — get a visual health card in 10 seconds.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Upload any Indian lab report PDF and get a visual health card, biological age estimate, and Hindi AI chat in 10 seconds."
        />
        <title>LabCard AI — Visual Health Cards for India</title>
      </head>
      <body
        className={plusJakartaSans.className}
        style={{
          // Light theme body — matches labcardai.vercel.app
          background: '#FFFFFF',
          color:      '#0A1628',
          margin:     0,
          minHeight:  '100vh',
        }}
      >
        {children}
        {/* NO Razorpay script here — loaded dynamically in /pricing only */}
      </body>
    </html>
  );
}
