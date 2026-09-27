import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requireSession();

    const [clients, campaigns, team, tasks, payments] = await Promise.all([
      db.query("select * from clients order by id"),
      db.query(`select c.*, cl.name client_name, cl.industry from campaigns c join clients cl on cl.id=c.client_id order by c.id`),
      db.query("select * from team_members order by id"),
      db.query("select * from tasks order by due_date nulls last, id"),
      db.query(`select p.*, c.name client_name from payments p left join clients c on c.id=p.client_id order by p.due_date nulls last, p.id`)
    ]);

    const totalRevenue = clients.rows.reduce((s, r) => s + Number(r.revenue), 0);
    const totalSpend = clients.rows.reduce((s, r) => s + Number(r.spend), 0);
    const totalLeads = clients.rows.reduce((s, r) => s + Number(r.leads), 0);
    const totalConverted = clients.rows.reduce((s, r) => s + Number(r.converted), 0);
    const outstanding = payments.rows.filter(r => r.status !== "Paid").reduce((s, r) => s + Number(r.amount), 0);
    const pendingPayments = payments.rows.filter(r => r.status !== "Paid").length;
    const completedTasks = tasks.rows.filter(r => r.status === "Done").length;
    const taskCompletion = tasks.rows.length ? Math.round(completedTasks / tasks.rows.length * 100) : 0;
    const avgCpl = totalLeads ? totalSpend / totalLeads : 0;
    const conversion = totalLeads ? totalConverted / totalLeads * 100 : 0;

    return NextResponse.json({
      kpis: { revenue: totalRevenue, activeClients: clients.rows.filter(r => r.status !== "New").length, leads: totalLeads, outstanding, pendingPayments, spend: totalSpend },
      health: { retention: 92, taskCompletion, leadConversion: conversion, averageCpl: avgCpl },
      clients: clients.rows,
      campaigns: campaigns.rows,
      team: team.rows,
      tasks: tasks.rows,
      payments: payments.rows,
      weekly: [
        { label: "W1", leads: 248, revenue: 36000, spend: 32000 },
        { label: "W2", leads: 291, revenue: 42000, spend: 35000 },
        { label: "W3", leads: 332, revenue: 48000, spend: 39000 },
        { label: "W4", leads: 413, revenue: 56000, spend: 41000 }
      ],
      leadPipeline: [
        { stage: "New Leads", value: 1284 },
        { stage: "Contacted", value: 1050 },
        { stage: "Qualified", value: 748 },
        { stage: "Converted", value: 231 },
        { stage: "Lost", value: 112 }
      ]
    });
  } catch (e) {
    const status = String(e).includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Dashboard error" }, { status });
  }
}
