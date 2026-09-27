import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    const client = (await db.query("select * from clients where id=$1", [id])).rows[0];
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    const campaigns = (await db.query("select * from campaigns where client_id=$1 order by id", [id])).rows;
    const payments = (await db.query("select * from payments where client_id=$1 order by due_date", [id])).rows;
    return NextResponse.json({ client, campaigns, payments });
  } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
}
