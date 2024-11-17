/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '360px',
      sm: '500px',
      xlsm: '600px',
      xsmd: '700px',
      md: '780px',
      lgmd: '860px',
      xlmd: '1000px',
      lg: '1100px',
    },
    colors: {
      'light-grey': '#b2b2b2',
      grey: '#f5f5f5',
      red: '#ff0000',
      black: '#000',
      white: '#fff',
      save: '#0088cb',
      blue: '#0369fb',
      'light-blue': '#0369fb1a',
    },
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
    },
    extend: {
      transitionDuration: {
        400: '400ms',
      },
      colors: {
        opague: 'rgba(0,0,0,0.5)',
      },
      rotate: {
        270: '270deg',
      },
    },
  },
  plugins: [],
};
