import pg from "pg";
import bcrypt from "bcryptjs";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const password = process.env.FOUNDER_PASSWORD || "change-this-before-production";
const hash = await bcrypt.hash(password, 12);

await pool.query(`
INSERT INTO users (name, password_hash, role)
VALUES ('JD', $1, 'FOUNDER')
ON CONFLICT (name) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'FOUNDER'
`, [hash]);

await pool.query(`TRUNCATE tasks, payments, campaigns, leads, clients, team_members, services RESTART IDENTITY CASCADE`);

const team = [
  ["JD","Strategy / Meta Ads",12,72],
  ["Yugesh","CRM / Operations",9,61],
  ["Sri Ram","Creative Editing",14,84],
  ["Ramesh","Video Editing",11,69]
];
for (const [name,role,open,load] of team)
  await pool.query(`INSERT INTO team_members(name,role,open_tasks,workload_pct) VALUES($1,$2,$3,$4)`, [name,role,open,load]);

const clients = [
  ["Client A","Real Estate",42000,214,196,18,8200,3.2,"On Track"],
  ["Client B","Education",35000,286,241,31,6120,4.1,"On Track"],
  ["Client C","Clinic",28000,173,149,14,7000,3.5,"Watch"],
  ["Client D","D2C",52000,311,278,42,9450,4.7,"On Track"],
  ["Client E","Gym",19000,128,107,9,7330,2.8,"Watch"],
  ["Client F","Interior",31000,172,155,17,6470,3.9,"On Track"],
  ["Client G","Coaching",0,0,0,0,0,0,"New"],
  ["Client H","Solar",0,0,0,0,0,0,"New"]
];
for (const c of clients)
  await pool.query(`INSERT INTO clients(name,industry,spend,leads,qualified,converted,revenue,roas,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`, c);

const clientRows = await pool.query(`SELECT id,name FROM clients ORDER BY id`);
const idByName = Object.fromEntries(clientRows.rows.map(r => [r.name, r.id]));

const campaigns = [
  ["Client A","Property Leads - Sep",22000,145000,7200,4.9,1.6,152,144.74,8,2750,3.2],
  ["Client B","Admissions - Sep",18000,132000,6200,4.7,1.5,171,105.26,19,947.37,4.1],
  ["Client C","Clinic Appointment",14000,98000,5400,4.2,1.4,102,137.25,7,2000,3.5],
  ["Client D","D2C Sales",30000,210000,7200,5.0,1.43,190,157.89,25,1200,4.7],
  ["Client E","Membership Leads",10000,74000,5100,3.9,1.35,72,138.89,5,2000,2.8],
  ["Client F","Interior Enquiries",17000,118000,5600,4.7,1.43,108,157.41,10,1700,3.9]
];
for (const x of campaigns) {
  const [cn,cname,spend,impressions,reach,ctr,cpc,clicks,cpl,conv, cpa, roas] = x;
  await pool.query(`INSERT INTO campaigns(client_id,name,spend,impressions,reach,ctr,cpc,clicks,cpl,conversions,cpa,roas) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [idByName[cn],cname,spend,impressions,reach,ctr,cpc,clicks,cpl,conv,cpa,roas]);
}

const taskRows = [
  ["Launch Client G campaign","JD","High","2026-09-28","Pending"],
  ["Update Client D dashboard","JD","Medium","2026-09-27","In Progress"],
  ["CRM cleanup","Yugesh","Medium","2026-09-29","Pending"],
  ["Edit Client A creatives","Sri Ram","High","2026-09-28","In Progress"],
  ["Client F report","Ramesh","Low","2026-09-30","Pending"],
  ["Weekly report automation","JD","Medium","2026-10-01","Pending"]
];
for (const t of taskRows)
  await pool.query(`INSERT INTO tasks(title,owner,priority,due_date,status) VALUES($1,$2,$3,$4,$5)`, t);

const payments = [
  ["Client A",12000,"2026-09-20","Pending"],
  ["Client C",11000,"2026-09-22","Pending"],
  ["Client E",11000,"2026-09-24","Pending"],
  ["Client B",30000,"2026-09-18","Paid"],
  ["Client D",52000,"2026-09-16","Paid"],
  ["Client F",31000,"2026-09-17","Paid"]
];
for (const p of payments)
  await pool.query(`INSERT INTO payments(client_id,amount,due_date,status) VALUES($1,$2,$3,$4)`, [idByName[p[0]],p[1],p[2],p[3]]);

await pool.end();
console.log("TNL seed complete.");
