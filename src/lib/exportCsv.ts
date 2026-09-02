type ExportWorkout = {
  date: string;
  name: string;
  exercises?: Array<{
    name: string;
    sets: Array<{ weight: number; reps: number; completed: boolean }>;
  }>;
};

type ExportBodyEntry = {
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  waistCm?: number;
  chestCm?: number;
};

/** Quote a CSV field when it contains a delimiter, quote, or newline. */
function csvField(value: string | number | boolean): string {
  const text = String(value);

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function toCsv(rows: ReadonlyArray<ReadonlyArray<string | number | boolean>>) {
  return rows.map((row) => row.map(csvField).join(",")).join("\n");
}

/** One row per logged set: date, workout, exercise, set number, load. */
export function buildWorkoutsCsv(workouts: readonly ExportWorkout[]): string {
  const rows: Array<Array<string | number | boolean>> = [
    ["date", "workout", "exercise", "set", "weight_kg", "reps", "completed"],
  ];

  const ordered = [...workouts].sort((a, b) => a.date.localeCompare(b.date));

  for (const workout of ordered) {
    for (const exercise of workout.exercises ?? []) {
      exercise.sets.forEach((set, index) => {
        rows.push([
          workout.date,
          workout.name,
          exercise.name,
          index + 1,
          set.weight,
          set.reps,
          set.completed,
        ]);
      });
    }
  }

  return toCsv(rows);
}

/** One row per check-in with the tracked measurements. */
export function buildBodyMetricsCsv(
  entries: readonly ExportBodyEntry[]
): string {
  const rows: Array<Array<string | number | boolean>> = [
    ["date", "weight_kg", "body_fat_pct", "waist_cm", "chest_cm"],
  ];

  const ordered = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  for (const entry of ordered) {
    rows.push([
      entry.date,
      entry.weightKg,
      entry.bodyFatPct ?? "",
      entry.waistCm ?? "",
      entry.chestCm ?? "",
    ]);
  }

  return toCsv(rows);
}

/** Trigger a browser download of the given text as a file. */
import { Capacitor } from "@capacitor/core";

/**
 * Save (or offer to save) a text file.
 *
 * `<a download>` only works in a real browser tab — inside the native
 * Capacitor/WKWebView shell there's no browser chrome to catch the download,
 * so it silently does nothing. On native, write the file via Filesystem and
 * hand it to the native Share sheet (Save to Files, AirDrop, Mail, ...);
 * the browser trick remains the fallback when running as a plain web page.
 */
/**
 * Save/share several text files together. On native, all files are written
 * first and handed to a single Share sheet call — sharing them one-by-one
 * would pop a separate native share sheet per file, which is jarring.
 */
export async function downloadCsvFiles(
  files: ReadonlyArray<{ filename: string; content: string }>
): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory, Encoding } = await import(
      "@capacitor/filesystem"
    );
    const { Share } = await import("@capacitor/share");

    const uris: string[] = [];
    for (const file of files) {
      const written = await Filesystem.writeFile({
        path: file.filename,
        data: file.content,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      uris.push(written.uri);
    }

    await Share.share({ title: "BulkOS data export", files: uris });
    return;
  }

  for (const file of files) {
    await downloadTextFile(file.filename, file.content);
  }
}

export async function downloadTextFile(
  filename: string,
  content: string,
  mimeType = "text/csv"
): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory, Encoding } = await import(
      "@capacitor/filesystem"
    );
    const { Share } = await import("@capacitor/share");

    const written = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    await Share.share({
      title: filename,
      files: [written.uri],
    });
    return;
  }

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}
