/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#9A7ADC",
        secondary: "#38bdf8",
        accent: "#f472b6",
        background: "#171717",
        surface: "#262626",
        text: "#FFFFFF",
        textSecondary: "#A3A3A3",
        border: "#2F2F2F",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'hero-pattern': 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)'
      }
    },
  },
  plugins: [],
}
