export const SITE_LANGUAGE_KEY = "open_pathway_language_v1";

export function normalizeSiteLanguage(value) {
  return value === "tc" || value === "en" ? value : null;
}

export function languageFromLocale(locale) {
  return String(locale || "")
    .toLowerCase()
    .startsWith("zh")
    ? "tc"
    : "en";
}

function readStoredLanguage(storage) {
  try {
    return normalizeSiteLanguage(storage?.getItem(SITE_LANGUAGE_KEY));
  } catch {
    return null;
  }
}

export function getInitialSiteLanguage({
  search = typeof window !== "undefined" ? window.location.search : "",
  storage = typeof window !== "undefined" ? window.localStorage : null,
  languages = typeof navigator !== "undefined" ? navigator.languages : [],
  language = typeof navigator !== "undefined" ? navigator.language : "",
} = {}) {
  const queryLanguage = normalizeSiteLanguage(
    new URLSearchParams(search).get("lang"),
  );
  if (queryLanguage) return queryLanguage;

  const storedLanguage = readStoredLanguage(storage);
  if (storedLanguage) return storedLanguage;

  const browserLocale =
    Array.isArray(languages) && languages.length ? languages[0] : language;
  return languageFromLocale(browserLocale);
}

export function setSiteLanguagePreference(
  language,
  {
    storage = typeof window !== "undefined" ? window.localStorage : null,
    location = typeof window !== "undefined" ? window.location : null,
    history = typeof window !== "undefined" ? window.history : null,
  } = {},
) {
  const normalized = normalizeSiteLanguage(language);
  if (!normalized) return null;

  try {
    storage?.setItem(SITE_LANGUAGE_KEY, normalized);
  } catch {
    // Language selection still works for this page if storage is unavailable.
  }

  if (location && history?.replaceState) {
    const url = new URL(location.href);
    url.searchParams.set("lang", normalized);
    history.replaceState(
      history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }

  return normalized;
}

export function localizedPath(path, language) {
  const normalized = normalizeSiteLanguage(language) || "en";
  const url = new URL(path, "https://local.invalid");
  url.searchParams.set("lang", normalized);
  return `${url.pathname}${url.search}${url.hash}`;
}
