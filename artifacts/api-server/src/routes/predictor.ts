import { Router } from "express";
import { db, cutoffsTable, collegesTable } from "@workspace/db";
import { eq, and, lte, type SQL } from "drizzle-orm";

const router = Router();

router.get("/predictor/results", async (req, res) => {
  const { rank, category, gender, type, year = "2024" } = req.query as Record<string, string>;

  if (!rank || !category || !gender) {
    return res.status(400).json({ error: "rank, category, and gender are required" });
  }

  const userRank = parseInt(rank);
  const targetYear = parseInt(year);
  const SAFE_MARGIN = 0.8;
  const MODERATE_MARGIN = 1.3;
  const AMBITIOUS_MARGIN = 2.5;

  const conditions: SQL[] = [
    eq(cutoffsTable.year, targetYear),
    eq(cutoffsTable.round, 6),
    eq(cutoffsTable.category, category),
    eq(cutoffsTable.gender, gender),
  ];

  const rows = await db
    .select({
      id: cutoffsTable.id,
      collegeId: cutoffsTable.collegeId,
      collegeName: collegesTable.name,
      collegeShortName: collegesTable.shortName,
      collegeType: collegesTable.type,
      collegeState: collegesTable.state,
      collegeCity: collegesTable.city,
      collegeNirf: collegesTable.nirf,
      collegeEstablished: collegesTable.established,
      collegeTotalSeats: collegesTable.totalSeats,
      collegeWebsite: collegesTable.website,
      branch: cutoffsTable.branch,
      category: cutoffsTable.category,
      gender: cutoffsTable.gender,
      closingRank: cutoffsTable.closingRank,
      openingRank: cutoffsTable.openingRank,
    })
    .from(cutoffsTable)
    .leftJoin(collegesTable, eq(cutoffsTable.collegeId, collegesTable.id))
    .where(and(...conditions))
    .orderBy(cutoffsTable.closingRank);

  const filteredRows = type
    ? rows.filter((r) => r.collegeType === type)
    : rows;

  const safe = filteredRows
    .filter((r) => r.closingRank >= userRank * SAFE_MARGIN && r.closingRank <= userRank)
    .slice(0, 15)
    .map((r) => mapResult(r, "safe", userRank));

  const moderate = filteredRows
    .filter((r) => r.closingRank > userRank && r.closingRank <= userRank * MODERATE_MARGIN)
    .slice(0, 15)
    .map((r) => mapResult(r, "moderate", userRank));

  const ambitious = filteredRows
    .filter((r) => r.closingRank > userRank * MODERATE_MARGIN && r.closingRank <= userRank * AMBITIOUS_MARGIN)
    .slice(0, 10)
    .map((r) => mapResult(r, "ambitious", userRank));

  return res.json({ rank: userRank, category, gender, safe, moderate, ambitious });
});

function mapResult(r: any, likelihood: string, userRank: number) {
  return {
    college: {
      id: r.collegeId,
      name: r.collegeName ?? "Unknown",
      shortName: r.collegeShortName ?? "",
      type: r.collegeType ?? "",
      state: r.collegeState ?? "",
      city: r.collegeCity ?? "",
      nirf: r.collegeNirf ?? null,
      established: r.collegeEstablished ?? null,
      totalSeats: r.collegeTotalSeats ?? null,
      website: r.collegeWebsite ?? null,
    },
    branch: r.branch,
    category: r.category,
    gender: r.gender,
    closingRank: r.closingRank,
    likelihood,
    rankDifference: r.closingRank - userRank,
  };
}

export default router;
