import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, clearSession, LOGO } from "./api";

const links = [
  ["/admin", "Dashboard"],
  ["/admin/users", "All approved users"],
  ["/admin/leaderboard", "Leaderboard"],
  ["/admin/referrals", "Referral Commissions"],
  ["/admin/deposits", "New user Request"],
  ["/admin/withdrawals", "Withdrawal Request"],
  ["/admin/today-users", "Today Approved Users"],
  ["/admin/today-withdrawals", "Today approved Withdrawal"],
  ["/admin/rejected", "Rejected User"],
  ["/admin/upgrades", "Plan Upgrade"],
  ["/admin/gateways", "Easypaisa & JazzCash"],
  ["/admin/transactions", "Transactions"],
  ["/admin/settings", "General Setting"],
  ["/admin/channels", "Official Channels"],
  ["/admin/contacts", "Contact Us Admins"],
  ["/admin/levels", "Levels Setting"],
  ["/admin/rewards", "Rewards"],
];

export function AdminShell({ children }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const search = (e) => {
    e.preventDefault();
    setOpen(false);
    navigate(`/admin/users?status=all&q=${encodeURIComponent(q.trim())}`);
  };
  return (
    <div className="admin">
      <aside className="side">
        <img src={LOGO} alt="Flower" />
        {links.map(([to, label]) => <NavLink key={to} to={to} end={to === "/admin"}>{label}</NavLink>)}
        <button className="btn" style={{ marginTop: 16 }} onClick={() => { clearSession(); window.location.href = "/admin/login"; }}>Logout</button>
      </aside>
      <div className="admin-col">
        <header className="admin-top">
          <button className="burger" aria-label="Open admin menu" onClick={() => setOpen(true)}><span /><span /><span /></button>
          <form onSubmit={search}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search user by name, email, or phone" />
          </form>
        </header>
        <button className={open ? "drawer-backdrop on" : "drawer-backdrop"} aria-label="Close menu" onClick={() => setOpen(false)} />
        <aside className={open ? "admin-drawer on" : "admin-drawer"}>
          <div className="drawer-head"><img src={LOGO} alt="" /><b>Flower Admin</b></div>
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === "/admin"} onClick={() => setOpen(false)}>{label}</NavLink>)}
          <button className="btn" onClick={() => { clearSession(); window.location.href = "/admin/login"; }}>Logout</button>
        </aside>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}

function useLoad(path) {
  const [data, setData] = useState(null);
  useEffect(() => { api(path).then(setData).catch(() => setData(null)); }, [path]);
  return data;
}

function PlanBadge({ name, color, text }) {
  if (!name) return <span className="sub">—</span>;
  return <span className="badge" style={{ background: color || "#fff3cd", color: text || "#856404" }}>{name}</span>;
}

export function AdminHome() {
  const data = useLoad("/api/admin/summary");
  if (!data) return <p>Loading...</p>;
  const cards = [
    ["/admin/users?status=all", "Users", data.users],
    ["/admin/deposits", "New requests", data.pending_deposits],
    ["/admin/withdrawals", "Withdrawals", data.pending_withdrawals],
    ["/admin/upgrades", "Plan upgrades", data.pending_upgrades],
    ["/admin/today-users", "Approved today", data.approved_today],
    ["/admin/rejected", "Rejected", data.rejected_users],
  ];
  return <><h1>Flower Admin</h1><p className="sub">Search from the bar above, or open a queue.</p><div className="stats">{cards.map(([to, label, value]) => <Link className="stat" key={label} to={to}><div className="sub">{label}</div><h2>{value}</h2></Link>)}</div></>;
}

