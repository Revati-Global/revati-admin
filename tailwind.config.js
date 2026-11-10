/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F2F1F5',
          100: '#EAE8EF',
          200: '#D9DDE3',
          300: '#B4A8D0',
          400: '#8F7EBA',
          500: '#7664A3',
          600: '#645394', // Revati Primary Ultra Violet
          700: '#524378', // Revati Violet Hover
          800: '#40355D',
          900: '#35313B', // Revati Secondary Dark Charcoal
          950: '#221F26',
        },
        rose: {
          50: '#F2F1F5',
          100: '#EBE8F0',
          200: '#D9DDE3',
          300: '#C2BDD4',
          400: '#9B8EB8',
          500: '#7B6BA0',
          600: '#645394',
          700: '#524378',
          800: '#40355D',
          900: '#35313B',
          950: '#221F26',
        },
        surface: {
          base: '#F2F1F5', // Lavender Grey
          card: '#FFFFFF', // Crisp White
          card2: '#F2F1F5',
          hover: '#F2F1F5',
          border: '#D9DDE3', // Cool Grey
          borderLight: '#D9DDE3',
          muted: '#6b7280',
          dark: '#35313B',
          sidebar: '#35313B',
          sidebarDark: '#28252D',
          sidebarLight: '#524378',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(100, 83, 148, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(100, 83, 148, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px -3px rgba(100, 83, 148, 0.15)',
      }
    },
  },
  plugins: [],
}
