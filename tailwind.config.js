/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'rubik': ['Rubik', 'sans-serif'],
      },
      colors: {
        // Primary Brand Colors
        'dk-violet': '#36166b',
        'lt-violet': '#6e47ae',
        'dk-purple': '#4d0a55',
        'lt-purple': '#a737b4',
        'dk-blurple': '#4e2a9a',
        'blurple': '#7553ff',
        'lt-blurple': '#9e86ff',
        'rich-black': '#181225',
        
        // Secondary Brand Colors
        'dk-pink': '#ff45a8',
        'lt-pink': '#ff70bc',
        'dk-orange': '#ee8019',
        'lt-orange': '#ff9838',
        'dk-yellow': '#fdb81b',
        'lt-yellow': '#ffd00e',
        
        // Tertiary Brand Colors
        'dk-green': '#92dd00',
        'lt-green': '#c0ed49',
        'dk-blue': '#226dfc',
        'lt-blue': '#3edcff',
        
        // Background
        'bg-grey': '#f6f6f8',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(117, 83, 255, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(117, 83, 255, 0.8)' }
        }
      }
    },
  },
  plugins: [],
}
