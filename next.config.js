/** @type {import('next').NextConfig} */
const nextConfig = {
  // 优化图片加载
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
    ],
  },
  // 输出模式
  output: 'standalone',
  // 压缩
  compress: true,
};

export default nextConfig;
