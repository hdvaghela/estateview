/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12202B',
        slate: { 500: '#5B6B77' },
        mist: '#EEF1F3',
        paper: '#F7F8F9',
        line: '#D9DFE3',
        pine: { DEFAULT: '#1D6B57', dark: '#14503F', soft: '#DCEBE5' },
        brass: { DEFAULT: '#F2C14E', soft: '#FBEBC0' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(18,32,43,.06), 0 8px 24px -12px rgba(18,32,43,.18)',
      },
    },
  },
  plugins: [],
};
