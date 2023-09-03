/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

const nextConfig = {
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
}

module.exports = withPWA({
  // config
})


module.exports = nextConfig