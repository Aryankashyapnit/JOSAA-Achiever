import { Router } from "express";
import { db, cutoffsTable, collegesTable } from "@workspace/db";
import { eq, and, type SQL, sql } from "drizzle-orm";

const router = Router();

router.get("/cutoffs", async (req, res) => {
  const {
    collegeId,
    branch,
    category,
    year,
    round,
    gender,
    page = "1",
    limit = "50",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const conditions: SQL[] = [];
  if (collegeId) conditions.push(eq(cutoffsTable.collegeId, parseInt(collegeId)));
  if (branch) conditions.push(eq(cutoffsTable.branch, branch));
  if (category) conditions.push(eq(cutoffsTable.category, category));
  if (year) conditions.push(eq(cutoffsTable.year, parseInt(year)));
  if (round) conditions.push(eq(cutoffsTable.round, parseInt(round)));
  if (gender) conditions.push(eq(cutoffsTable.gender, gender));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [cutoffs, countResult] = await Promise.all([
    db
      .select({
        id: cutoffsTable.id,
        collegeId: cutoffsTable.collegeId,
        collegeName: collegesTable.name,
        branch: cutoffsTable.branch,
        category: cutoffsTable.category,
        gender: cutoffsTable.gender,
        year: cutoffsTable.year,
        round: cutoffsTable.round,
        openingRank: cutoffsTable.openingRank,
        closingRank: cutoffsTable.closingRank,
      })
      .from(cutoffsTable)
      .leftJoin(collegesTable, eq(cutoffsTable.collegeId, collegesTable.id))
      .where(whereClause)
      .orderBy(cutoffsTable.year, cutoffsTable.round, cutoffsTable.closingRank)
      .limit(limitNum)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(cutoffsTable).where(whereClause),
  ]);

  return res.json({
    cutoffs: cutoffs.map((c) => ({ ...c, collegeName: c.collegeName ?? "Unknown" })),
    total: Number(countResult[0]?.count ?? 0),
    page: pageNum,
    limit: limitNum,
  });
});

router.get("/cutoffs/trends", async (req, res) => {
  const { collegeId, branch, category, gender = "Gender-Neutral" } = req.query as Record<string, string>;

  if (!collegeId || !branch || !category) {
    return res.status(400).json({ error: "collegeId, branch, and category are required" });
  }

  const trends = await db
    .select({
      year: cutoffsTable.year,
      round: cutoffsTable.round,
      openingRank: cutoffsTable.openingRank,
      closingRank: cutoffsTable.closingRank,
    })
    .from(cutoffsTable)
    .where(
      and(
        eq(cutoffsTable.collegeId, parseInt(collegeId)),
        eq(cutoffsTable.branch, branch),
        eq(cutoffsTable.category, category),
        eq(cutoffsTable.gender, gender),
      ),
    )
    .orderBy(cutoffsTable.year, cutoffsTable.round);

  return res.json(trends);
});

export default router;
