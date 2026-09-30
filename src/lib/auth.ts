import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { firestore, COLLECTIONS } from "@/lib/firebase-admin";
import { ensureSeeded } from "@/lib/seed";

const COOKIE = "nexus_admin";
const SECRET = process.env.SESSION_SECRET ?? "nexus3d-firebase-session-secret";
const MAX_AGE = 60 * 60 * 24 * 7;

function sign(payload: string) {
  const h = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, h })).toString("base64url");
}

function verify(token: string): string | null {
  try {
    const parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as { payload: string; h: string };
    const expected = createHmac("sha256", SECRET).update(parsed.payload).digest("hex");
    const a = Buffer.from(expected), b = Buffer.from(parsed.h);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const data = JSON.parse(parsed.payload) as { u: string; exp: number };
    if (Date.now() > data.exp) return null;
    return data.u;
  } catch { return null; }
}

export async function loginAdmin(username: string, password: string) {
  await ensureSeeded();
  const snap = await firestore.collection(COLLECTIONS.admins).where("username", "==", username).limit(1).get();
  const admin = snap.docs[0]?.data();
  if (!admin) return false;
  if (!(await bcrypt.compare(password, admin.passwordHash))) return false;

  const payload = JSON.stringify({ u: admin.username, exp: Date.now() + MAX_AGE * 1000 });
  const jar = await cookies();
  jar.set(COOKIE, sign(payload), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: MAX_AGE,
  });
  return true;
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getAdminSession(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  return token ? verify(token) : null;
}

export async function requireAdmin(): Promise<string> {
  const user = await getAdminSession();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
