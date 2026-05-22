import { Router } from "express";
import multer from "multer";
import { writeStoreFile, STORE_FILES } from "../lib/data-store";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function parseJsonBuffer(buffer: Buffer): unknown {
  try {
    return JSON.parse(buffer.toString("utf-8"));
  } catch {
    return null;
  }
}

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
