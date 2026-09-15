/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Mirrors src/theme/colors.js — keep the two in sync. `primary`,
      // `secondary`, `surface`, `border` and `text.*` are the original
      // aliases (still used across the app); everything else namespaces
      // the remaining theme tokens so every screen can use className
      // instead of reaching into the JS theme object.
      colors: {
        primary: "#10B981",
        secondary: "#0B1220",
        surface: "#0F172A",
        "surface-raised": "#151E32",
        border: "#1E293B",
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          "on-accent": "#0B1220",
        },
        accent: {
          primary: "#10B981",
          muted: "#065F46",
        },
        status: {
          danger: "#EF4444",
          warning: "#F59E0B",
          info: "#3B82F6",
          success: "#10B981",
        },
        fdr: {
          1: "#10B981",
          2: "#84CC16",
          3: "#94A3B8",
          4: "#F59E0B",
          5: "#EF4444",
        },
      },
    },
  },
  plugins: [],
}
