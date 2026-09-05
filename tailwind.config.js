/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#10B981",
        secondary: "#0B1220",
        surface: "#0F172A",
        border: "#1E293B",
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
        }
      },
    },
  },
  plugins: [],
}
