/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [],
  theme: {
    extend: {
      container: {
        center: true,
        screens: {
          sm: "100%",
          md: "100%",
          lg: "1024px",
          xl: "1110px",
          "2xl": "1320px",
        },
      },
      screens: {
        // xl: '1400px',
        "2xs": "320px",
        xs: "375px",
        "3sm": "425px",
        "2sm": "535px",
        "1lg": "1110px",
        "2lg": "1320px",
      },
      colors: {
        baseBlue: {
          200: "#E4F0FC",
          250: "#EBF6FA",
          500: "#0083e3",
        },
      },
      keyframes: {
        basePulse: {
          "0%, 100% ": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.5",
          },
        },
      },
      animation: {
        basePulse: "basePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
