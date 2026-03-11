import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-deep)",
        foreground: "#F9FAFB",
        "accent-green": "#4ADE80",
        "accent-blue": "#38BDF8",
        "accent-red": "#F87171",
        "accent-purple": "#8B5CF6",
        "bg-deep": "#060B16",
        "bg-surface": "#0E1628",
        "text-primary": "#F9FAFB",
        "text-muted": "#9CA3AF",
      },
      animation: {
        "fade-in": "fadeIn 220ms ease forwards",
        "slide-up": "slideUp 220ms ease forwards",
        "scale-in": "scaleIn 200ms ease forwards",
        "count-up": "countUp 400ms ease forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        countUp: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(74, 222, 128, 0.2)" },
          "50%": { boxShadow: "0 0 25px rgba(74, 222, 128, 0.5)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
        glass: "20px",
      },
      borderRadius: {
        glass: "24px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.45)",
        "glass-hover": "0 12px 40px rgba(0, 0, 0, 0.55)",
        "glow-green": "0 0 20px rgba(74, 222, 128, 0.35)",
        "glow-blue": "0 0 20px rgba(56, 189, 248, 0.3)",
        "glow-red": "0 0 20px rgba(248, 113, 113, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
