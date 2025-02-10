/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-orange': '#EB922C',
        'custom-blue' : '#E1F5FE',
        'custom-gray' : '#D9D9D9',
        'custom-blue2' : '#0E0069',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["lofi"],
  },
}
