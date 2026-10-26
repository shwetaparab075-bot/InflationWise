/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        ink: '#1C2340',
        muted: '#6B7280',
        indigo: '#20205A',
        accent: '#16C7D9',
      },
      boxShadow: {
        card: '0 10px 28px rgba(32, 32, 90, 0.06)',
        lift: '0 16px 36px rgba(32, 32, 90, 0.12)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '12px',
        '3xl': '14px',
      },
    },
  },
  plugins: [],
};
