/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF9F6',
        charcoal: '#1C1C1C',
        terracotta: '#E8612A',
        sage: '#7C9E87',
        'sage-light': '#E8F0EA',
        'warm-gray': '#F0EEEB',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'stamp': {
          '0%': { transform: 'scale(2.5) rotate(-15deg)', opacity: '0' },
          '60%': { transform: 'scale(0.9) rotate(3deg)', opacity: '1' },
          '80%': { transform: 'scale(1.05) rotate(-1deg)' },
          '100%': { transform: 'scale(1) rotate(-3deg)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'stamp': 'stamp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
