import { Router } from "express";
import { db, counsellingRoundsTable, seatMatrixTable, cutoffsTable, collegesTable } from "@workspace/db";
import { eq, and, type SQL } from "drizzle-orm";

const router = Router();

router.get("/counselling/rounds", async (_req, res) => {
  const rounds = await db
    .select()
    .from(counsellingRoundsTable)
    .orderBy(counsellingRoundsTable.year, counsellingRoundsTable.roundNumber);
  return res.json(rounds);
});

router.get("/counselling/seat-matrix", async (req, res) => {
  const { collegeId, category, year = "2024" } = req.query as Record<string, string>;

  const conditions: SQL[] = [eq(seatMatrixTable.year, parseInt(year))];
  if (collegeId) conditions.push(eq(seatMatrixTable.collegeId, parseInt(collegeId)));
  if (category) conditions.push(eq(seatMatrixTable.category, category));

  const rows = await db
    .select()
    .from(seatMatrixTable)
    .where(and(...conditions))
    .orderBy(seatMatrixTable.branch, seatMatrixTable.category);

  return res.json(rows);
});

router.post("/counselling/simulate", async (req, res) => {
  const { rank, category, gender, year = 2024, preferences } = req.body;

  if (!rank || !category || !gender || !preferences || !Array.isArray(preferences)) {
    return res.status(400).json({ error: "rank, category, gender, and preferences are required" });
  }

  let allottedCollege: string | null = null;
  let allottedBranch: string | null = null;
  let allottedRound: number | null = null;
  let checkedPreferences = 0;

  for (const pref of preferences) {
    checkedPreferences++;
    const { collegeId, branch, category: prefCategory, gender: prefGender } = pref;
    const matchCategory = prefCategory ?? category;
    const matchGender = prefGender ?? gender;

    const [cutoff] = await db
      .select()
      .from(cutoffsTable)
      .where(
        and(
          eq(cutoffsTable.collegeId, collegeId),
          eq(cutoffsTable.branch, branch),
          eq(cutoffsTable.category, matchCategory),
          eq(cutoffsTable.gender, matchGender),
          eq(cutoffsTable.year, year),
          eq(cutoffsTable.round, 6),
        ),
      );

    if (cutoff && rank <= cutoff.closingRank) {
      const [college] = await db
        .select()
        .from(collegesTable)
        .where(eq(collegesTable.id, collegeId));
      allottedCollege = college?.name ?? `College ID ${collegeId}`;
      allottedBranch = branch;
      allottedRound = 6;
      break;
    }
  }

  if (allottedCollege) {
    return res.json({
      rank,
      category,
      allottedCollege,
      allottedBranch,
      round: allottedRound,
      message: `Congratulations! Based on your preferences, you would likely receive an allotment at ${allottedCollege} for ${allottedBranch}.`,
      checkedPreferences,
    });
  }

  return res.json({
    rank,
    category,
    allottedCollege: null,
    allottedBranch: null,
    round: null,
    message: "Based on your rank and preferences, no allotment was found. Consider adding more colleges or broader preferences.",
    checkedPreferences,
  });
});

export default router;
