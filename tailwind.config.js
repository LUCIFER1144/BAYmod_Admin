/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. 'Content' should be 'content' (lowercase 'c')
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}", // Added pages folder, if you have it
    "./components/**/*.{js,ts,jsx,tsx}",
    // Make sure to include all directories where you use Tailwind classes
  ],
  theme: {
    // 2. 'extends' should be 'extend'
    extend: {
      // 3. You need to define your 'colors' here
      colors: {
        primary: '#1E3A8A', // Define your custom 'primary' color (example hex code)
        highlight: '#eae8fb',
        bgGray: 'fbfafd',
      },
    },
  },
  // 4. 'Plugin' should be 'plugins' (lowercase 'p')
  plugins: [],
}
