import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#09111f",
        },
        brand: {
          50: "#f2fbff",
          100: "#d8f4ff",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },
      },
      boxShadow: {
        card: "0 12px 30px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(14,165,233,0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(15,23,42,0.08), transparent 28%)",
      },
    },
  },
  plugins: [forms],
};

export default config;
