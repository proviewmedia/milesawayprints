/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#1a1a2e',
          light: '#3d3d56',
        },
        paper: '#ffffff',
        soft: {
          DEFAULT: '#f7f8fc',
          2: '#f0f2f8',
        },
        primary: {
          DEFAULT: '#4f6df5',
          light: '#e8ecfe',
          dark: '#3a54d4',
        },
        mint: {
          DEFAULT: '#34d399',
          light: '#d1fae5',
        },
        coral: {
          DEFAULT: '#f87171',
          light: '#fee2e2',
        },
        warm: {
          DEFAULT: '#fbbf24',
          light: '#fef3c7',
        },
        lavender: {
          DEFAULT: '#a78bfa',
          light: '#ede9fe',
        },
        mid: '#7c7e96',
        'light-mid': '#a9abbc',
        border: '#e8eaf0',
      },
      borderRadius: {
        xl: '20px',
        '2xl': '28px',
      },
    },
  },
  plugins: [],
};
