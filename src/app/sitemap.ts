import type { MetadataRoute } from "next";
import { games } from "@/games/registry";
import { business } from "../../config/business";
export default function sitemap(): MetadataRoute.Sitemap { const base = business.siteUrl.startsWith("https://") ? business.siteUrl : "https://fingerfox.example"; const routes = ["", "/games", "/daily", "/typing-test", "/stats", "/settings", "/leaderboard", "/learn", "/about", "/contact", "/privacy", "/terms", "/cookies", "/refund"]; return [...routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date("2026-11-02"), changeFrequency: "weekly" as const, priority: route === "" ? 1 : 0.6 })), ...games.map((game) => ({ url: `${base}/games/${game.slug}`, lastModified: new Date("2026-11-02"), changeFrequency: "monthly" as const, priority: 0.7 }))]; }
