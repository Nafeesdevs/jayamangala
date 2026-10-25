/** @type {import('tailwindcss').Config} */
// ──────────────────────────────────────────────────────────────
// THEME – taken from the Google AI Studio design (Jayamangala Agro Foods)
//   primary   = brand red   #a31c1e  (buttons, prices, highlights)
//   secondary = forest green #183a2b (footer, admin sidebar, success)
//   gold      = #dfa839  (badges, sparkles)
//   cream     = #fcf8f2  (page background)
// Fonts: Playfair Display (headings) · Plus Jakarta Sans (body) · Caveat (hand-written notes)
// ──────────────────────────────────────────────────────────────
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Tamil"', "system-ui", "sans-serif"],
        display: ['"Playfair Display"', '"Noto Sans Tamil"', "Georgia", "serif"],
        serif: ['"Playfair Display"', '"Noto Sans Tamil"', "Georgia", "serif"],
        script: ['"Caveat"', '"Noto Sans Tamil"', "cursive"],
      },
      colors: {
        primary: {
          50: "#fae8e9", 100: "#f6d3d4", 200: "#eeaaac", 300: "#e17a7d", 400: "#cc4a4d",
          500: "#b52b2e", 600: "#a31c1e", 700: "#861517", 800: "#6a1012", 900: "#470b0c",
        },
        gold: { 300: "#efd08e", 400: "#dfa839", 500: "#c98f1f", 600: "#a8750f" },
        cream: { DEFAULT: "#fcf8f2", deep: "#f3e9da", sand: "#ebdccd" },
        secondary: {
          50: "#eaf4ee", 100: "#d5e9de", 200: "#aed2bf", 300: "#7fb59b", 400: "#4d9373",
          500: "#2f7458", 600: "#215640", 700: "#183a2b", 800: "#10261c", 900: "#0a1a12",
        },
        ink: { DEFAULT: "#242b26", soft: "#4b5b4f", faint: "#8a978d", line: "#ebdccd", wash: "#f7f1e8" },
        sage: "#dbe8d6", peach: "#f7d9c6", lilac: "#e5dcf0", butter: "#f8e7a8", blush: "#f6d0cf",
      },
      boxShadow: {
        card: "0 1px 2px rgba(60,40,20,.05), 0 8px 24px rgba(60,40,20,.06)",
        lift: "0 22px 54px rgba(60,28,16,.18)",
        glow: "0 12px 34px rgba(163,28,30,.32)",
        soft: "0 6px 20px rgba(24,58,43,.10)",
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        floaty: { "0%,100%": { transform: "translateY(0) rotate(var(--r,0deg))" }, "50%": { transform: "translateY(-12px) rotate(calc(var(--r,0deg) + 1.5deg))" } },
        blob: { "0%,100%": { transform: "translate(0,0) scale(1)" }, "50%": { transform: "translate(26px,-20px) scale(1.07)" } },
        slideIn: { "0%": { transform: "translateX(100%)" }, "100%": { transform: "translateX(0)" } },
        slideOut: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(100%)" } },
        slideInLeft: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(0)" } },
        slideOutLeft: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-100%)" } },
        fadeOut: { "0%": { opacity: 1 }, "100%": { opacity: 0 } },
        rise: { "0%": { opacity: 0, transform: "translateY(28px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        spinSlow: { to: { transform: "rotate(360deg)" } },
        shine: { "0%": { transform: "translateX(-120%) skewX(-18deg)" }, "100%": { transform: "translateX(260%) skewX(-18deg)" } },
        kenburns: { "0%": { transform: "scale(1)" }, "100%": { transform: "scale(1.12) translate(-1.5%,-1%)" } },
        pop: { "0%": { transform: "scale(.94)", opacity: 0 }, "100%": { transform: "scale(1)", opacity: 1 } },
        steam: {
          "0%": { transform: "translateY(0) scaleX(1) rotate(0)", opacity: 0 },
          "20%": { opacity: 0.65 },
          "60%": { transform: "translateY(-22px) scaleX(1.3) rotate(3deg)", opacity: 0.35 },
          "100%": { transform: "translateY(-46px) scaleX(1.6) rotate(-3deg)", opacity: 0 },
        },
        sway: { "0%,100%": { transform: "rotate(-5deg)" }, "50%": { transform: "rotate(6deg)" } },
        wiggle: { "0%,100%": { transform: "rotate(-4deg)" }, "50%": { transform: "rotate(4deg)" } },
        draw: { to: { strokeDashoffset: 0 } },
        morph: {
          "0%,100%": { borderRadius: "60% 40% 55% 45% / 55% 45% 60% 40%" },
          "50%": { borderRadius: "42% 58% 40% 60% / 60% 40% 55% 45%" },
        },
        twinkle: { "0%,100%": { opacity: 0.35, transform: "scale(.8) rotate(0)" }, "50%": { opacity: 1, transform: "scale(1.15) rotate(20deg)" } },
        gradientPan: { "0%": { backgroundPosition: "0% 50%" }, "100%": { backgroundPosition: "200% 50%" } },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        floaty: "floaty 6s ease-in-out infinite",
        blob: "blob 12s ease-in-out infinite",
        pop: "pop .2s ease-out",
        slideIn: "slideIn .36s cubic-bezier(.16, 1, .3, 1) forwards",
        slideOut: "slideOut .3s cubic-bezier(.25, 1, .5, 1) forwards",
        slideInLeft: "slideInLeft .36s cubic-bezier(.16, 1, .3, 1) forwards",
        slideOutLeft: "slideOutLeft .3s cubic-bezier(.25, 1, .5, 1) forwards",
        fadeOut: "fadeOut .3s ease forwards",
        rise: "rise .9s cubic-bezier(.22,1,.36,1) both",
        spinSlow: "spinSlow 24s linear infinite",
        kenburns: "kenburns 18s ease-in-out infinite alternate",
        steam1: "steam 3.2s ease-out infinite",
        steam2: "steam 3.8s ease-out 1.2s infinite",
        steam3: "steam 4.1s ease-out 2.1s infinite",
        sway: "sway 5s ease-in-out infinite",
        wiggle: "wiggle 3s ease-in-out infinite",
        morph: "morph 9s ease-in-out infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
