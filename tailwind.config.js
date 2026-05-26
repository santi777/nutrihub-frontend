/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#1a2e1a',
        lime: {
          400: '#2d5a3d',
          500: '#245032',
          600: '#1c3f28',
        },
        dark: {
          900: '#f5f8f5',
          800: '#ffffff',
          700: '#eef4ee',
          600: '#c8ddc8',
          500: '#a8c5a8',
          400: '#88aa88',
        },
        muted: '#6b8f6b',
      },
      fontFamily: {
        display: ['DM Serif Display', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
