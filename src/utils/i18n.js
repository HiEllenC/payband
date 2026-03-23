// ═══════ i18n HELPER ═══════
// Returns a translation helper function bound to the current language.
// Usage: const t = makeT(lang); t("English text", "中文文字")
export function makeT(lang) {
  return (e, z) => lang === "zh" ? z : e;
}
