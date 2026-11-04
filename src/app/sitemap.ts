import type { MetadataRoute } from "next";
import { games } from "@/games/registry";
import { guides } from "@/content/guides";
import { business } from "../../config/business";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/games",
    "/daily",
    "/typing-test",
    "/learn",
    "/faq",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/refund",
  ];

  return [
    ...routes.map((route) => ({ url: new URL(route, business.siteUrl).toString() })),
    ...games
      .filter((game) => game.enabled)
      .map((game) => ({ url: new URL(`/games/${game.slug}`, business.siteUrl).toString() })),
    ...guides.map((guide) => ({ url: new URL(`/learn/${guide.slug}`, business.siteUrl).toString() })),
  ];
}
