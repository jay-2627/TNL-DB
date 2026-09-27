-- TNL Command Center browser-only seed
-- Run this AFTER sql/schema.sql in Supabase SQL Editor.
-- Default founder login:
--   Name: JD
--   Password: FOUNDER OF TNL
-- Change the password later from your database/admin workflow before production.

insert into users (name, password_hash, role)
values ('JD', '$2a$12$p3lN/O4VtzKFU0k.8YGNv.dWCQnSXhP4B5VrpyHRsR.qXozXfwfCC', 'FOUNDER')
on conflict (name) do update
set password_hash = excluded.password_hash,
    role = 'FOUNDER';

truncate table tasks, payments, campaigns, leads, clients, team_members, services restart identity cascade;

insert into team_members(name, role, open_tasks, workload_pct) values
('JD','Strategy / Meta Ads',12,72),
('Yugesh','CRM / Operations',9,61),
('Sri Ram','Creative Editing',14,84),
('Ramesh','Video Editing',11,69);

insert into clients(name, industry, spend, leads, qualified, converted, revenue, roas, status) values
('Client A','Real Estate',42000,214,196,18,8200,3.2,'On Track'),
('Client B','Education',35000,286,241,31,6120,4.1,'On Track'),
('Client C','Clinic',28000,173,149,14,7000,3.5,'Watch'),
('Client D','D2C',52000,311,278,42,9450,4.7,'On Track'),
('Client E','Gym',19000,128,107,9,7330,2.8,'Watch'),
('Client F','Interior',31000,172,155,17,6470,3.9,'On Track'),
('Client G','Coaching',0,0,0,0,0,0,'New'),
('Client H','Solar',0,0,0,0,0,0,'New');

insert into campaigns(client_id,name,spend,impressions,reach,ctr,cpc,clicks,cpl,conversions,cpa,roas)
select c.id, x.name, x.spend, x.impressions, x.reach, x.ctr, x.cpc, x.clicks, x.cpl, x.conversions, x.cpa, x.roas
from (values
('Client A','Property Leads - Sep',22000,145000,7200,4.9,1.6,152,144.74,8,2750,3.2),
('Client B','Admissions - Sep',18000,132000,6200,4.7,1.5,171,105.26,19,947.37,4.1),
('Client C','Clinic Appointment',14000,98000,5400,4.2,1.4,102,137.25,7,2000,3.5),
('Client D','D2C Sales',30000,210000,7200,5.0,1.43,190,157.89,25,1200,4.7),
('Client E','Membership Leads',10000,74000,5100,3.9,1.35,72,138.89,5,2000,2.8),
('Client F','Interior Enquiries',17000,118000,5600,4.7,1.43,108,157.41,10,1700,3.9)
) as x(client_name,name,spend,impressions,reach,ctr,cpc,clicks,cpl,conversions,cpa,roas)
join clients c on c.name = x.client_name;

insert into tasks(title, owner, priority, due_date, status) values
('Launch Client G campaign','JD','High','2026-09-28','Pending'),
('Update Client D dashboard','JD','Medium','2026-09-27','In Progress'),
('CRM cleanup','Yugesh','Medium','2026-09-29','Pending'),
('Edit Client A creatives','Sri Ram','High','2026-09-28','In Progress'),
('Client F report','Ramesh','Low','2026-09-30','Pending'),
('Weekly report automation','JD','Medium','2026-10-01','Pending');

insert into payments(client_id, amount, due_date, status)
select c.id, x.amount, x.due_date::date, x.status
from (values
('Client A',12000,'2026-09-20','Pending'),
('Client C',11000,'2026-09-22','Pending'),
('Client E',11000,'2026-09-24','Pending'),
('Client B',30000,'2026-09-18','Paid'),
('Client D',52000,'2026-09-16','Paid'),
('Client F',31000,'2026-09-17','Paid')
) as x(client_name,amount,due_date,status)
join clients c on c.name = x.client_name;

insert into services(name, revenue) values
('Meta Ads', 112000),
('Content', 18000),
('Editing', 24000),
('Analytics', 9000),
('Dashboard', 12000),
('Automation', 8500),
('Strategy', 12500);

-- A small CRM dataset so the dashboard has lead records immediately.
insert into leads(client_id, source, stage)
select c.id, x.source, x.stage
from (values
('Client A','Meta Ads','New'),('Client A','Meta Ads','Qualified'),('Client A','Referral','Converted'),
('Client B','Meta Ads','Contacted'),('Client B','Organic','Qualified'),('Client B','Meta Ads','Converted'),
('Client C','Meta Ads','New'),('Client C','Website','Qualified'),('Client D','Meta Ads','Converted'),
('Client D','Referral','Qualified'),('Client E','Meta Ads','New'),('Client F','Meta Ads','Contacted')
) as x(client_name,source,stage)
join clients c on c.name = x.client_name;

select 'TNL browser seed complete' as status;
