 "use client";

import { useEffect, useMemo, useState } from "react";

type DashboardData = {
  kpis: any; health: any; clients: any[]; campaigns: any[]; team: any[]; tasks: any[]; payments: any[];
  weekly: any[]; leadPipeline: any[];
};

const money = (n:number) => "₹" + Math.round(n).toLocaleString("en-IN");
const pct = (n:number) => `${Number(n || 0).toFixed(1)}%`;

export default function Dashboard() {
  const [auth, setAuth] = useState<boolean|null>(null);
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<DashboardData|null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [clientFilter, setClientFilter] = useState("All Clients");
  const [selectedClient, setSelectedClient] = useState<any|null>(null);
  const [busy, setBusy] = useState(false);

  async function checkAuth() {
    const r = await fetch("/api/auth/me", { cache:"no-store" });
    const j = await r.json();
    setAuth(j.authenticated); setUser(j.user);
    if (j.authenticated) loadDashboard();
  }
  async function loadDashboard() {
    const r = await fetch("/api/dashboard", { cache:"no-store" });
    if (r.ok) setData(await r.json());
  }
  useEffect(() => { checkAuth(); }, []);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const r = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name,password}) });
    const j = await r.json();
    if (!r.ok) setError(j.error || "Login failed"); else { setAuth(true); setUser({name:"JD",role:"FOUNDER"}); loadDashboard(); }
    setBusy(false);
  }
  async function logout() {
    await fetch("/api/auth/logout", { method:"POST" });
    setAuth(false); setData(null);
  }
  async function markTask(id:number, status:string) {
    await fetch("/api/tasks", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id,status}) });
    loadDashboard();
  }

  const filteredClients = useMemo(() => {
    if (!data) return [];
    return clientFilter === "All Clients" ? data.clients : data.clients.filter(c => c.name === clientFilter);
  }, [data,clientFilter]);

  if (auth === null) return <div className="loading">Loading TNL Command Center…</div>;

  if (!auth) return (
    <main className="login">
      <section className="login-card">
        <div className="brand-mark">TNL</div>
        <p className="eyebrow">COMMAND CENTER</p>
        <h1>Founder Growth Overview</h1>
        <p className="muted">Manage the business. Understand the data. Drive growth.</p>
        <form onSubmit={doLogin}>
          <label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name" autoComplete="username" /></label>
          <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" autoComplete="current-password" /></label>
          {error && <div className="error">{error}</div>}
          <button className="primary wide" disabled={busy}>{busy ? "Signing in…" : "Enter Command Center"}</button>
        </form>
        <small>Secure server-side authentication • TNL Founder</small>
      </section>
    </main>
  );

  if (!data) return <div className="loading">Loading live business data…</div>;

  return (
    <main>
      <header className="topbar">
        <div><div className="eyebrow">TNL / COMMAND CENTER</div><h1>Founder Growth Overview</h1><p>Manage the business. Understand the data. Drive growth.</p></div>
        <div className="top-actions"><select><option>This Month</option><option>This Week</option><option>This Quarter</option><option>Custom</option></select><select value={clientFilter} onChange={e=>setClientFilter(e.target.value)}><option>All Clients</option>{data.clients.map(c=><option key={c.id}>{c.name}</option>)}</select><button onClick={()=>location.href="/api/backup"}>Backup</button><button onClick={logout}>Logout</button></div>
      </header>

      <nav className="nav"><a href="#overview">Overview</a><a href="#clients">Clients</a><a href="#marketing">Marketing</a><a href="#operations">Operations</a><a href="#crm">CRM</a><span className="user-pill">{user?.name} • {user?.role}</span></nav>

      <section id="overview" className="section">
        <div className="section-title">BUSINESS OVERVIEW</div>
        <div className="kpis">
          <Kpi title="Revenue" value={money(data.kpis.revenue)} trend="+12.4%" />
          <Kpi title="Active Clients" value={data.kpis.activeClients} sub="ongoing accounts" />
          <Kpi title="Leads Generated" value={data.kpis.leads.toLocaleString()} trend="+18.7%" />
          <Kpi title="Outstanding" value={money(data.kpis.outstanding)} sub={`${data.kpis.pendingPayments} pending payments`} />
        </div>

        <div className="grid two">
          <Panel title="Revenue & Lead Trend">
            <div className="legend"><span>Leads</span><span>Revenue</span><span>Ad Spend</span></div>
            <div className="bars">{data.weekly.map(w=><div className="bar-col" key={w.label}><div className="bar" style={{height:`${Math.max(12,w.leads/4)}px`}} title={`${w.leads} leads`}></div><b>{w.label}</b><small>{money(w.revenue)}</small></div>)}</div>
          </Panel>
          <Panel title="Business Health">
            <Health label="Client Retention" value={data.health.retention}/>
            <Health label="Task Completion" value={data.health.taskCompletion}/>
            <Health label="Lead Conversion" value={data.health.leadConversion}/>
            <div className="health-row"><span>Average CPL</span><b>{money(data.health.averageCpl)}</b></div>
          </Panel>
        </div>
      </section>

      <section id="clients" className="section">
        <div className="section-title">CLIENT PERFORMANCE</div>
        <Panel title="Client Performance">
          <div className="table-wrap"><table><thead><tr><th>Client</th><th>Industry</th><th>Spend</th><th>Leads</th><th>Qualified</th><th>Converted</th><th>Revenue</th><th>CPL</th><th>ROAS</th><th>Status</th></tr></thead><tbody>
            {filteredClients.map(c=><tr key={c.id} onClick={()=>setSelectedClient(c)} className="clickable"><td><b>{c.name}</b></td><td>{c.industry}</td><td>{money(c.spend)}</td><td>{c.leads}</td><td>{c.qualified}</td><td>{c.converted}</td><td>{money(c.revenue)}</td><td>{c.leads ? money(c.spend/c.leads) : "—"}</td><td>{Number(c.roas).toFixed(1)}</td><td><Status s={c.status}/></td></tr>)}
          </tbody></table></div>
        </Panel>
      </section>

      <section id="marketing" className="section">
        <div className="section-title">MARKETING PERFORMANCE</div>
        <div className="kpis mini">{[
          ["Impressions",data.campaigns.reduce((s,c)=>s+Number(c.impressions),0).toLocaleString()],
          ["Clicks",data.campaigns.reduce((s,c)=>s+Number(c.clicks),0).toLocaleString()],
          ["CTR",pct(data.campaigns.reduce((s,c)=>s+Number(c.clicks),0)/Math.max(1,data.campaigns.reduce((s,c)=>s+Number(c.impressions),0))*100)],
          ["CPL",money(data.kpis.spend/Math.max(1,data.kpis.leads))],
          ["ROAS", (data.kpis.revenue/Math.max(1,data.kpis.spend)).toFixed(1)]
        ].map(x=><Kpi key={x[0]} title={x[0]} value={x[1]}/>)}</div>
        <Panel title="Campaign Performance">
          <div className="table-wrap"><table><thead><tr><th>Client</th><th>Campaign</th><th>Spend</th><th>Impressions</th><th>CTR</th><th>CPC</th><th>Leads</th><th>CPL</th><th>Conversions</th><th>CPA</th><th>ROAS</th></tr></thead><tbody>{data.campaigns.map(c=><tr key={c.id}><td>{c.client_name}</td><td>{c.name}</td><td>{money(c.spend)}</td><td>{Number(c.impressions).toLocaleString()}</td><td>{pct(c.ctr)}</td><td>{money(c.cpc)}</td><td>{Math.round(Number(c.clicks))}</td><td>{money(c.cpl)}</td><td>{c.conversions}</td><td>{money(c.cpa)}</td><td>{Number(c.roas).toFixed(1)}</td></tr>)}</tbody></table></div>
        </Panel>
      </section>

      <section id="operations" className="section">
        <div className="section-title">TEAM OPERATIONS & ACTION QUEUE</div>
        <div className="grid two">
          <Panel title="Team Operations"><div className="team-list">{data.team.map(t=><div className="team-row" key={t.id}><div><b>{t.name}</b><span>{t.role}</span></div><strong className={t.workload_pct>80?"danger-text":""}>{t.workload_pct}%</strong></div>)}</div></Panel>
          <Panel title="Founder Action Queue"><div className="tasks">{data.tasks.map(t=><div className="task" key={t.id}><div><b>{t.title}</b><span>{t.owner} • {t.priority} • Due {t.due_date}</span></div><button onClick={()=>markTask(t.id,t.status==="Done"?"Pending":"Done")}>{t.status==="Done"?"Done":"Mark done"}</button></div>)}</div></Panel>
        </div>
      </section>

      <section id="crm" className="section">
        <div className="section-title">CRM / LEAD PIPELINE</div>
        <Panel title="Lead Pipeline"><div className="pipeline">{data.leadPipeline.map((p,i)=><div className="pipe" key={p.stage}><b>{p.value.toLocaleString()}</b><span>{p.stage}</span>{i<data.leadPipeline.length-1 && <em>→</em>}</div>)}</div></Panel>
      </section>

      <section className="section">
        <div className="section-title">GROWTH SIGNALS</div>
        <div className="signals"><div>↗ <b>Lead volume +18.7%</b><span>Investigate which channels and clients drove the increase.</span></div><div>₹ <b>{money(data.kpis.outstanding)} outstanding</b><span>Review pending payment follow-ups.</span></div><div>⚠ <b>Team capacity</b><span>{data.team.filter(t=>t.workload_pct>80).length} member(s) above 80% workload.</span></div><div>◎ <b>ROAS review</b><span>{data.clients.filter(c=>c.roas>0 && c.roas<3).length} client(s) below 3.0 ROAS.</span></div></div>
      </section>

      {selectedClient && <ClientModal client={selectedClient} onClose={()=>setSelectedClient(null)} />}
      <footer>© 2026 TNL • Founder Command Center • Server-backed business intelligence</footer>
    </main>
  );
}

