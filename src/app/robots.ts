import type { MetadataRoute } from "next";
import { business } from "../../config/business";
export default function robots(): MetadataRoute.Robots { const base = business.siteUrl.startsWith("https://") ? business.siteUrl : "https://fingerfox.example"; return { rules: { userAgent: "*", allow: "/" }, sitemap: `${base}/sitemap.xml` }; }