export function Users({ status = "approved", title = "Approved users", searchable = false }) {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const current = params.get("status") || status;
  const data = useLoad(`/api/admin/users?status=${encodeURIComponent(current)}&q=${encodeURIComponent(q)}`);
  const setFilter = (nextStatus) => {
    const next = new URLSearchParams(params);
    next.set("status", nextStatus);
    setParams(next);
  };
  return (
    <>
      <h1>{searchable ? "Users" : title}</h1>
      {searchable && (
        <>
          <form className="search-row" onSubmit={(e) => e.preventDefault()}>
            <input value={q} placeholder="Name, email, phone, or code" onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) next.set("q", e.target.value); else next.delete("q");
              setParams(next);
            }} />
          </form>
          <div className="filters">
            {[["all", "All"], ["approved", "Approved"], ["pending", "Pending"], ["rejected", "Rejected"]].map(([value, label]) => (
              <button key={value} className={current === value ? "chip on" : "chip"} type="button" onClick={() => setFilter(value)}>{label}</button>
            ))}
          </div>
        </>
      )}
      <div className="table-wrap desktop-table"><table><thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Plan</th><th>Status</th><th></th></tr></thead><tbody>{(data || []).map((u, i) => <tr key={u.id}><td>{i + 1}</td><td><b>{u.full_name}</b><div className="sub">{u.email}</div></td><td>{u.phone || "—"}</td><td><PlanBadge name={u.plan} color={u.plan_color} text={u.plan_text} /></td><td>{u.paid ? "Paid" : "Unpaid"}</td><td><Link to={`/admin/users/${u.id}`}>Details</Link></td></tr>)}</tbody></table></div>
      <div className="cards">{(data || []).map((u) => <div className="lb-card" key={u.id}><b>{u.full_name}</b><div className="sub">{u.email}</div><div className="sub">{u.phone || "No phone"}</div><PlanBadge name={u.plan} color={u.plan_color} text={u.plan_text} /><div><Link to={`/admin/users/${u.id}`}>Details</Link></div></div>)}</div>
      {data && data.length === 0 && <p>No users match this search.</p>}
    </>
  );
}

function SlipView({ src, onOpen }) {
  if (!src) return <span className="sub">No slip uploaded</span>;
  return <button type="button" className="slip-thumb" onClick={() => onOpen(src)}><img src={src} alt="Deposit slip" /></button>;
}

export function UserDetail() {
  const { id } = useParams();
  const data = useLoad(`/api/admin/users/${id}`);
  const [preview, setPreview] = useState("");
  if (!data) return <p>Loading...</p>;
  return (
    <>
      <Link to="/admin/users?status=all">← Users</Link>
      <h1>{data.user.full_name}</h1>
      <div className="stats detail-stats">
        <div className="stat"><div className="sub">Email</div><b>{data.user.email}</b></div>
        <div className="stat"><div className="sub">Phone</div><b>{data.user.phone || "No phone"}</b></div>
        <div className="stat"><div className="sub">Balance</div><b>Rs {data.user.balance}</b></div>
        <div className="stat"><div className="sub">Plan</div><PlanBadge name={data.user.plan} color={data.user.plan_color} text={data.user.plan_text} /></div>
      </div>
      <p className="sub">Internal code {data.user.username}</p>
      <h2>Deposit slips</h2>
      <div className="table-wrap desktop-table"><table><thead><tr><th>Plan</th><th>Amount</th><th>Method</th><th>Sender</th><th>Slip</th><th>Status</th></tr></thead><tbody>
        {(data.deposits || []).map((d) => <tr key={d.id}><td>{d.plan || "—"}</td><td>Rs {d.amount}</td><td>{d.method || "—"}</td><td>{d.sender || "—"}</td><td><SlipView src={d.screenshot} onOpen={setPreview} /></td><td>{d.status}</td></tr>)}
      </tbody></table></div>
      <div className="cards">{(data.deposits || []).map((d) => <div className="lb-card" key={d.id}><b>{d.plan || "Plan"} · Rs {d.amount}</b><div className="sub">{d.method} · {d.sender || "No sender"} · {d.status}</div><SlipView src={d.screenshot} onOpen={setPreview} /></div>)}</div>
      {(data.deposits || []).length === 0 && <p>No deposit yet.</p>}
      <h2>Plan upgrades</h2>
      <div className="cards" style={{ display: "grid" }}>{(data.upgrades || []).map((d) => <div className="lb-card" key={d.id}><b>{d.from_plan} → {d.to_plan}</b><div className="sub">Rs {d.amount} · {d.method || "No method"} · {d.sender || "No sender"} · {d.status}</div><SlipView src={d.screenshot} onOpen={setPreview} /></div>)}{(data.upgrades || []).length === 0 && <p>No upgrade request.</p>}</div>
      <h2>Team</h2>
      <div className="table-wrap desktop-table"><table><thead><tr><th>#</th><th>Name</th><th>Plan</th><th>Date</th><th>Payment Status</th><th>Details</th></tr></thead><tbody>
        {data.team.map((m, i) => <tr key={m.id}><td>{i + 1}</td><td><b>{m.full_name}</b><div className="sub">{m.email}</div></td><td><PlanBadge name={m.plan} color={m.plan_color} text={m.plan_text} /></td><td>{new Date(m.date).toLocaleDateString()}<div className="sub">{new Date(m.date).toLocaleTimeString()}</div></td><td><span className="badge" style={{ background: m.paid ? "#d1fae5" : "#fff3cd", color: m.paid ? "#065f46" : "#856404" }}>{m.paid ? "Paid" : "Unpaid"}</span></td><td><Link to={`/admin/users/${m.id}`}>Details</Link></td></tr>)}
      </tbody></table></div>
      <div className="cards">{data.team.map((m) => <div className="lb-card" key={m.id}><b>{m.full_name}</b><div className="sub">{m.email}</div><PlanBadge name={m.plan} color={m.plan_color} text={m.plan_text} /><div className="sub">{m.paid ? "Paid" : "Unpaid"}</div><Link to={`/admin/users/${m.id}`}>Details</Link></div>)}</div>
      {data.team.length === 0 && <p>No team members yet.</p>}
      <h2>Transactions</h2>
      <div className="table-wrap"><table><tbody>{data.transactions.map((t) => <tr key={t.id}><td><b>{t.title}</b><div className="sub">From: {t.source_email || "—"}</div>{t.plan_name && <div className="sub">Plan: {t.plan_name}</div>}</td><td>Rs {t.amount}</td></tr>)}</tbody></table></div>
      {preview && <button className="slip-modal" type="button" onClick={() => setPreview("")}><img src={preview} alt="Deposit slip" /></button>}
    </>
  );
}

