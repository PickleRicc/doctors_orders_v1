/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Primary colors from style guide
        blue: {
          primary: '#007AFF', // Apple Blue per style guide
          light: 'rgba(0, 122, 255, 0.1)',
          dark: '#0056b3', // Darker shade of Apple Blue
        },
        // Glassmorphism palette
        glass: {
          light: 'rgba(255, 255, 255, 0.25)',
          medium: 'rgba(255, 255, 255, 0.18)',
          dark: 'rgba(0, 0, 0, 0.05)',
        },
        // Notion-inspired neutral palette
        white: '#ffffff',
        black: '#000000',
        grey: {
          50: '#fbfbfa',
          100: '#f1f1ef',
          300: '#e9e9e7',
          500: '#a8a29e',
          700: '#454440',
          900: '#1f1f1f',
        },
        // UI semantic colors
        background: '#fbfbfa', // Notion Grey 50
        foreground: '#1f1f1f', // Notion Grey 900
        primary: '#007AFF',    // Apple Blue
        muted: '#f1f1ef',      // Notion Grey 100
        'muted-foreground': '#a8a29e', // Notion Grey 500
        border: '#e9e9e7',     // Notion Grey 300
        input: '#f3f4f6',      // Grey 100
        ring: '#3b82f6',       // Info blue
        // Semantic status colors
        success: '#10b981',    // Success green
        warning: '#f59e0b',    // Warning amber
        error: '#ef4444',      // Error red
        info: '#3b82f6',       // Info blue
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        'md': '0.375rem',
        'sm': '0.25rem',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        DEFAULT: 'var(--backdrop-blur)', // 20px from style guide
        'lg': '32px',
      },
      backgroundImage: {
        'blue-gradient': 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
      },
    },
  },
  plugins: [],
}
