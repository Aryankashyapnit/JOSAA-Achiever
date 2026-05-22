import { Router } from "express";
import { db, collegesTable, cutoffsTable } from "@workspace/db";
import { eq, like, and, type SQL, sql } from "drizzle-orm";
import { readStoreFile, storeFileExists, STORE_FILES } from "../lib/data-store";

const router = Router();

router.get("/colleges", async (req, res) => {
  if (storeFileExists(STORE_FILES.colleges)) {
    const stored = readStoreFile(STORE_FILES.colleges);
    if (stored !== null) {
      return res.json(stored);
    }
  }

  const { state, type, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const conditions: SQL[] = [];
  if (state) conditions.push(eq(collegesTable.state, state));
  if (type) conditions.push(eq(collegesTable.type, type));
  if (search) conditions.push(like(collegesTable.name, `%${search}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const [colleges, countResult] = await Promise.all([
    db.select().from(collegesTable).where(whereClause).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(collegesTable).where(whereClause),
  ]);

  return res.json({
    colleges,
    total: Number(countResult[0]?.count ?? 0),
    page: pageNum,
    limit: limitNum,
  });
});

router.get("/colleges/top", async (req, res) => {
  if (storeFileExists(STORE_FILES.colleges)) {
    const stored = readStoreFile<{ colleges?: unknown[] }>(STORE_FILES.colleges);
    if (stored !== null && stored.colleges) {
      return res.json(stored.colleges);
    }
  }

  const { type, limit = "10" } = req.query as Record<string, string>;
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

  const conditions: SQL[] = [];
  if (type) conditions.push(eq(collegesTable.type, type));

  const colleges = await db
    .select()
    .from(collegesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(collegesTable.nirf)
    .limit(limitNum);

  return res.json(colleges);
});

router.get("/colleges/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid college ID" });

  const [college] = await db.select().from(collegesTable).where(eq(collegesTable.id, id));
  if (!college) return res.status(404).json({ error: "College not found" });

  const branches = await db
    .selectDistinct({ branch: cutoffsTable.branch })
    .from(cutoffsTable)
    .where(eq(cutoffsTable.collegeId, id));

  return res.json({ ...college, branches: branches.map((b) => b.branch) });
});

export default router;
