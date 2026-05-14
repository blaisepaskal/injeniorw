/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // InjenioRw Brand — deep forest + volcanic earth + Rwanda sky
        brand: {
          50:  '#f0faf4',
          100: '#d8f3e3',
          200: '#b4e8c9',
          300: '#7dd4a8',
          400: '#44b882',
          500: '#1f9963',  // Primary green (lush Rwanda)
          600: '#167a4e',
          700: '#13613e',
          800: '#124d34',
          900: '#10402c',
          950: '#072419',
        },
        earth: {
          50:  '#fdf8f0',
          100: '#faefd8',
          200: '#f4dab0',
          300: '#ecbe7d',
          400: '#e39b48',
          500: '#d97f27',  // Volcanic earth / warm accent
          600: '#c06418',
          700: '#9f4d16',
          800: '#813f19',
          900: '#6a3518',
          950: '#3a1a0a',
        },
        rwandan: {
          blue:   '#0057A4',  // Rwanda flag blue
          yellow: '#FAD201',  // Rwanda flag yellow
          green:  '#20603D',  // Rwanda flag green
        },
        surface: {
          DEFAULT: '#0d1117',
          card:    '#161b24',
          border:  '#21262d',
          hover:   '#1c2230',
        },
      },
      fontFamily: {
        display: ['var(--font-cabinet)', 'Georgia', 'serif'],
        body:    ['var(--font-satoshi)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'mesh-brand': 'radial-gradient(at 20% 30%, #1f9963 0px, transparent 50%), radial-gradient(at 80% 0%, #13613e 0px, transparent 50%), radial-gradient(at 60% 80%, #072419 0px, transparent 50%)',
        'mesh-dark':  'radial-gradient(at 0% 50%, #161b24 0px, transparent 60%), radial-gradient(at 100% 20%, #0d1117 0px, transparent 60%)',
        'grid-pattern': 'linear-gradient(rgba(31,153,99,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(31,153,99,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-in-r': 'slideInRight 0.5s ease forwards',
        'float':      'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
        'spin-slow':  'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(31,153,99,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(31,153,99,0.6)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'brand':     '0 0 40px rgba(31,153,99,0.2)',
        'brand-lg':  '0 0 80px rgba(31,153,99,0.3)',
        'card':      '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':'0 8px 40px rgba(0,0,0,0.6)',
        'glow-green':'0 0 30px rgba(31,153,99,0.5)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
