
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
        'theme-beige': '#F5F5DC',
        'theme-brown': '#5C4033',
        'theme-teal': '#008080',
        'theme-forest': '#228B22',
        'theme-dark-forest': '#1a6b1a'
      },
    },
  },
  plugins: [],
};
