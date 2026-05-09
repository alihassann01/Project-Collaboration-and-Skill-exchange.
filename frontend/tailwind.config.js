export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef6ff', 100: '#d9eaff', 200: '#bcd8ff',
          300: '#8ec0ff', 400: '#599eff', 500: '#3179ff',
          600: '#1a57f5', 700: '#1342e1', 800: '#1637b6',
          900: '#18338f', 950: '#142057',
        },
        student: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0',
          300: '#6ee7b7', 400: '#34d399', 500: '#10b981',
          600: '#059669', 700: '#047857',
        },
        employer: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1',
          600: '#4f46e5', 700: '#4338ca',
        },
      },
      boxShadow: {
        'card':        '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover':  '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        'card-active': '0 2px 8px rgba(0,0,0,0.08)',
        'glow':          '0 0 0 3px rgba(49,121,255,0.25)',
        'glow-student':  '0 0 20px rgba(16,185,129,0.20), 0 0 0 3px rgba(16,185,129,0.15)',
        'glow-employer': '0 0 20px rgba(99,102,241,0.20), 0 0 0 3px rgba(99,102,241,0.15)',
        'glow-admin':    '0 0 20px rgba(245,158,11,0.20), 0 0 0 3px rgba(245,158,11,0.15)',
        'inner-sm':      'inset 0 1px 3px rgba(0,0,0,0.06)',
        'inner-soft':    'inset 0 2px 6px rgba(0,0,0,0.04)',
        'elevated':      '0 20px 60px rgba(0,0,0,0.12)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(var(--tw-gradient-stops))',
        'hero-student':    'linear-gradient(135deg, #059669 0%, #10b981 50%, #3179ff 100%)',
        'hero-employer':   'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #3179ff 100%)',
        'hero-admin':      'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        'mesh':            'radial-gradient(at 20% 20%, rgba(49,121,255,0.12) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(99,102,241,0.10) 0px, transparent 50%)',
        'mesh-hero':       'radial-gradient(at 0% 0%, rgba(16,185,129,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(99,102,241,0.15) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(49,121,255,0.08) 0px, transparent 50%)',
        'shimmer-gradient':'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      },
      animation: {
        'fade-up':        'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':        'fadeIn 0.3s ease both',
        'slide-left':     'slideLeft 0.25s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out both',
        'scale-in':       'scaleIn 0.2s ease both',
        'shimmer':        'shimmer 1.8s linear infinite',
        'float':          'float 6s ease-in-out infinite',
        'pulse-soft':     'pulseSoft 2s ease-in-out infinite',
        'spin-slow':      'spin 1s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideLeft: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
