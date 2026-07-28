export const attribution = "Written and updated by AI and Leslie Teo.";

export const site = {
  name: "Leslie’s Notes on AI",
  shortName: "Notes on AI",
  description: "A working, opinionated reference library on building, using, and governing AI—maintained with AI agents and Leslie Teo.",
  tagline: "Practical notes on building, using, and governing AI.",
};

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (!explicit && !vercel && process.env.VERCEL === "1") {
    throw new Error("Vercel URL environment variables are unavailable; enable Vercel system environment variables or set NEXT_PUBLIC_SITE_URL.");
  }
  const value = explicit ?? (vercel ? `https://${vercel}` : "http://localhost:3000");
  return new URL(value);
}
