/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      colors: {
        ink: {
          900: '#0D0D0D',
          800: '#1A1A1A',
          700: '#2A2A2A',
          600: '#3D3D3D',
          400: '#6B6B6B',
          200: '#B0B0B0',
          100: '#D4D4D4',
          50:  '#F0F0F0',
        },
        amber: {
          400: '#F5A623',
          500: '#E8960F',
          600: '#C97D00',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.35s ease forwards',
        'pulse-dot': 'pulseDot 1.2s ease-in-out infinite',
        'cursor-blink': 'cursorBlink 0.7s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
          '50%':       { opacity: 1,   transform: 'scale(1.2)' },
        },
        cursorBlink: {
          '0%, 100%': { opacity: 1 },
          '50%':       { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
