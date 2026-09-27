import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    await requireSession();
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });
    const row = (await db.query("update tasks set status=$1 where id=$2 returning *", [status, id])).rows[0];
    return NextResponse.json(row);
  } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
}
