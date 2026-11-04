import type { NextConfig } from "next";
import { validateBusinessConfig } from "./config/business";

if (process.env.NODE_ENV === "production") validateBusinessConfig();

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
};

export default nextConfig;
