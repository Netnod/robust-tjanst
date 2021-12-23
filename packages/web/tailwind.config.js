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
      white: colors.white,
      indigo: colors.indigo,
      blue: colors.blue,
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
      colors: {
        black: '#090D14',
        peach: '#FFDBC2',
        lightGray: '#090D140D',
        orange: '#E1822F',
        green: '#006C3B',
        red: '#BE0000',
        gray: '#4a4a4a',
        yellow: '#fab900',
        lightGreen: '#2ED320',
        lightRed: '#E22121',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
