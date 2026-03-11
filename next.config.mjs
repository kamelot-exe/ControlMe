/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-native': false,
      };
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'react-native': false,
    };
    // Avoid eval() in dev mode — breaks with SES/MetaMask browser extensions
    if (dev) {
      config.devtool = 'cheap-module-source-map';
    }
    return config;
  },
};

export default nextConfig;
