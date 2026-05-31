import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // LabCard AI Design System — LIGHT THEME
        // Primary background: white/cream
        // Accent: teal #00D4AA
        teal: {
          50:  '#F0FEFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#00D4AA',  // PRIMARY ACCENT
          600: '#00C49A',
          700: '#00A882',
          800: '#00876A',
          900: '#006B54',
        },
        brand: {
          teal:    '#00D4AA',
          tealDim: 'rgba(0, 212, 170, 0.10)',
          tealBorder: 'rgba(0, 212, 170, 0.20)',
          navy:    '#0A1628',
          text:    '#0A1628',
          muted:   '#64748B',
          bg:      '#FFFFFF',
          bgTint:  '#F8FFFE',
          bgCard:  '#FFFFFF',
          border:  '#E8F5F2',
          borderGray: '#F1F5F9',
        },
        status: {
          green:   '#16A34A',
          greenBg: 'rgba(22,163,74,0.08)',
          red:     '#DC2626',
          redBg:   'rgba(220,38,38,0.08)',
          amber:   '#D97706',
          amberBg: 'rgba(217,119,6,0.08)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        card:   '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)',
        cardMd: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
        teal:   '0 4px 14px 0 rgba(0,212,170,0.25)',
      },
      animation: {
        'fade-up':    'fadeUp 0.35s ease-out forwards',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'spin-slow':  'spin 1s linear infinite',
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
