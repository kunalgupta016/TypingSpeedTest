/**
 * Public business metadata for legal pages, metadata, and sitemap output.
 * Vercel deployment settings can override these values, but production builds
 * need a complete HTTPS URL and valid public contact email addresses.
 */

export const business = {
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? "FingerFox Studio",
  tradeName: "FingerFox",
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "Remote / Online operations",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@fingerfox.app",
  grievanceContact: process.env.NEXT_PUBLIC_GRIEVANCE_CONTACT ?? "privacy@fingerfox.app",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://finger-fox.vercel.app",
  privacyPolicyVersion: "1.0.0",
  termsVersion: "1.0.0",
  cookiePolicyVersion: "1.0.0",
} as const;

/**
 * Call this at build time (e.g. in next.config.ts or a CI step) to ensure
 * no placeholder values remain before a production deploy.
 */
export function validateBusinessConfig(): void {
  const placeholders: string[] = [];
  for (const [key, value] of Object.entries(business)) {
    if (typeof value === "string" && value.startsWith("PLACEHOLDER")) {
      placeholders.push(key);
    }
  }
  if (placeholders.length > 0) {
    throw new Error(
      `Business config has placeholder values that must be replaced before production:\n` +
        placeholders.map((k) => `  - ${k}`).join("\n") +
        `\n\nEdit config/business.ts and replace all PLACEHOLDER_ values.`
    );
  }
  if (!/^https:\/\//.test(business.siteUrl)) throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute HTTPS URL.");
  if (!/^\S+@\S+\.\S+$/.test(business.contactEmail)) throw new Error("NEXT_PUBLIC_CONTACT_EMAIL must be a public email address.");
  if (!/^\S+@\S+\.\S+$/.test(business.grievanceContact)) throw new Error("NEXT_PUBLIC_GRIEVANCE_CONTACT must be a public email address.");
}
