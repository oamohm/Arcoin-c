/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://rpc.testnet.arc.network https://5042002.rpc.thirdweb.com https://atlas.blockscout.com https://*.privy.io https://*.walletconnect.com wss://*.walletconnect.com https://auth.privy.io",
              "frame-src https://*.privy.io",
            ].join("; "),
          },
        ],
      },
    ]
  },

  webpack: (config, { isServer }) => {
    const webpack = require('webpack');

    // 1️⃣ IgnorePlugin – पूरे @x402 परिवार को नज़रअंदाज़ करेगा
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@x402\//,
      })
    );

    // 2️⃣ हर संभव @x402 सब-पाथ को false पर सेट करें (ताकि Webpack उन्हें ढूंढे ही नहीं)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@x402/evm': false,
      '@x402/sym': false,
      '@x402/core': false,
      '@x402': false,
    };

    // 3️⃣ Node.js कोर मॉड्यूल को भी false करें
    config.resolve.fallback.fs = false;
    config.resolve.fallback.net = false;
    config.resolve.fallback.tls = false;
    config.resolve.fallback.crypto = false;

    return config;
  },
};

module.exports = nextConfig;
