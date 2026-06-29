/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"',   'monospace'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink:   '#003087',       // Marico deep blue
        panel: '#FFFFFF',
        rim:   '#E2E8F0',
        ember: '#003087',       // repurposed → Marico blue primary
        glow:  '#0B6FCB',
        slate: '#64748B',
        mist:  '#94A3B8',
        snow:  '#0A1628',       // dark text on light bg
        ok:    '#5E9F2B',
        warn:  '#D97706',
        bad:   '#DC2626',
        // New Marico tokens
        'mb':    '#003087',
        'mb-mid':'#0052A5',
        'mb-lt': '#0B6FCB',
        'mg':    '#7DC242',
        'mg-dk': '#5E9F2B',
        'mbg':   '#F4F7FB',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,48,135,0.06), 0 4px 16px rgba(0,48,135,0.04)',
        'card-md': '0 4px 24px rgba(0,48,135,0.10)',
        ember: '0 4px 20px rgba(0,48,135,0.25)',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out both',
        'fade-in': 'fadeIn 0.3s ease-out both',
        'spin-slow': 'spin 1.6s linear infinite',
        'pulse-ring': 'pulseRing 1.8s ease-out infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: 0 },                                 to: { opacity: 1 } },
        pulseRing: {
          '0%':  { transform: 'scale(0.9)', opacity: 0.8 },
          '70%': { transform: 'scale(1.4)', opacity: 0 },
          '100%':{ transform: 'scale(1.4)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
