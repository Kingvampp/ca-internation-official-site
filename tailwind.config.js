/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        md: '1.5rem',
        lg: '2rem'
      }
    },
    extend: {
      colors: {
        // Refined BMW M Colors with exact hex codes
        'bmw-blue': '#81C4FF', // BMW M Light Blue
        'bmw-darker-blue': '#16588E', // BMW M Darker Blue
        'bmw-dark-blue': '#000F2C', // BMW M Dark Blue/Navy
        'bmw-red': '#E7222E', // BMW M Red
        'bmw-grey': '#333333', // Dark Grey for carbon fiber accents
        // Updated primary colors to match BMW theme
        primary: '#81C4FF', // BMW M Light Blue
        'primary-light': '#A5D3FF', // Lighter shade of BMW Blue
        'primary-dark': '#16588E', // Darker BMW Blue
        secondary: '#e0e0e0',
        accent: '#E7222E', // BMW M Red
        'accent-secondary': '#4D79FF',
        gold: '#FFD700',
        light: '#F8FAFC',
        dark: '#1A1A1A',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'sans-serif'],
      },
      textShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
        'DEFAULT': '0 2px 4px rgba(0, 0, 0, 0.4)',
        'lg': '0 4px 8px rgba(0, 0, 0, 0.4)',
      },
      boxShadow: {
        'car': '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        'car-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 1.5s ease-in-out forwards',
        'scale-in': 'scaleIn 1s ease-in-out forwards',
        'slide-in': 'slideIn 1s ease-in-out forwards',
        'speed-meter': 'speedMeter 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        speedMeter: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'racing-stripe': 'url("/images/textures/racing-stripes.svg")',
        'carbon-fiber': 'url("/images/textures/carbon-fiber.svg")',
        'carbon-fiber-light': 'url("/images/textures/carbon-fiber.svg")',
        'diagonal-stripes': 'url("/images/textures/diagonal-stripes.svg")',
        'checkered-flag': 'url("/images/textures/checkered-flag.svg")',
        'tire-tread': 'url("/images/textures/tire-tread.svg")',
      },
      opacity: {
        '15': '0.15',
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: theme('textShadow.DEFAULT'),
        },
        '.text-shadow-sm': {
          textShadow: theme('textShadow.sm'),
        },
        '.text-shadow-lg': {
          textShadow: theme('textShadow.lg'),
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} 