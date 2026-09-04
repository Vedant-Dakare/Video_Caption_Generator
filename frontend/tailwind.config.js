/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        surface: {
          0: "#0C0C0F",
          1: "#131316",
          2: "#1A1A1F",
          3: "#222228",
          4: "#2A2A30",
        },
        accent: {
          DEFAULT: "#D4A853",
          50: "#FBF5E6",
          10: "#F5E8C4",
          20: "#E8D49E",
          30: "#D4A853",
          40: "#C49A45",
          50: "#B08A3A",
          60: "#8C6E2E",
          70: "#695323",
        },
        mint: {
          DEFAULT: "#5B9A8B",
          light: "#7AB5A7",
        },
        coral: {
          DEFAULT: "#C45B5B",
          light: "#D67878",
        },
        ivory: "#F0EDE8",
        warm: {
          100: "#F0EDE8",
          200: "#D5D0C8",
          300: "#8A8680",
          400: "#6B6760",
          500: "#4A4740",
          600: "#353230",
          700: "#2A2A2F",
          800: "#1E1E22",
        },
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.4)",
        elevated: "0 8px 32px -8px rgba(0,0,0,0.5)",
        "card-up": "0 2px 8px -2px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.4s ease-out both",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-right": "slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-slow": "pulse 2.5s ease-in-out infinite",
        waveform: "waveform 1.2s ease-in-out infinite",
        tick: "tick 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        waveform: {
          "0%, 100%": { height: "3px" },
          "50%": { height: "16px" },
        },
        tick: {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
