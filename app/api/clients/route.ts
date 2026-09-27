import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try { await requireSession(); return NextResponse.json((await db.query("select * from clients order by id")).rows); }
  catch (e) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
}
