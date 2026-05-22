import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { writeStoreFile, readStoreFile, DATA_STORE_DIR, STORE_FILES } from "../lib/data-store";
import {
  validateCutoffs,
  validatePredictor,
  validateSimulator,
  validateColleges,
  validateAbout,
  validateSchedule,
} from "../lib/validators";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function parseJsonBuffer(buffer: Buffer): unknown {
  try {
    return JSON.parse(buffer.toString("utf-8"));
  } catch {
    return null;
  }
}

router.get("/admin/store-status", (req, res) => {
  const result: Record<string, { exists: boolean; recordCount: number | null; lastModified: string | null }> = {};

  for (const [key, filename] of Object.entries(STORE_FILES)) {
    const filePath = path.join(DATA_STORE_DIR, filename);
    const exists = fs.existsSync(filePath);
    if (!exists) {
      result[key] = { exists: false, recordCount: null, lastModified: null };
      continue;
    }
    let recordCount: number | null = null;
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) recordCount = parsed.length;
      else if (parsed && typeof parsed === "object") recordCount = Object.keys(parsed).length;
    } catch {
      recordCount = null;
    }
    const stat = fs.statSync(filePath);
    result[key] = {
      exists: true,
      recordCount,
      lastModified: stat.mtime.toISOString(),
    };
  }

  return res.json(result);
});

function handleUpload(
  storeKey: keyof typeof STORE_FILES,
  validator: (data: unknown) => { valid: boolean; errors: string[] },
  successMsg: string,
) {
  return [
    upload.single("file"),
    (req: import("express").Request, res: import("express").Response) => {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }
      const data = parseJsonBuffer(req.file.buffer);
      if (data === null) {
        return res.status(400).json({ error: "Invalid JSON — the file could not be parsed. Ensure it is valid JSON." });
      }
      const result = validator(data);
      if (!result.valid) {
        return res.status(422).json({
          error: result.errors[0],
          details: result.errors.slice(1),
        });
      }
      writeStoreFile(STORE_FILES[storeKey], data);
      const count = Array.isArray(data) ? data.length : null;
      return res.json({
        success: true,
        message: successMsg,
        recordCount: count,
      });
    },
  ] as import("express").RequestHandler[];
}

router.post("/admin/upload-cutoffs",   ...handleUpload("cutoffs",   validateCutoffs,   "Cutoffs data validated and saved to disk."));
router.post("/admin/upload-predictor", ...handleUpload("predictor", validatePredictor, "Predictor data validated and saved to disk."));
router.post("/admin/upload-simulator", ...handleUpload("simulator", validateSimulator, "Simulator data validated and saved to disk."));
router.post("/admin/upload-colleges",  ...handleUpload("colleges",  validateColleges,  "Colleges data validated and saved to disk."));
router.post("/admin/upload-about",     ...handleUpload("about",     validateAbout,     "About data validated and saved to disk."));
router.post("/admin/upload-schedule",  ...handleUpload("schedule",  validateSchedule,  "Schedule data validated and saved to disk."));

export default router;
