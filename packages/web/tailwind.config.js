const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['src/views/**/*.pug'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ['Roboto'],
    },
    extend: {
      fontSize: {
        xl: ['4rem', '1.25'],
        h1: ['2.5rem', '1.25'],
        h2: ['2rem', '1.5'],
        h3: ['1.75rem', '1.5'],
        h4: ['1.5rem', '1.5'],
        p: ['1.25rem', '1.75rem'],
      },
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      indigo: colors.indigo,
      red: colors.rose,
      blue: colors.blue,
      gray: {
        DEFAULT: '#4a4a4a',
      },
      yellow: {
        DEFAULT: '#fab900',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
