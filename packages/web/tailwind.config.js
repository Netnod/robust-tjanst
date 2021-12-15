const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['src/views/**/*.pug'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ['Roboto'],
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      indigo: colors.indigo,
      blue: colors.blue,
      gray: {
        DEFAULT: '#4a4a4a',
      },
      yellow: {
        DEFAULT: '#fab900',
      },
      green: {
        DEFAULT: '#2ED320',
      },
      red: {
        DEFAULT: '#E22121',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
