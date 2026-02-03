// i18n support for actor names and alternate titles
export type Locale = "en" | "es" | "fr" | "de" | "ja" | "zh";

const DEFAULT_LOCALE: Locale = "en";

export function getActorName(
  actor: { name: string; i18n?: { name?: Record<string, string>; alternateNames?: string[] } },
  locale: Locale = DEFAULT_LOCALE
): string {
  if (actor.i18n?.name?.[locale]) {
    return actor.i18n.name[locale];
  }
  return actor.name;
}

export function getActorBiography(
  actor: { biography: string; i18n?: { biography?: Record<string, string> } },
  locale: Locale = DEFAULT_LOCALE
): string {
  // Return raw biography directly as we are fetching real English data from TMDB
  return actor.biography || "Biography not available for this actor.";
}

export function getAlternateNames(
  actor: { i18n?: { alternateNames?: string[] } }
): string[] {
  return actor.i18n?.alternateNames || [];
}

// Get locale from headers or default
export function getLocaleFromHeaders(headers: Headers): Locale {
  const acceptLanguage = headers.get("accept-language");
  if (!acceptLanguage) return DEFAULT_LOCALE;

  // Simple locale detection
  if (acceptLanguage.includes("es")) return "es";
  if (acceptLanguage.includes("fr")) return "fr";
  if (acceptLanguage.includes("de")) return "de";
  if (acceptLanguage.includes("ja")) return "ja";
  if (acceptLanguage.includes("zh")) return "zh";
  return DEFAULT_LOCALE;
}
