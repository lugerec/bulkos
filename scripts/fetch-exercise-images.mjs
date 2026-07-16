#!/usr/bin/env node
/**
 * Downloads exercise images from the wger open database (CC-BY-SA) into
 * public/exercises/<exercise-id>/ and writes src/data/exerciseMedia.json
 * mapping our exercise ids to the saved local paths, plus an attribution
 * file.
 *
 * wger has no usable search endpoint anymore, so we pull the full english
 * translation list (name -> base id) and the full image list (base id ->
 * image url) once, then match our exercises by name locally. wger images
 * can't be fetched from the browser (no CORS), which is why this runs here.
 *
 * Run from the repo root:  npm run fetch-images
 * Node 18+ (global fetch). Safe to re-run — skips files already saved.
 */

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const EXERCISE_DIR = join(ROOT, "src", "data", "exercises");
const PUBLIC_DIR = join(ROOT, "public", "exercises");
const WGER = "https://wger.de";
const ENGLISH = 2;

/** Fetch every page of a paginated wger list endpoint. */
async function fetchAll(path) {
  let url = `${WGER}${path}${path.includes("?") ? "&" : "?"}limit=200&format=json`;
  const all = [];

  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} for ${url}`);
    const data = await res.json();
    all.push(...(data.results ?? []));
    url = data.next;
    process.stdout.write(`\r  fetched ${all.length}…   `);
  }
  process.stdout.write("\n");
  return all;
}

/** Normalise a name for fuzzy matching. */
function norm(name) {
  return name
    .toLowerCase()
    .replace(/\bdb\b/g, "dumbbell")
    .replace(/\bbb\b/g, "barbell")
    .replace(/\bohp\b/g, "overhead press")
    .replace(/\brdl\b/g, "romanian deadlift")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getOurExercises() {
  const files = (await readdir(EXERCISE_DIR)).filter(
    (f) => f.endsWith(".ts") && f !== "index.ts"
  );

  const exercises = [];
  for (const file of files) {
    const content = await readFile(join(EXERCISE_DIR, file), "utf8");
    const regex = /id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"/g;
    let m;
    while ((m = regex.exec(content))) {
      exercises.push({ id: m[1], name: m[2] });
    }
  }
  return exercises;
}

async function downloadImage(url, destPath) {
  if (existsSync(destPath)) return true;
  const res = await fetch(url);
  if (!res.ok) return false;
  await writeFile(destPath, Buffer.from(await res.arrayBuffer()));
  return true;
}

async function main() {
  const ours = await getOurExercises();
  console.log(`Found ${ours.length} local exercises.\n`);

  console.log("Fetching wger english translations…");
  const translations = await fetchAll(
    `/api/v2/exercise-translation/?language=${ENGLISH}`
  );

  console.log("Fetching wger images…");
  const images = await fetchAll(`/api/v2/exerciseimage/`);

  // base id -> [image urls], main image first
  const imagesByBase = new Map();
  for (const img of images) {
    const base = img.exercise;
    if (!base || !img.image) continue;
    if (!imagesByBase.has(base)) imagesByBase.set(base, []);
    if (img.is_main) imagesByBase.get(base).unshift(img.image);
    else imagesByBase.get(base).push(img.image);
  }

  // normalised name -> base id (only bases that actually have images)
  const baseByName = new Map();
  for (const t of translations) {
    if (!t.name || !t.exercise) continue;
    if (!imagesByBase.has(t.exercise)) continue;
    const key = norm(t.name);
    if (!baseByName.has(key)) baseByName.set(key, t.exercise);
  }

  console.log(
    `\n${imagesByBase.size} wger exercises have images. Matching…\n`
  );

  const attribution = [
    "# Exercise image attributions",
    "",
    "Images from the wger project (https://wger.de), licensed CC-BY-SA 3.0.",
    "",
  ];
  const mediaMap = {};
  let matched = 0;
  let downloaded = 0;

  for (const ex of ours) {
    const key = norm(ex.name);

    // exact, then contains-match either direction
    let base = baseByName.get(key);
    if (!base) {
      for (const [name, id] of baseByName) {
        if (name.includes(key) || key.includes(name)) {
          base = id;
          break;
        }
      }
    }
    if (!base) {
      console.log(`✗ ${ex.name} — no match`);
      continue;
    }

    const urls = imagesByBase.get(base) ?? [];
    if (urls.length === 0) {
      console.log(`○ ${ex.name} — matched but no images`);
      continue;
    }

    matched++;
    const destDir = join(PUBLIC_DIR, ex.id);
    await mkdir(destDir, { recursive: true });

    const saved = {};
    const slots = ["start", "finish"];
    for (let i = 0; i < Math.min(urls.length, 2); i++) {
      const ext = (urls[i].split(".").pop() || "png").split("?")[0];
      const filename = `${slots[i]}.${ext}`;
      if (await downloadImage(urls[i], join(destDir, filename))) {
        saved[slots[i]] = `/exercises/${ex.id}/${filename}`;
        downloaded++;
      }
    }

    if (Object.keys(saved).length) {
      mediaMap[ex.id] = saved;
      console.log(`✓ ${ex.name} — ${Object.keys(saved).length} image(s)`);
      attribution.push(`- ${ex.name}: wger base #${base}`);
    }
  }

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
  console.log("Map: src/data/exerciseMedia.json — the app picks it up automatically.");
}

main().catch((err) => {
  console.error("\nFailed:", err.message);
  process.exit(1);
});
