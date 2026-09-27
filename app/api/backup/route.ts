import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requireSession();
    const tables = ["clients","campaigns","team_members","tasks","payments","leads","services"];
    const data: Record<string, unknown> = {};
    for (const table of tables) data[table] = (await db.query(`select * from ${table} order by id`)).rows;
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="tnl-command-center-backup.json"' }
    });
  } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
}
