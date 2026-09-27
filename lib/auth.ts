import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "development-only-secret-change-me");
const COOKIE = "tnl_session";

export async function login(name: string, password: string) {
  const result = await db.query("select id, name, password_hash, role from users where lower(name)=lower($1) limit 1", [name]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return false;

  const token = await new SignJWT({ sub: String(user.id), name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return true;
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function logout() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
}
