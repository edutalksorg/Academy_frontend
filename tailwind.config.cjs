const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#DC2626' // Red-600
        },
        emerald: colors.red,
        teal: colors.red,
      }
    }
  },
  plugins: []
};
