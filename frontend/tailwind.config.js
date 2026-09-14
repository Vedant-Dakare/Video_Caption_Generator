/** @type {import('tailwindcss').Config} */
module.exports = {
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
          0: "#FAF9F6",
          1: "#F5F4F2",
          2: "#E8E6E0",
          3: "#D0CEC8",
          4: "#B5B0AA",
        },
        warm: {
          100: "#FAF9F6",
          200: "#E8E6DF",
          300: "#D0CDB8",
          400: "#8A8680",
          500: "#6B6760",
          600: "#525250",
          700: "#2A2A2F",
          800: "#1E1E22",
        },
        mint: { DEFAULT: "#5B9A8B", light: "#7AB5A7" },
        coral: { DEFAULT: "#C45B5B", light: "#D67878" },
        ivory: "#F0EDE8",
        accent: { DEFAULT: "#D4A853" },

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
          soft: "hsl(var(--muted-soft))",
        },
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.05)",
        elevated: "0 8px 30px -8px rgba(20,18,14,0.18)",
        panel: "0 24px 70px -24px rgba(20,18,14,0.45), 0 8px 30px -8px rgba(20,18,14,0.22)",
        "card-up": "0 2px 8px -2px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.3s ease both",
        "scale-in": "scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
