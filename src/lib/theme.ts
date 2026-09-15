// src/lib/theme.ts
export const COLORS = {
  primary: "hsl(221 83% 53%)",
  purple: "hsl(267 100% 69%)",
  pink: "hsl(330 100% 69%)",
  rose: "hsl(350 100% 69%)",
  teal: "hsl(173 80% 40%)",
  accent: "hsl(267 100% 69%)",
};

export const GRADIENTS = {
  primary: "from-primary via-purple-500 to-pink-500",
  purplePink: "from-purple-500 to-pink-500",
  pinkRose: "from-pink-500 to-rose-500",
  accentTeal: "from-accent to-teal-500",
} as const;

export const SHADOWS = {
  glow: "0 0 30px hsl(var(--primary)/0.3)",
};