export function Leaderboard() {
  const data = useLoad("/api/admin/leaderboard");
  return (
    <>
      <h1>Leaderboard</h1>
      <div className="table-wrap desktop-table"><table><thead><tr><th>#</th><th>Name</th><th>Active Team</th><th>Level</th><th>Total Earnings</th><th>Details</th></tr></thead><tbody>
        {(data || []).map((u, i) => <tr key={u.id}><td>{i + 1}</td><td><b>{u.full_name}</b><div className="sub">{u.email}</div></td><td>{u.active_team}</td><td>Level {u.level}</td><td>Rs {u.earnings}</td><td><Link to={`/admin/users/${u.id}`}>Details</Link></td></tr>)}
      </tbody></table></div>
      <div className="cards">{(data || []).map((u, i) => <div className="lb-card" key={u.id}><b>#{i + 1} {u.full_name}</b><div className="sub">{u.email}</div><div>Active team {u.active_team} · Level {u.level}</div><div>Rs {u.earnings}</div><Link to={`/admin/users/${u.id}`}>Details</Link></div>)}</div>
    </>
  );
}

export function Referrals() {
  const data = useLoad("/api/admin/levels");
  return <><h1>Referral Commissions</h1><div className="list">{(data?.levels || []).map((l) => <div className="stat" key={l.level}><b>{l.name}</b><div>{l.percent}%</div></div>)}</div></>;
}

function MoneyList({ path, actionPath, kind = "deposit" }) {
  const [rows, setRows] = useState([]);
  const [preview, setPreview] = useState("");
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const fullPath = `${path}${path.includes("?") ? "&" : "?"}q=${encodeURIComponent(q)}`;
  const load = () => api(fullPath).then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, [fullPath]);
  const act = (id, action) => api(`${actionPath}/${id}`, { method: "POST", body: { action } }).then(load);
  const actions = (row) => (row.status === "approved" || row.status === "rejected")
    ? <span className="badge" style={{ background: row.status === "approved" ? "#d1fae5" : "#fee2e2", color: row.status === "approved" ? "#065f46" : "#991b1b" }}>{row.status}</span>
    : <div className="row-actions"><button className="btn small" onClick={() => act(row.id, "approve")}>Approve</button><button className="btn ghost small" onClick={() => act(row.id, "reject")}>Reject</button></div>;
  const who = (row) => <td><Link to={row.user_id ? `/admin/users/${row.user_id}` : "/admin/users"}><b>{row.full_name}</b></Link><div className="sub">{row.email}</div></td>;
  return (
    <>
      <div className="table-wrap desktop-table"><table>
        <thead>{kind === "withdraw"
          ? <tr><th>Name</th><th>Amount</th><th>Method</th><th>Account</th><th></th></tr>
          : kind === "upgrade"
            ? <tr><th>Name</th><th>From</th><th>To</th><th>Amount</th><th>Sender</th><th>Slip</th><th></th></tr>
            : <tr><th>Name</th><th>Plan</th><th>Amount</th><th>Method</th><th>Sender</th><th>Slip</th><th></th></tr>}
        </thead>
        <tbody>{rows.map((row) => kind === "withdraw" ? (
          <tr key={row.id}>{who(row)}<td>Rs {row.amount}</td><td>{row.method}</td><td>{row.account}</td><td>{actions(row)}</td></tr>
        ) : kind === "upgrade" ? (
          <tr key={row.id}>{who(row)}<td>{row.from_plan}</td><td>{row.to_plan}</td><td>Rs {row.amount}</td><td>{row.sender || "—"}</td><td><SlipView src={row.screenshot} onOpen={setPreview} /></td><td>{actions(row)}</td></tr>
        ) : (
          <tr key={row.id}>{who(row)}<td>{row.plan || "—"}</td><td>Rs {row.amount}</td><td>{row.method || "—"}</td><td>{row.sender || "—"}</td><td><SlipView src={row.screenshot} onOpen={setPreview} /></td><td>{actions(row)}</td></tr>
        ))}</tbody>
      </table></div>
      <div className="cards">{rows.map((row) => (
        <div className="lb-card" key={row.id}>
          <b>{row.full_name}</b>
          <div className="sub">{row.email}</div>
          <div className="sub">{kind === "upgrade" ? `${row.from_plan} → ${row.to_plan}` : (row.plan || row.method)} · Rs {row.amount}{row.sender ? ` · ${row.sender}` : ""}{row.account ? ` · ${row.account}` : ""}</div>
          {kind !== "withdraw" && <SlipView src={row.screenshot} onOpen={setPreview} />}
          {actions(row)}
        </div>
      ))}</div>
      {rows.length === 0 && <p>Nothing waiting in this list.</p>}
      {preview && <button className="slip-modal" type="button" onClick={() => setPreview("")}><img src={preview} alt="Deposit slip" /></button>}
    </>
  );
}

function QueueFilters({ param = "slip" }) {
  const [params, setParams] = useSearchParams();
  const status = params.get(param) || "pending";
  const q = params.get("q") || "";
  return (
    <>
      <form className="search-row" onSubmit={(e) => e.preventDefault()}>
        <input value={q} placeholder="Search name, email, or sender number" onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value) next.set("q", e.target.value); else next.delete("q");
          setParams(next);
        }} />
      </form>
      <div className="filters">
        {[["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["all", "All"]].map(([value, label]) => (
          <button key={value} type="button" className={status === value ? "chip on" : "chip"} onClick={() => { const next = new URLSearchParams(params); next.set(param, value); setParams(next); }}>{label}</button>
        ))}
      </div>
    </>
  );
}

