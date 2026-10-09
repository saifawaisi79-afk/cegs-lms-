/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Foundation Background System
        background: '#F7F8F6',
        surface: '#FFFFFF',
        'surface-muted': '#F1F4F2',
        'surface-tinted': '#EEF8F6',

        // Typography Hierarchy
        foreground: '#17202A',
        'foreground-muted': '#52606D',
        'foreground-subtle': '#7B8794',
        heading: '#111827',

        // Primary Brand Teal (Foundation: #0F8F87)
        brand: {
          50: '#F2FBFA',  // Very soft teal
          100: '#E8F7F5', // Soft teal
          200: '#C5EDE8',
          300: '#90DCD4',
          400: '#4EC1B6',
          500: '#0F8F87', // Primary CEGS Teal
          600: '#0D7A73', // Primary hover
          700: '#0A615B', // Primary active / dark
          800: '#094E4A',
          900: '#073F3C',
          dark: '#052A28',
        },
        'secondary-teal': '#16A89F',
        'soft-teal': '#E8F7F5',
        'very-soft-teal': '#F2FBFA',

        // Subtle Border System
        border: {
          DEFAULT: '#E2E8E5',
          soft: '#EDF1EF',
          input: '#DDE5E1',
          subtle: '#EDF1EF',
          strong: '#D0CDC4',
        },

        // Refined Charcoal & Ivory Aliases for Compatibility
        charcoal: {
          DEFAULT: '#17202A',
          50: '#F7F8F9',
          100: '#E8EAED',
          200: '#CFD4D9',
          300: '#9BA5B0',
          400: '#677482',
          500: '#52606D',
          600: '#323C47',
          700: '#232B33',
          800: '#192027',
          900: '#17202A',
          950: '#111827',
        },
        ivory: {
          DEFAULT: '#F7F8F6',
          50: '#FAFBF9',
          100: '#F7F8F6',
          200: '#F1F4F2',
          300: '#E8ECE9',
          400: '#DDD9CD',
        },

        // Premium Gold Accent (Certifications, Milestones)
        gold: {
          DEFAULT: '#C9A227',
          soft: '#FBF4D8',
          hover: '#B58E1E',
          50: '#FDFBF0',
          100: '#FBF4D8',
          500: '#C9A227',
          600: '#B58E1E',
        },

        // Status Colors (Strictly Functional)
        success: {
          DEFAULT: '#16A34A',
          soft: '#ECF9F0',
          dark: '#15803D',
        },
        warning: {
          DEFAULT: '#D97706',
          soft: '#FFF7E8',
          dark: '#B45309',
        },
        error: {
          DEFAULT: '#DC2626',
          soft: '#FEF0F0',
          dark: '#B91C1C',
        },
        info: {
          DEFAULT: '#2563EB',
          soft: '#EFF5FF',
          dark: '#1D4ED8',
        },

        navy: {
          800: '#0F1A24',
          900: '#0B131B',
          950: '#060B10',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(23, 32, 42, 0.04)',
        'header': '0 1px 3px 0 rgba(23, 32, 42, 0.04)',
        'card': '0 1px 3px 0 rgba(23, 32, 42, 0.04), 0 1px 2px -1px rgba(23, 32, 42, 0.02)',
        'card-hover': '0 8px 20px -4px rgba(15, 143, 135, 0.08), 0 2px 6px -1px rgba(23, 32, 42, 0.04)',
        'dropdown': '0 10px 25px -3px rgba(23, 32, 42, 0.08), 0 4px 6px -2px rgba(23, 32, 42, 0.03)',
        'editorial': '0 4px 20px -2px rgba(23, 32, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