function Kpi({title,value,trend,sub}:{title:string,value:any,trend?:string,sub?:string}){return <div className="kpi"><span>{title}</span><strong>{value}</strong>{trend?<small className="positive">{trend}</small>:<small>{sub}</small>}</div>}
function Panel({title,children}:{title:string,children:React.ReactNode}){return <div className="panel"><div className="panel-head"><h3>{title}</h3></div>{children}</div>}
function Health({label,value}:{label:string,value:number}){return <div className="health-row"><span>{label}</span><div className="progress"><i style={{width:`${Math.min(100,value)}%`}}></i></div><b>{pct(value)}</b></div>}
function Status({s}:{s:string}){return <span className={`status ${s.toLowerCase().replace(" ","-")}`}>{s}</span>}
function ClientModal({client,onClose}:{client:any,onClose:()=>void}){
  const [detail,setDetail]=useState<any>(null);
  useEffect(()=>{fetch(`/api/clients/${client.id}`).then(r=>r.json()).then(setDetail)},[client.id]);
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={onClose}>×</button><div className="eyebrow">CLIENT DETAIL</div><h2>{client.name}</h2><p className="muted">{client.industry}</p><div className="kpis mini"><Kpi title="Spend" value={money(client.spend)}/><Kpi title="Leads" value={client.leads}/><Kpi title="Qualified" value={client.qualified}/><Kpi title="Converted" value={client.converted}/><Kpi title="Revenue" value={money(client.revenue)}/><Kpi title="ROAS" value={Number(client.roas).toFixed(1)}/></div><Panel title="Campaigns">{detail?.campaigns?.map((c:any)=><div className="detail-line" key={c.id}><b>{c.name}</b><span>{money(c.spend)} spend • {c.conversions} conversions • {Number(c.roas).toFixed(1)} ROAS</span></div>)}</Panel></div></div>
}
