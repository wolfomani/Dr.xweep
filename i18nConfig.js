const i18nConfig = {
  defaultLocale: "en",
  locales: ["ar", "bn", "de", "en", "es", "fr", "he", "id", "it", "ja", "ko", "pt", "ru", "si", "sv", "te", "vi", "zh"],
}

// Named export for i18n
export const i18n = i18nConfig

// Default export
export default i18nConfig

// CommonJS compatibility for older imports
if (typeof module !== "undefined" && module.exports) {
  module.exports = i18nConfig
  module.exports.i18n = i18nConfig
  module.exports.default = i18nConfig
}
