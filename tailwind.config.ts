import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        display: ['var(--font-sora)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        // legacy aliases kept so existing class names keep working
        Poppins: ['var(--font-sora)', 'sans-serif'],
        Roboto: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        // Jato brand palette — "Bold & appetizing"
        flame: {
          DEFAULT: '#FF5A1F',
          50: '#FFF1EB',
          100: '#FFE0D2',
          400: '#FF7A47',
          500: '#FF5A1F',
          600: '#E8470F',
          700: '#C23A0C',
        },
        ember: {
          DEFAULT: '#FFB627',
          50: '#FFF6E2',
          400: '#FFC759',
          500: '#FFB627',
        },
        charcoal: {
          DEFAULT: '#1A1410',
          800: '#2A211B',
          700: '#3A2E26',
        },
        cream: {
          DEFAULT: '#FFF8F0',
          100: '#FBEFE3',
        },
        status: {
          preparing: '#F6A609',
          delivered: '#2E8B57',
          paid: '#16A34A',
        },
        // keep `orange-600` referencing the new flame so legacy classes restyle
        orange: {
          400: '#FF7A47',
          600: '#FF5A1F',
        },
        gray: {
          300: '#9C98A6',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
