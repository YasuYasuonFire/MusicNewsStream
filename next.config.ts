import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pagesはサブディレクトリ(/MusicNewsStream)で配信されるため、basePathを設定
  basePath: process.env.NODE_ENV === 'production' ? '/MusicNewsStream' : '',
  images: {
    unoptimized: true, // GitHub Pagesは画像最適化サーバーを持たないため必須
  },
};

export default nextConfig;
