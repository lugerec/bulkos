#!/usr/bin/env node
/**
 * Report on localisation coverage:
 *   1. strings already wrapped in t()/tPlural() but missing from sk.ts
 *   2. keys in sk.ts nothing calls any more (safe to delete)
 *   3. a rough list of files that still contain untranslated UI text
 *
 * Run: npm run i18n:missing
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = "src";
const SKIP = ["/components/ui/", "/data/exercises", ".test.", "/i18n/"];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.tsx?$/.test(path) ? [path] : [];
  });
}

const files = walk(SRC).filter((f) => !SKIP.some((s) => f.includes(s)));

const dictionary = readFileSync("src/i18n/sk.ts", "utf8");
const known = new Set(
  [...dictionary.matchAll(/^\s*"((?:[^"\\]|\\.)*)":/gm)].map((m) =>
    m[1].replace(/\\"/g, '"')
  )
);

const called = new Map();
const CALL = /\bt\(\s*"((?:[^"\\]|\\.)*)"/g;

for (const file of files) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(CALL)) {
    const key = match[1].replace(/\\"/g, '"');
    if (!called.has(key)) called.set(key, file);
  }
}

const missing = [...called].filter(([key]) => !known.has(key));
const unused = [...known].filter((key) => !called.has(key));

const untouched = files
  .map((file) => {
    const source = readFileSync(file, "utf8");
    const text = [
      ...source.matchAll(/>\s*([A-Z][A-Za-z0-9 ,.!?'’\-–—%/&()]{3,70}?)\s*</gs),
      ...source.matchAll(
        /(?:label|title|placeholder|aria-label)="([^"]{3,70})"/g
      ),
    ]
      .map((m) => m[1].trim())
      .filter((value) => /\s/.test(value));
    return [file, new Set(text).size];
  })
  .filter(([, count]) => count > 0)
  .sort((a, b) => b[1] - a[1]);

console.log(`translated keys in sk.ts: ${known.size}`);
console.log(`t() call sites:           ${called.size}\n`);

if (missing.length) {
  console.log(`MISSING from sk.ts (${missing.length}) — will render in English:`);
  for (const [key, file] of missing) console.log(`  ${JSON.stringify(key)}  ← ${file}`);
  console.log("");
}

if (unused.length) {
  console.log(`UNUSED in sk.ts (${unused.length}):`);
  for (const key of unused) console.log(`  ${JSON.stringify(key)}`);
  console.log("");
}

console.log(`Files with untranslated UI text (top 25 of ${untouched.length}):`);
for (const [file, count] of untouched.slice(0, 25)) {
  console.log(`  ${String(count).padStart(4)}  ${file}`);
}

process.exit(missing.length ? 1 : 0);
