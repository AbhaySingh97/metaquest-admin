/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#070A12",
        surface: "#0D1322",
        border: "rgba(255, 255, 255, 0.1)",
      },
    },
  },
  plugins: [],
};
