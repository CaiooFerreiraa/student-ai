import type { MetadataRoute } from "next";
import { getServerEnv } from "@/infrastructure/config/env";

function buildCanonicalHost(): string | undefined {
  const env = getServerEnv();

  if (!env.CUSTOM_DOMAIN) {
    return undefined;
  }

  return env.CUSTOM_DOMAIN.startsWith("http") ? env.CUSTOM_DOMAIN : `https://${env.CUSTOM_DOMAIN}`;
}

export default function robots(): MetadataRoute.Robots {
  const host = buildCanonicalHost();
  const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/register"],
    },
    host,
    sitemap: host ? `${host}/sitemap.xml` : undefined,
  };
}
