import { Router } from "express";
import { readStoreFile, storeFileExists, STORE_FILES } from "../lib/data-store";

const router = Router();

router.get("/about", (_req, res) => {
  if (storeFileExists(STORE_FILES.about)) {
    const stored = readStoreFile(STORE_FILES.about);
    if (stored !== null) {
      return res.json(stored);
    }
  }
  return res.status(404).json({ error: "About data not found. Upload a JSON file via /api/admin/upload-about." });
});

export default router;