export function Deposits() {
  const [params] = useSearchParams();
  const status = params.get("slip") || "pending";
  return <><h1>New user Request</h1><QueueFilters /><MoneyList path={`/api/admin/deposits?status=${status}`} actionPath="/api/admin/deposits" /></>;
}
export function TodayUsers() { return <><h1>Today Approved Users</h1><Users status="today" title="Today Approved Users" /></>; }
export function Withdrawals() {
  const [params] = useSearchParams();
  const status = params.get("wstatus") || "pending";
  return <><h1>Withdrawal Request</h1><QueueFilters param="wstatus" /><MoneyList kind="withdraw" path={`/api/admin/withdrawals?status=${status}`} actionPath="/api/admin/withdrawals" /></>;
}
export function TodayWithdrawals() { return <><h1>Today approved Withdrawal</h1><MoneyList kind="withdraw" path="/api/admin/withdrawals?status=approved&today=1" actionPath="/api/admin/withdrawals" /></>; }
export function Rejected() { return <Users status="rejected" title="Rejected User" />; }
export function Upgrades() {
  const [params] = useSearchParams();
  const status = params.get("ustatus") || "pending";
  return <><h1>Plan Upgrade</h1><QueueFilters param="ustatus" /><MoneyList kind="upgrade" path={`/api/admin/upgrades?status=${status}`} actionPath="/api/admin/upgrades" /></>;
}
export function Gateways() {
  const data = useLoad("/api/admin/gateways");
  return <><h1>Easypaisa & JazzCash</h1><div className="stats">{(data || []).map((g) => <div className="stat" key={g.id}><b>{g.name}</b><div>{g.account_name}</div><div>{g.account_number}</div></div>)}</div></>;
}
export function Transactions() {
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const data = useLoad(`/api/admin/transactions?category=${category}&q=${encodeURIComponent(q)}`);
  return <><h1>Transactions</h1><div className="search-row"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, or commission" /><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All</option><option value="direct_traffic">Direct Referral Commission</option><option value="level_2">Level 2 Indirect Referral Commission</option><option value="level_3">Level 3 Indirect Referral Commission</option><option value="ads">Ads Earning</option><option value="withdraw">Withdraw</option></select></div><div className="table-wrap"><table><tbody>{(data || []).map((t) => <tr key={t.id}><td><b>{t.user_name}</b><div className="sub">{t.user_email}</div><div className="sub">{t.title}</div><div className="sub">From: {t.source_email || "—"} {t.plan_name ? `· ${t.plan_name}` : ""}</div></td><td>Rs {t.amount}</td></tr>)}</tbody></table></div></>;
}
export function Settings() {
  const [notice, setNotice] = useState("");
  useEffect(() => { api("/api/admin/settings").then((d) => setNotice(d.notice)); }, []);
  return <><h1>General Setting</h1><textarea rows="5" value={notice} onChange={(e) => setNotice(e.target.value)} /><button className="btn" style={{ marginTop: 10, maxWidth: 220 }} onClick={() => api("/api/admin/settings", { method: "POST", body: { notice } })}>Save notice</button></>;
}
export function Channels() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ title: "", purpose: "", link: "https://flowersblom.com", description: "" });
  const load = () => api("/api/admin/channels").then(setRows);
  useEffect(() => { load(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    const file = e.target.image.files[0];
    if (file) body.append("image", file);
    await api("/api/admin/channels", { method: "POST", body });
    load();
  };
  return <><h1>Official Channels</h1><form onSubmit={submit} className="stat"><input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><input placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /><input placeholder="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /><input name="image" type="file" accept="image/*" /><button className="btn" style={{ marginTop: 8 }}>Add channel</button></form><div className="stats" style={{ marginTop: 16 }}>{rows.map((c) => <div className="stat" key={c.id}>{c.image && <img src={c.image} alt="" width="72" height="72" style={{ borderRadius: "50%", objectFit: "cover" }} />}<b>{c.title}</b><div className="sub">{c.purpose}</div></div>)}</div></>;
}
export function Contacts() {
  const data = useLoad("/api/admin/contacts");
  return <><h1>Contact Us Admins</h1>{(data || []).map((c) => <div className="stat" key={c.id}><b>{c.name}</b><div>{c.whatsapp}</div><div className="sub">{c.note}</div></div>)}</>;
}
export function Levels() {
  const data = useLoad("/api/admin/levels");
  return <><h1>Levels Setting</h1>{(data?.levels || []).map((l) => <div className="stat" key={l.level}><b>Level {l.level}</b><div>{l.name}</div><div>{l.percent}%</div></div>)}<h2>Plans</h2>{(data?.plans || []).map((p) => <div key={p.id}>{p.name} · Rs {p.price}</div>)}</>;
}
export function Rewards() {
  const data = useLoad("/api/admin/rewards");
  return <><h1>Rewards</h1>{(data || []).map((r) => <div className="stat" key={r.id}><b>{r.title}</b><div>{r.required_team} team · {r.prize}</div></div>)}</>;
}
