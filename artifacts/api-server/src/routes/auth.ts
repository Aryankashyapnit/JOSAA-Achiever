import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-me";

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SESSION_SECRET, 100000, 64, "sha512").toString("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  const inputHash = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(inputHash, "hex"), Buffer.from(hash, "hex"));
}

function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}`;
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

function verifyToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [userIdStr, ts, sig] = parts;
    const payload = `${userIdStr}:${ts}`;
    const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"))) return null;
    return parseInt(userIdStr, 10);
  } catch {
    return null;
  }
}

export async function authMiddleware(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const token = auth.slice(7);
  const userId = verifyToken(token);
  if (!userId) return res.status(401).json({ error: "Invalid token" });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return res.status(401).json({ error: "User not found" });
  req.currentUser = user;
  next();
}

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = generateToken(user.id);
  const { passwordHash, ...safeUser } = user;
  return res.json({ user: safeUser, token });
});

router.post("/auth/signup", async (req, res) => {
  const { name, email, password, jeeRank, category } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password required" });
  }
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }
  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    name,
    email: email.toLowerCase(),
    passwordHash,
    jeeRank: jeeRank ?? null,
    category: category ?? null,
  }).returning();
  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;
  return res.status(201).json({ user: safeUser, token });
});

router.post("/auth/logout", (_req, res) => {
  return res.json({ message: "Logged out" });
});

router.get("/auth/me", authMiddleware, (req: any, res) => {
  const { passwordHash, ...safeUser } = req.currentUser;
  return res.json(safeUser);
});

export default router;
