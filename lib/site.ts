export const site = {
  name: "Leslie’s Notes on AI",
  shortName: "Notes on AI",
  description: "A living field notebook about how AI systems work, fail, and are governed.",
  tagline: "How AI systems work, fail, and are governed.",
};

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const value = explicit ?? (vercel ? `https://${vercel}` : "http://localhost:3000");
  return new URL(value);
}
