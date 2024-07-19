/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        'blue-focus': '#155c9a',
        'custome-gray': {
          light: '#2b2b2b',
          dark: '#1f1f1f',
          sider: '#2b2b2b',
          focus: '#383838',
        },
      },
    },
  },
  plugins: [],
};
