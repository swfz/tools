module.exports = {
  mode: 'jit',
  content: ['./pages/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
