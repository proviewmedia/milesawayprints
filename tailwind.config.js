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
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Core ink (near-black, slightly warm)
        ink: {
          DEFAULT: '#0e0e0e',
          light: '#3a3a3a',
        },
        paper: '#ffffff',
        // Warm off-white card / section surfaces (replaces cool blue-gray)
        soft: {
          DEFAULT: '#f5f3ef',
          2: '#efece6',
        },
        // Primary CTA = black (was bright purple)
        primary: {
          DEFAULT: '#0e0e0e',
          light: '#f5f3ef',
          dark: '#000000',
        },
        // Sale / urgency accent (use sparingly — only when there's an actual sale)
        accent: {
          DEFAULT: '#d92f2f',
          light: '#fdecec',
        },
        // Soft pastel section washes (kept for variety; muted)
        mint: {
          DEFAULT: '#7a9b7c',
          light: '#e7ede5',
        },
        coral: {
          DEFAULT: '#c4685c',
          light: '#f3e2dc',
        },
        warm: {
          DEFAULT: '#b08a4a',
          light: '#f3e9d8',
        },
        lavender: {
          DEFAULT: '#a78bfa',
          light: '#ece5f8',
        },
        // Text / borders
        mid: '#6b6b6b',
        'light-mid': '#9c9c9c',
        border: '#e8e6e0',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
};
