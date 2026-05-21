import { Router } from "express";
import { db, collegesTable, cutoffsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (_req, res) => {
  const [
    collegeCountResult,
    branchCountResult,
    cutoffCountResult,
    yearsResult,
    typeCountResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(collegesTable),
    db.selectDistinct({ branch: cutoffsTable.branch }).from(cutoffsTable),
    db.select({ count: sql<number>`count(*)` }).from(cutoffsTable),
    db.selectDistinct({ year: cutoffsTable.year }).from(cutoffsTable).orderBy(cutoffsTable.year),
    db.select({ type: collegesTable.type, count: sql<number>`count(*)` })
      .from(collegesTable)
      .groupBy(collegesTable.type),
  ]);

  const typeCounts = Object.fromEntries(typeCountResult.map((r) => [r.type, Number(r.count)]));

  return res.json({
    totalColleges: Number(collegeCountResult[0]?.count ?? 0),
    totalBranches: branchCountResult.length,
    totalCutoffRecords: Number(cutoffCountResult[0]?.count ?? 0),
    availableYears: yearsResult.map((r) => r.year),
    iitCount: typeCounts["IIT"] ?? 0,
    nitCount: typeCounts["NIT"] ?? 0,
    iiitCount: typeCounts["IIIT"] ?? 0,
    gftiCount: typeCounts["GFTI"] ?? 0,
  });
});

export default router;
