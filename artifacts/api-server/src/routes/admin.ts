import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { eq, sql } from "drizzle-orm";
import { db, collegesTable, cutoffsTable } from "@workspace/db";
import { writeStoreFile, readStoreFile, DATA_STORE_DIR, STORE_FILES } from "../lib/data-store";
import { deriveCollegeInfo } from "../lib/college-utils";
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

router.get("/admin/db-stats", async (_req, res) => {
  try {
    const [collegeCount, cutoffCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(collegesTable),
      db.select({ count: sql<number>`count(*)` }).from(cutoffsTable),
    ]);
    return res.json({
      colleges: Number(collegeCount[0]?.count ?? 0),
      cutoffs: Number(cutoffCount[0]?.count ?? 0),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch DB stats: ${msg}` });
  }
});

interface IngestRow {
  collegeName: string;
  branchName: string;
  openingRank: number;
  closingRank: number;
  year: number;
  round: number;
  category: string;
  gender: string;
}

router.post("/admin/ingest-cutoffs-batch", async (req, res) => {
  const { rows } = req.body as { rows: IngestRow[] };

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "rows must be a non-empty array." });
  }

  const collegeNameCache = new Map<string, number>();
  const newColleges: string[] = [];
  let inserted = 0;
  let skipped = 0;

  try {
    for (const row of rows) {
      const name = (row.collegeName ?? "").trim();
      const branch = (row.branchName ?? "").trim();
      const openingRank = Math.round(Number(row.openingRank));
      const closingRank = Math.round(Number(row.closingRank));
      const year = Math.round(Number(row.year ?? 2024));
      const round = Math.round(Number(row.round ?? 1));
      const category = (row.category ?? "OPEN").trim();
      const gender = (row.gender ?? "Gender-Neutral").trim();

      if (!name || !branch || isNaN(openingRank) || isNaN(closingRank)) {
        skipped++;
        continue;
      }

      let collegeId = collegeNameCache.get(name);

      if (collegeId === undefined) {
        const existing = await db
          .select({ id: collegesTable.id })
          .from(collegesTable)
          .where(eq(collegesTable.name, name))
          .limit(1);

        if (existing.length > 0) {
          collegeId = existing[0].id;
        } else {
          const info = deriveCollegeInfo(name);
          const [inserted_college] = await db
            .insert(collegesTable)
            .values({
              name,
              shortName: info.shortName,
              type: info.type,
              city: info.city,
              state: info.state,
            })
            .returning({ id: collegesTable.id });
          collegeId = inserted_college.id;
          newColleges.push(name);
        }

        collegeNameCache.set(name, collegeId);
      }

      try {
        await db.insert(cutoffsTable).values({
          collegeId,
          branch,
          category,
          gender,
          year,
          round,
          openingRank,
          closingRank,
        });
        inserted++;
      } catch {
        skipped++;
      }
    }

    return res.json({ inserted, skipped, newColleges });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: `Batch processing failed: ${msg}` });
  }
});

router.get("/admin/download/:dataset", (req, res) => {
  const { dataset } = req.params;
  const filename = STORE_FILES[dataset as keyof typeof STORE_FILES];
  if (!filename) {
    return res.status(404).json({ error: "Unknown dataset." });
  }
  const filePath = path.join(DATA_STORE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "No data uploaded yet for this dataset." });
  }
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.send(fs.readFileSync(filePath));
});

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
