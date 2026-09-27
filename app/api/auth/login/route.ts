import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, password } = await req.json();
    if (!name || !password) return NextResponse.json({ error: "Name and password are required." }, { status: 400 });
    const ok = await login(name, password);
    if (!ok) return NextResponse.json({ error: "Invalid founder credentials." }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Login service unavailable." }, { status: 500 });
  }
}
