import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { writeStoreFile, readStoreFile, DATA_STORE_DIR, STORE_FILES } from "../lib/data-store";

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

router.post("/admin/upload-cutoffs", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const data = parseJsonBuffer(req.file.buffer);
  if (data === null) {
    return res.status(400).json({ error: "Invalid JSON file" });
  }
  writeStoreFile(STORE_FILES.cutoffs, data);
  return res.json({ success: true, message: "Cutoffs data saved to disk" });
});

router.post("/admin/upload-predictor", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const data = parseJsonBuffer(req.file.buffer);
  if (data === null) {
    return res.status(400).json({ error: "Invalid JSON file" });
  }
  writeStoreFile(STORE_FILES.predictor, data);
  return res.json({ success: true, message: "Predictor data saved to disk" });
});

router.post("/admin/upload-simulator", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const data = parseJsonBuffer(req.file.buffer);
  if (data === null) {
    return res.status(400).json({ error: "Invalid JSON file" });
  }
  writeStoreFile(STORE_FILES.simulator, data);
  return res.json({ success: true, message: "Simulator data saved to disk" });
});

router.post("/admin/upload-colleges", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const data = parseJsonBuffer(req.file.buffer);
  if (data === null) {
    return res.status(400).json({ error: "Invalid JSON file" });
  }
  writeStoreFile(STORE_FILES.colleges, data);
  return res.json({ success: true, message: "Colleges data saved to disk" });
});

router.post("/admin/upload-about", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const data = parseJsonBuffer(req.file.buffer);
  if (data === null) {
    return res.status(400).json({ error: "Invalid JSON file" });
  }
  writeStoreFile(STORE_FILES.about, data);
  return res.json({ success: true, message: "About data saved to disk" });
});

router.post("/admin/upload-schedule", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const data = parseJsonBuffer(req.file.buffer);
  if (data === null) {
    return res.status(400).json({ error: "Invalid JSON file" });
  }
  writeStoreFile(STORE_FILES.schedule, data);
  return res.json({ success: true, message: "Schedule data saved to disk" });
});

export default router;
