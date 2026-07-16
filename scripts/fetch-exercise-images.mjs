#!/usr/bin/env node
/**
 * Downloads exercise images from the wger open database (CC-BY-SA) into
 * public/exercises/<exercise-id>/ and patches src/data/exercises/*.ts with
 * the local media paths, plus writes an attribution file.
 *
 * wger has no CORS and its images can't be fetched from the browser, so we
 * pull them once here at build time and serve them locally.
 *
 * Run from the repo root:  node scripts/fetch-exercise-images.mjs
 * Node 18+ (uses global fetch). Safe to re-run — skips files already saved.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const EXERCISE_DIR = join(ROOT, "src", "data", "exercises");
const PUBLIC_DIR = join(ROOT, "public", "exercises");
const WGER = "https://wger.de";

/** Expand short forms so names match wger's full exercise titles. */
function expandName(name) {
  return name
    .replace(/\bDB\b/g, "Dumbbell")
    .replace(/\bBB\b/g, "Barbell")
    .replace(/\bOHP\b/g, "Overhead Press")
    .replace(/\bRDL\b/g, "Romanian Deadlift")
    .trim();
}

/** Candidate search terms for one exercise name, most specific first. */
function searchTerms(name) {
  const full = expandName(name);
  const terms = new Set([full, name]);

  // Also try without leading equipment word (e.g. "Barbell Row" -> "Row").
  const withoutEquip = full.replace(
    /^(Barbell|Dumbbell|Cable|Machine|Smith Machine|Seated|Standing|Incline|Decline)\s+/i,
    ""
  );
  terms.add(withoutEquip);

  return [...terms].filter(Boolean);
}

async function searchExercise(term) {
  const url = `${WGER}/api/v2/exercise/search/?language=english&format=json&term=${encodeURIComponent(
    term
  )}`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  return data.suggestions ?? [];
}

/** Fetch image URLs for a wger base exercise id. */
async function imagesForBase(baseId) {
  const url = `${WGER}/api/v2/exerciseimage/?exercise_base=${baseId}&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  return (data.results ?? []).map((r) => r.image).filter(Boolean);
}

async function downloadImage(url, destPath) {
  if (existsSync(destPath)) return true;

  const res = await fetch(url);
  if (!res.ok) return false;

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buffer);
  return true;
}

async function getExerciseList() {
  // Parse id + name pairs straight from the source files.
  const { readdir } = await import("node:fs/promises");
  const files = (await readdir(EXERCISE_DIR)).filter(
    (f) => f.endsWith(".ts") && f !== "index.ts"
  );

  const exercises = [];
  for (const file of files) {
    const content = await readFile(join(EXERCISE_DIR, file), "utf8");
    const regex =
      /id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"/g;
    let match;
    while ((match = regex.exec(content))) {
      exercises.push({ id: match[1], name: match[2], file });
    }
  }
  return exercises;
}

async function main() {
  const exercises = await getExerciseList();
  console.log(`Found ${exercises.length} exercises. Matching against wger…\n`);

  const attribution = [
    "# Exercise image attributions",
    "",
    "Images are from the wger project (https://wger.de), licensed under",
    "Creative Commons Attribution-ShareAlike 3.0 (CC-BY-SA 3.0).",
    "",
  ];

  let matched = 0;
  let downloaded = 0;
  const mediaMap = {};

  for (const exercise of exercises) {
    let baseId = null;

    for (const term of searchTerms(exercise.name)) {
      const suggestions = await searchExercise(term);
      const hit = suggestions.find((s) => s.data?.base_id);
      if (hit) {
        baseId = hit.data.base_id;
        break;
      }
    }

    if (!baseId) {
      console.log(`✗ ${exercise.name} — no wger match`);
      continue;
    }

    const images = await imagesForBase(baseId);
    if (images.length === 0) {
      console.log(`○ ${exercise.name} — matched but no images`);
      continue;
    }

    matched++;
    const destDir = join(PUBLIC_DIR, exercise.id);
    await mkdir(destDir, { recursive: true });

    const saved = {};
    for (let i = 0; i < Math.min(images.length, 2); i++) {
      const ext = images[i].split(".").pop().split("?")[0] || "png";
      const slot = i === 0 ? "start" : "finish";
      const filename = `${slot}.${ext}`;
      const ok = await downloadImage(images[i], join(destDir, filename));
      if (ok) {
        saved[slot] = `/exercises/${exercise.id}/${filename}`;
        downloaded++;
      }
    }

    if (Object.keys(saved).length > 0) {
      mediaMap[exercise.id] = saved;
      console.log(`✓ ${exercise.name} — ${Object.keys(saved).length} image(s)`);
      attribution.push(
        `- ${exercise.name}: wger base #${baseId} (${
          Object.keys(saved).length
        } image(s))`
      );
    }
  }

  // A JSON map keyed by exercise id — merged over each exercise's own media
  // at runtime, so we never rewrite the exercise source files.
  await writeFile(
    join(ROOT, "src", "data", "exerciseMedia.json"),
    JSON.stringify(mediaMap, null, 2) + "\n"
  );

  await writeFile(
    join(ROOT, "EXERCISE_IMAGE_ATTRIBUTION.md"),
    attribution.join("\n") + "\n"
  );

  console.log(
    `\nDone. Matched ${matched} exercises, downloaded ${downloaded} images.`
  );
  console.log("Images in public/exercises/<id>/, map in src/data/exerciseMedia.json.");
  console.log("The app merges this map automatically — no further steps.");
  console.log("Attribution written to EXERCISE_IMAGE_ATTRIBUTION.md");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
