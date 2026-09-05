import test from "node:test";
import assert from "node:assert/strict";
import {
  getInitialSiteLanguage,
  languageFromLocale,
  localizedPath,
} from "../src/siteLanguage.js";

function storageWith(value) {
  return { getItem: () => value };
}

test("all Chinese browser locales default to Traditional Chinese", () => {
  for (const locale of ["zh-CN", "zh-HK", "zh-TW", "zh-SG", "zh-Hans-CN"]) {
    assert.equal(languageFromLocale(locale), "tc");
  }
});

test("non-Chinese browser locales default to English", () => {
  for (const locale of ["en-US", "fr-FR", "ja-JP", ""]) {
    assert.equal(languageFromLocale(locale), "en");
  }
});

test("URL language overrides saved and browser languages", () => {
  assert.equal(
    getInitialSiteLanguage({
      search: "?source=home&lang=en",
      storage: storageWith("tc"),
      languages: ["zh-HK"],
    }),
    "en",
  );
});

test("saved language overrides browser language", () => {
  assert.equal(
    getInitialSiteLanguage({
      storage: storageWith("tc"),
      languages: ["en-US"],
    }),
    "tc",
  );
});

test("legacy assessment language is used before browser language", () => {
  assert.equal(
    getInitialSiteLanguage({
      storage: storageWith(null),
      legacyLanguage: "en",
      languages: ["zh-HK"],
    }),
    "en",
  );
});

test("localizedPath preserves existing query and hash", () => {
  assert.equal(
    localizedPath("/assessment?source=home#start", "en"),
    "/assessment?source=home&lang=en#start",
  );
});
