import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind CSS ko Turbopack mein chalane wala rule (isse mat hatana)
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
