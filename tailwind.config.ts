import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-deep": "var(--bg-deep)",
        surface: "var(--surface)",
        "surface-alt": "var(--surface-alt)",
        ink: "var(--ink)",
        ink2: "var(--ink2)",
        muted: "var(--muted)",
        muted2: "var(--muted2)",
        hairline: "var(--hairline)",
        "hairline-strong": "var(--hairline-strong)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        "accent-ink": "var(--accent-ink)",
        "accent-wash": "var(--accent-wash)",
        lime: "#D8FF3D",
        "lime-soft": "#F0FFB8",
        "lime-ink": "#1A1F00",
        "lime-wash": "#F7FFD9",
        plum: "#6B2BC2",
        "plum-soft": "#EEE2FF",
        "plum-ink": "#1C0338",
        "plum-wash": "#F7F0FF",
        magenta: "#E5199F",
        "magenta-soft": "#FFE0F2",
        success: "#1F8A4C",
        warning: "#B8760E",
        danger: "#C53030",
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "22px",
        xl: "28px",
        "2xl": "32px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,15,14,0.04), 0 8px 24px -12px rgba(15,15,14,0.12)",
        lift: "0 2px 4px rgba(15,15,14,0.06), 0 20px 50px -20px rgba(15,15,14,0.24)",
        hair: "0 1px 2px rgba(15,15,14,0.04)",
      },
      fontFamily: {
        display: ["var(--font-geist)", "Inter", "system-ui", "sans-serif"],
        sans: ["var(--font-geist)", "Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "Menlo", "monospace"],
      },
      maxWidth: {
        mobile: "440px",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 300ms ease-out both",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
