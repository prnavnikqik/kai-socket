/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'teams-bg': 'var(--color-bg)',
        'teams-surface': 'var(--color-surface)',
        'teams-primary': 'var(--color-primary)',
        'teams-secondary': 'var(--color-secondary)',
        'teams-border': 'var(--color-border)',
        'teams-text-primary': 'var(--color-text-primary)',
        'teams-text-secondary': 'var(--color-text-secondary)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};