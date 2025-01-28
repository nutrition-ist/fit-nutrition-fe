const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hazalkaynak.pythonanywhere.com",
        port: "",
        pathname: "/media/**", // Match all images under /media/
      },
    ],
  },
};

module.exports = nextConfig;
