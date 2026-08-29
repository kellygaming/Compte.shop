import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL(
        "https://tqthhymhoagekfpbsker.supabase.co/storage/v1/object/public/listing-images/**",
      ),
    ],
  },
};

export default nextConfig;
