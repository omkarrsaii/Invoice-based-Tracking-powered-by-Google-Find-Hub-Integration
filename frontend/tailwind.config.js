/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"',   'monospace'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        m: {
          blue:       '#1467B2',
          'blue-mid': '#0052A5',
          'blue-lt':  '#0B6FCB',
          'blue-50':  '#EBF3FF',
          'blue-100': '#CCDFF8',
          green:      '#7DC242',
          'green-dk': '#5E9F2B',
          'green-50': '#F0F9E8',
          'green-100':'#D4EDBB',
          bg:         '#F4F7FB',
          surface:    '#FFFFFF',
          border:     '#E2E8F0',
          'border-dk':'#CBD5E1',
          text:       '#0A1628',
          sub:        '#334155',
          muted:      '#64748B',
          red:        '#DC2626',
          'red-50':   '#FEF2F2',
          amber:      '#D97706',
          'amber-50': '#FFFBEB',
        },
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,48,135,0.06), 0 4px 16px rgba(0,48,135,0.04)',
        'card-hover': '0 4px 12px rgba(0,48,135,0.10), 0 8px 24px rgba(0,48,135,0.06)',
        header: '0 1px 0 #E2E8F0, 0 2px 8px rgba(0,48,135,0.04)',
      },
      animation: {
        'fade-in':  'fadeIn  0.35s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 },                               to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
