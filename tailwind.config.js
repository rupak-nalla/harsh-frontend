/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFF8F3',
        primary: '#8B2E2E',
        secondary: '#C65D3A',
        accent: '#F3D9C3',
        text: '#2D2D2D',
        muted: '#777777',
        card: '#FFFFFF',
        border: '#EFE6DF',
        hover: '#A43C3C',
      },
      boxShadow: {
        card: '0 10px 30px rgba(0,0,0,0.06)',
        hero: '0 25px 70px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        section: '32px',
        card: '20px',
        full: '999px',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      
    },
  },
  plugins: [],
};
