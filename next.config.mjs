/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  // Old addresses from the previous offer. Query strings (the ?c= token on email links) are carried over.
  async redirects() {
    return [
      { source: "/diagnostic", destination: "/start", permanent: true },
      { source: "/diagnostic/booked", destination: "/start/booked", permanent: true },
      { source: "/estimate", destination: "/pricing", permanent: true },
      { source: "/for/late-paying-customers", destination: "/for/chasing-by-hand", permanent: false },
      { source: "/for/missed-enquiries", destination: "/for/chasing-by-hand", permanent: false },
      { source: "/for/copying-between-systems", destination: "/for/retyping-between-systems", permanent: false },
      { source: "/for/website-doesnt-convert", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
