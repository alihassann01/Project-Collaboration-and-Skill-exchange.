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
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd',
          300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9',
          600: '#0284c7', 700: '#0369a1',
        },
        employer: {
          50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe',
          300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6',
          600: '#7c3aed', 700: '#6d28d9',
        },
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(0,0,0,0.05), 0 4px 24px rgba(0,0,0,0.07)',
        'card-hover': '0 0 0 1px rgba(49,121,255,0.18), 0 12px 40px rgba(49,121,255,0.14)',
        'glow': '0 0 0 3px rgba(49,121,255,0.25)',
        'glow-student': '0 0 0 3px rgba(14,165,233,0.25)',
        'glow-employer': '0 0 0 3px rgba(139,92,246,0.25)',
        'inner-sm': 'inset 0 1px 3px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-student': 'linear-gradient(135deg, #0ea5e9 0%, #3179ff 100%)',
        'hero-employer': 'linear-gradient(135deg, #8b5cf6 0%, #1a57f5 100%)',
        'hero-admin': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        'mesh': 'radial-gradient(at 20% 20%, rgba(49,121,255,0.12) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(99,102,241,0.10) 0px, transparent 50%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fadeIn 0.3s ease both',
        'slide-left': 'slideLeft 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
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
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
