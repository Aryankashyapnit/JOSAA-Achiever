import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dir = fileURLToPath(new URL(".", import.meta.url));

export const DATA_STORE_DIR = path.resolve(__dir, "../../../data_store");

export function ensureDataStoreDir(): void {
  if (!fs.existsSync(DATA_STORE_DIR)) {
    fs.mkdirSync(DATA_STORE_DIR, { recursive: true });
  }
}

export function writeStoreFile(filename: string, data: unknown): void {
  ensureDataStoreDir();
  fs.writeFileSync(
    path.join(DATA_STORE_DIR, filename),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}

export function readStoreFile<T = unknown>(filename: string): T | null {
  const filePath = path.join(DATA_STORE_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storeFileExists(filename: string): boolean {
  return fs.existsSync(path.join(DATA_STORE_DIR, filename));
}

export const STORE_FILES = {
  cutoffs: "cutoffs.json",
  predictor: "predictor.json",
  simulator: "simulator.json",
  colleges: "colleges.json",
  about: "about.json",
  schedule: "schedule.json",
} as const;
