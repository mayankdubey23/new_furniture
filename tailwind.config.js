/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-beige': '#F5F5DC',      // Light cream/beige background ke liye
        'theme-brown': '#5C4033',      // Dark brown text aur borders ke liye
        'theme-teal': '#008080',       // Teal accents aur buttons ke liye
        'theme-forest': '#228B22',     // Forest green highlights ke liye
        'theme-dark-forest': '#1a6b1a' // Hover effects ke liye
      },
    },
  },
  plugins: [],
};
