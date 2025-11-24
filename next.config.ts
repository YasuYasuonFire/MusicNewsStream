import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // GitHub Pagesは画像最適化サーバーを持たないため必須
  },
};

export default nextConfig;
