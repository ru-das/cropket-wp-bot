// Translation is now handled via static strings in src/utils/strings.js
// This file is kept to avoid breaking imports during migration.
// getString(key, lang) in strings.js replaces t() everywhere.

export async function t(text, _lang) {
  return text;
}

export async function tBatch(texts, _lang) {
  return texts;
}

export async function detectLang(_text) {
  return 'en';
}
