// This file is no longer needed for Next.js 15 App Router
// Internationalization is handled differently in App Router

const config = {
  defaultLocale: "en",
  locales: ["en", "de"],
}

// Export for backward compatibility only
module.exports = config
module.exports.i18n = config
module.exports.default = config

// Named exports
exports.i18n = config
exports.default = config
