import { describe, expect, it, afterEach } from "vitest";

import { getLanguage, pluralForm, setLanguage, t, tPlural } from "./index";
import { sk } from "./sk";

afterEach(() => setLanguage("sk"));

describe("t", () => {
  it("translates a known string", () => {
    setLanguage("sk");
    expect(t("Settings")).toBe("Nastavenia");
  });

  it("falls back to the English source when untranslated", () => {
    setLanguage("sk");
    expect(t("Some string nobody has translated yet")).toBe(
      "Some string nobody has translated yet"
    );
  });

  it("returns the source verbatim in English", () => {
    setLanguage("en");
    expect(t("Settings")).toBe("Settings");
    expect(getLanguage()).toBe("en");
  });

  it("interpolates named placeholders", () => {
    setLanguage("sk");
    expect(t("No {label}", { label: "Spredu" })).toBe("Žiadna fotka (Spredu)");
  });

  it("leaves unknown placeholders untouched rather than printing undefined", () => {
    setLanguage("en");
    expect(t("Hi {name}, you owe {amount}", { name: "Lukáš" })).toBe(
      "Hi Lukáš, you owe {amount}"
    );
  });
});

describe("pluralForm", () => {
  it("uses Slovak's three cardinal forms", () => {
    expect(pluralForm(1, "sk")).toBe("one");
    expect(pluralForm(2, "sk")).toBe("few");
    expect(pluralForm(4, "sk")).toBe("few");
    expect(pluralForm(5, "sk")).toBe("many");
    expect(pluralForm(0, "sk")).toBe("many");
    expect(pluralForm(11, "sk")).toBe("many");
  });

  it("treats decimals as genitive", () => {
    expect(pluralForm(1.5, "sk")).toBe("many");
  });

  it("collapses to two forms in English", () => {
    expect(pluralForm(1, "en")).toBe("one");
    expect(pluralForm(2, "en")).toBe("many");
    expect(pluralForm(0, "en")).toBe("many");
  });
});

describe("tPlural", () => {
  it("picks the form and interpolates the count", () => {
    setLanguage("en");
    const forms = {
      one: "{count} set",
      few: "{count} sets",
      many: "{count} sets",
    };
    expect(tPlural(1, forms)).toBe("1 set");
    expect(tPlural(3, forms)).toBe("3 sets");
  });
});

describe("sk dictionary", () => {
  it("has no empty or accidentally-English translations", () => {
    for (const [source, translated] of Object.entries(sk)) {
      expect(translated.trim(), `empty translation for "${source}"`).not.toBe("");
    }
  });

  it("keeps every {placeholder} present in the source", () => {
    const placeholders = (value: string) =>
      (value.match(/\{(\w+)\}/g) ?? []).sort();

    for (const [source, translated] of Object.entries(sk)) {
      expect(placeholders(translated), `placeholders differ for "${source}"`).toEqual(
        placeholders(source)
      );
    }
  });
});
