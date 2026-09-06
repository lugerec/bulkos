/**
 * Minimal in-repo i18n. No library, no key invention: the lookup key *is* the
 * English source string, so call sites stay readable (`t("Settings")`), diffs
 * show real text, and an untranslated string degrades to English instead of
 * rendering a raw `settings.title` key at the user.
 *
 * `t()` is a plain module function rather than a hook so translating a screen
 * is a one-line-per-string change with no component signature churn. The
 * trade-off is that it isn't reactive — switching language remounts the app
 * tree via a `key` in App.tsx, which is instant and happens roughly never.
 */

import { sk } from "./sk";

export type Language = "sk" | "en";

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: "sk", label: "Slovenčina" },
  { id: "en", label: "English" },
];

/** English is the source language, so its dictionary is intentionally empty. */
const DICTIONARIES: Record<Language, Record<string, string>> = { sk, en: {} };

let current: Language = "sk";

export function getLanguage(): Language {
  return current;
}

export function setLanguage(language: Language): void {
  current = language;
}

/**
 * Translate `source`, interpolating `{name}` placeholders.
 * Unknown strings fall through to the English source.
 */
export function t(
  source: string,
  vars?: Record<string, string | number>
): string {
  const translated = DICTIONARIES[current][source] ?? source;

  if (!vars) return translated;

  return translated.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}

export type PluralForm = "one" | "few" | "many";

/**
 * Slovak has three cardinal forms where English has two:
 *   1 séria · 2–4 série · 0/5+ sérií
 * Non-integers take the "many" (genitive) form: 1,5 kilogramu.
 */
export function pluralForm(count: number, language = current): PluralForm {
  if (language === "en") return count === 1 ? "one" : "many";

  if (!Number.isInteger(count)) return "many";
  if (count === 1) return "one";
  if (count >= 2 && count <= 4) return "few";

  return "many";
}

/**
 * Pick the right plural form and interpolate `{count}`.
 * `tPlural(3, { one: "{count} set", few: "{count} sets", many: "{count} sets" })`
 */
export function tPlural(
  count: number,
  forms: Record<PluralForm, string>
): string {
  return t(forms[pluralForm(count)], { count });
}
