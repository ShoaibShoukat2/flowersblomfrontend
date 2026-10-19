import { useContext, useEffect, useState, createContext } from "react";
import { Link, NavLink, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, clearSession, LOGO } from "./api";

const refreshCountsContext = createContext(() => {});

const groups = [
  ["Overview", [
    ["/admin", "Dashboard"],
    ["/admin/analytics", "Earnings analytics"],
    ["/admin/users", "All users"],
    ["/admin/leaderboard", "Leaderboard"],
    ["/admin/referrals", "Referral commissions"],
  ]],
  ["Payments", [
    ["/admin/deposits", "New user requests"],
    ["/admin/withdrawals", "Withdrawals"],
    ["/admin/upgrades", "Plan upgrades"],
    ["/admin/transactions", "Transactions"],
    ["/admin/today-users", "Approved today"],
    ["/admin/today-withdrawals", "Withdrawals today"],
    ["/admin/rejected", "Rejected users"],
  ]],
  ["Setup", [
    ["/admin/gateways", "Easypaisa & JazzCash"],
    ["/admin/settings", "General setting"],
    ["/admin/channels", "Official channels"],
    ["/admin/contacts", "Contact admins"],
    ["/admin/levels", "Levels"],
    ["/admin/rewards", "Rewards"],
  ]],
];

function NavLinks({ onPick, counts }) {
  const badges = { "/admin/deposits": counts.deposits, "/admin/withdrawals": counts.withdrawals };
  return groups.map(([title, items]) => (
    <div key={title}>
      <div className="nav-label">{title}</div>
      {items.map(([to, label]) => (
        <NavLink key={to} to={to} end={to === "/admin"} onClick={onPick}>
          <span>{label}</span>
          {badges[to] > 0 && <span className="nav-count" aria-label={`${badges[to]} waiting`}><i />{badges[to]}</span>}
        </NavLink>
      ))}
    </div>
  ));
}

export function AdminShell({ children }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [counts, setCounts] = useState({ deposits: 0, withdrawals: 0 });
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const refreshCounts = () => api("/api/admin/summary").then((data) => {
    setCounts({ deposits: data.pending_deposits || 0, withdrawals: data.pending_withdrawals || 0 });
  }).catch(() => {});
  useEffect(() => { refreshCounts(); }, [pathname]);
  const search = (e) => {
    e.preventDefault();
    setOpen(false);
    navigate(`/admin/users?status=all&q=${encodeURIComponent(q.trim())}`);
  };
  const logout = () => { clearSession(); window.location.href = "/admin/login"; };
  return (
    <refreshCountsContext.Provider value={refreshCounts}>
    <div className="admin">
      <aside className="side">
        <div className="brand"><img src={LOGO} alt="Flower" /><b>Flower Admin</b><span>Control desk</span></div>
        <div className="side-nav"><NavLinks counts={counts} /></div>
        <button className="btn" onClick={logout}>Logout</button>
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
          <div className="drawer-head">
            <div className="brand"><img src={LOGO} alt="" /><b>Flower Admin</b></div>
            <button className="burger" type="button" aria-label="Close admin menu" onClick={() => setOpen(false)}><span /><span /><span /></button>
          </div>
          <div className="side-nav"><NavLinks counts={counts} onPick={() => setOpen(false)} /></div>
          <button className="btn" onClick={logout}>Logout</button>
        </aside>
        <main className="main">{children}</main>
      </div>
    </div>
    </refreshCountsContext.Provider>
  );
}

function DetailModal({ detail, onClose, onAction }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  if (!detail) return null;
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{detail.title}</h2>
            {detail.subtitle && <p className="sub">{detail.subtitle}</p>}
          </div>
          <button className="modal-x" type="button" onClick={onClose}>Close</button>
        </div>
        <SlipImage src={detail.image} />
        <div className="modal-fields">
          {detail.fields.map(([label, value]) => <div key={label}><span>{label}</span><b>{value || "—"}</b></div>)}
        </div>
        {detail.pending && (
          <div className="row-actions">
            <button className="btn small" type="button" onClick={() => onAction(detail.id, "approve")}>Approve</button>
            <button className="btn ghost small" type="button" onClick={() => onAction(detail.id, "reject")}>Reject</button>
          </div>
        )}
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
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const cards = [
    ["/admin/users?status=all", "Users", data.users, "Every account", "pink"],
    ["/admin/deposits", "New requests", data.pending_deposits, "Waiting slips", "amber"],
    ["/admin/withdrawals", "Withdrawals", data.pending_withdrawals, "Cash out queue", "blue"],
    ["/admin/upgrades", "Plan upgrades", data.pending_upgrades, "Higher plans", "violet"],
    ["/admin/today-users", "Approved today", data.approved_today, "New paid users", "green"],
    ["/admin/rejected", "Rejected", data.rejected_users, "Needs a second look", "rose"],
  ];
  return (
    <>
      <div className="admin-hero">
        <p className="sub">{hello}</p>
        <h1>Flower Admin</h1>
        <p>Open a queue, search a user, and check the payment slip in a popup.</p>
      </div>
      <div className="stats">{cards.map(([to, label, value, hint, tone]) => (
        <Link className={`stat tone-${tone}`} key={label} to={to}>
          <div className="sub">{label}</div>
          <h2>{value}</h2>
          <span>{hint}</span>
        </Link>
      ))}</div>
      <EarningsStrip />
    </>
  );
}

function EarningsStrip() {
  const data = useLoad("/api/admin/analytics");
  if (!data) return null;
  const tiles = [
    ["User earnings", `Rs ${data.credited}`, "Commissions plus ads", "green"],
    ["Direct referral", `Rs ${data.direct}`, "Level 1 commission", "pink"],
    ["Indirect", `Rs ${data.indirect}`, "Level 2 and 3", "violet"],
    ["Ads", `Rs ${data.ads}`, "Task rewards", "amber"],
    ["Plan sales", `Rs ${data.sales}`, "Approved deposits", "blue"],
    [data.result === "profit" ? "Profit" : "Loss", `Rs ${data.profit}`, "Sales minus credited earnings", data.result === "profit" ? "green" : "rose"],
  ];
  return (
    <section className="earn-panel">
      <div className="panel-head"><h2>Earnings</h2><Link to="/admin/analytics">Open analytics</Link></div>
      <div className="stats">{tiles.map(([label, value, hint, tone]) => (
        <Link className={`stat tone-${tone}`} key={label} to="/admin/analytics">
          <div className="sub">{label}</div>
          <h2>{value}</h2>
          <span>{hint}</span>
        </Link>
      ))}</div>
    </section>
  );
}

function WeekChart({ days }) {
  const max = Math.max(1, ...days.flatMap((d) => [d.sales, d.earnings, d.withdrawals]));
  return (
    <div className="chart-card">
      <div className="panel-head"><h2>Last 7 days</h2></div>
      <div className="legend"><i className="sales" /> Sales <i className="earnings" /> Earnings <i className="withdrawals" /> Withdrawn</div>
      <div className="chart">{days.map((d) => (
        <div className="chart-col" key={d.label + d.sales}>
          <div className="chart-bars">
            <span className="bar sales" style={{ height: `${(d.sales / max) * 100}%` }} title={`Sales ${d.sales}`} />
            <span className="bar earnings" style={{ height: `${(d.earnings / max) * 100}%` }} title={`Earnings ${d.earnings}`} />
            <span className="bar withdrawals" style={{ height: `${(d.withdrawals / max) * 100}%` }} title={`Withdrawn ${d.withdrawals}`} />
          </div>
          <small>{d.label}</small>
        </div>
      ))}</div>
    </div>
  );
}

function MixChart({ mix }) {
  const max = Math.max(1, ...mix.map((row) => row.value));
  return (
    <div className="chart-card">
      <h2>Money mix</h2>
      {mix.map((row) => (
        <div className="mix-row" key={row.label}>
          <div><b>{row.label}</b><span>Rs {row.value.toFixed(2)}</span></div>
          <div className="mix-track"><span style={{ width: `${(row.value / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export function Analytics() {
  const data = useLoad("/api/admin/analytics");
  if (!data) return <p>Loading...</p>;
  return (
    <>
      <h1>Earnings analytics</h1>
      <p className="sub">Profit is approved plan sales minus commissions and ads credited to users. Loss appears when credited earnings are higher than sales.</p>
      <div className={`profit-banner ${data.result}`}>
        <span>{data.result === "profit" ? "Profit" : "Loss"}</span>
        <strong>Rs {data.profit}</strong>
        <p>Plan sales Rs {data.sales} · Credited earnings Rs {data.credited}</p>
      </div>
      <div className="stats">
        <div className="stat tone-green"><div className="sub">User earnings</div><h2>Rs {data.credited}</h2><span>Still in the system</span></div>
        <div className="stat tone-blue"><div className="sub">Wallet balances</div><h2>Rs {data.balances}</h2><span>What users can withdraw</span></div>
        <div className="stat tone-pink"><div className="sub">Withdrawn</div><h2>Rs {data.withdrawn}</h2><span>Approved cash out</span></div>
        <div className="stat tone-amber"><div className="sub">Waiting withdrawal</div><h2>Rs {data.pending_withdraw}</h2><span>Not paid yet</span></div>
      </div>
      <WeekChart days={data.days} />
      <MixChart mix={data.mix} />
    </>
  );
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

function SlipImage({ src }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="slip-empty">{failed ? "Slip could not be opened." : "No slip uploaded"}</div>;
  return <img className="modal-slip" src={src} alt="Payment slip" onError={() => setFailed(true)} />;
}

function paymentDetail(row, kind) {
  const fields = [["Name", row.full_name], ["Email", row.email]];
  if (kind === "upgrade") fields.push(["From", row.from_plan], ["To", row.to_plan], ["Sender", row.sender || "—"], ["Method", row.method || "—"]);
  else if (kind === "withdraw") fields.push(["Method", row.method], ["Account name", row.account_name || "—"], ["Account number", row.account]);
  else fields.push(["Plan", row.plan || "—"], ["Method", row.method || "—"], ["Sender", row.sender || "—"]);
  fields.push(["Amount", `Rs ${row.amount}`], ["Status", row.status]);
  const title = kind === "withdraw" ? "Withdrawal" : kind === "upgrade" ? "Plan upgrade" : "Payment slip";
  return { id: row.id, title, subtitle: row.email, image: row.screenshot, fields, pending: row.status !== "approved" && row.status !== "rejected" };
}

function SlipView({ src, onOpen }) {
  if (!src) return <button type="button" className="view-btn" onClick={onOpen}>View details</button>;
  return <button type="button" className="slip-thumb" onClick={onOpen}><img src={src} alt="Deposit slip" /></button>;
}

export function UserDetail() {
  const { id } = useParams();
  const data = useLoad(`/api/admin/users/${id}`);
  const [detail, setDetail] = useState(null);
  if (!data) return <p>Loading...</p>;
  const openDeposit = (d) => setDetail(paymentDetail({ ...d, full_name: data.user.full_name, email: data.user.email }, "deposit"));
  const openUpgrade = (d) => setDetail(paymentDetail({ ...d, full_name: data.user.full_name, email: data.user.email, plan: d.to_plan }, "upgrade"));
  return (
    <>
      <Link className="back-link" to="/admin/users?status=all">← Users</Link>
      <h1>{data.user.full_name}</h1>
      <div className="stats detail-stats">
        <div className="stat tone-pink"><div className="sub">Email</div><b>{data.user.email}</b></div>
        <div className="stat tone-blue"><div className="sub">Phone</div><b>{data.user.phone || "No phone"}</b></div>
        <div className="stat tone-green"><div className="sub">Balance</div><b>Rs {data.user.balance}</b></div>
        <div className="stat tone-violet"><div className="sub">Plan</div><PlanBadge name={data.user.plan} color={data.user.plan_color} text={data.user.plan_text} /></div>
      </div>
      <p className="sub">Internal code {data.user.username}</p>
      <h2>Deposit slips</h2>
      <div className="table-wrap desktop-table"><table><thead><tr><th>Plan</th><th>Amount</th><th>Method</th><th>Sender</th><th>Slip</th><th>Status</th></tr></thead><tbody>
        {(data.deposits || []).map((d) => <tr key={d.id}><td>{d.plan || "—"}</td><td>Rs {d.amount}</td><td>{d.method || "—"}</td><td>{d.sender || "—"}</td><td><SlipView src={d.screenshot} onOpen={() => openDeposit(d)} /></td><td>{d.status}</td></tr>)}
      </tbody></table></div>
      <div className="cards">{(data.deposits || []).map((d) => <button className="lb-card tap" type="button" key={d.id} onClick={() => openDeposit(d)}><b>{d.plan || "Plan"} · Rs {d.amount}</b><div className="sub">{d.method} · {d.sender || "No sender"} · {d.status}</div><span className="view-btn">Open slip</span></button>)}</div>
      {(data.deposits || []).length === 0 && <p>No deposit yet.</p>}
      <h2>Plan upgrades</h2>
      <div className="pay-grid">{(data.upgrades || []).map((d) => <button className="lb-card tap" type="button" key={d.id} onClick={() => openUpgrade(d)}><b>{d.from_plan} → {d.to_plan}</b><div className="sub">Rs {d.amount} · {d.method || "No method"} · {d.sender || "No sender"} · {d.status}</div><span className="view-btn">Open</span></button>)}{(data.upgrades || []).length === 0 && <p>No upgrade request.</p>}</div>
      <h2>Team</h2>
      <div className="table-wrap desktop-table"><table><thead><tr><th>#</th><th>Name</th><th>Plan</th><th>Date</th><th>Payment Status</th><th>Details</th></tr></thead><tbody>
        {data.team.map((m, i) => <tr key={m.id}><td>{i + 1}</td><td><b>{m.full_name}</b><div className="sub">{m.email}</div></td><td><PlanBadge name={m.plan} color={m.plan_color} text={m.plan_text} /></td><td>{new Date(m.date).toLocaleDateString()}<div className="sub">{new Date(m.date).toLocaleTimeString()}</div></td><td><span className="badge" style={{ background: m.paid ? "#d1fae5" : "#fff3cd", color: m.paid ? "#065f46" : "#856404" }}>{m.paid ? "Paid" : "Unpaid"}</span></td><td><Link to={`/admin/users/${m.id}`}>Details</Link></td></tr>)}
      </tbody></table></div>
      <div className="cards">{data.team.map((m) => <div className="lb-card" key={m.id}><b>{m.full_name}</b><div className="sub">{m.email}</div><PlanBadge name={m.plan} color={m.plan_color} text={m.plan_text} /><div className="sub">{m.paid ? "Paid" : "Unpaid"}</div><Link to={`/admin/users/${m.id}`}>Details</Link></div>)}</div>
      {data.team.length === 0 && <p>No team members yet.</p>}
      <h2>Transactions</h2>
      <div className="table-wrap"><table><tbody>{data.transactions.map((t) => <tr key={t.id}><td><b>{t.title}</b><div className="sub">From: {t.source_email || "—"}</div>{t.plan_name && <div className="sub">Plan: {t.plan_name}</div>}</td><td>Rs {t.amount}</td><td><button className="view-btn" type="button" onClick={() => setDetail({ title: t.title, subtitle: `Rs ${t.amount}`, fields: [["From", t.source_email || "—"], ["Plan", t.plan_name || "—"], ["Amount", `Rs ${t.amount}`]] })}>View</button></td></tr>)}</tbody></table></div>
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} onAction={() => setDetail(null)} />}
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
  const [detail, setDetail] = useState(null);
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const fullPath = `${path}${path.includes("?") ? "&" : "?"}q=${encodeURIComponent(q)}`;
  const refreshCounts = useContext(refreshCountsContext);
  const load = () => api(fullPath).then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, [fullPath]);
  const act = (id, action) => api(`${actionPath}/${id}`, { method: "POST", body: { action } }).then(() => { setDetail(null); load(); refreshCounts(); });
  const actions = (row) => (row.status === "approved" || row.status === "rejected")
    ? <span className="badge" style={{ background: row.status === "approved" ? "#d1fae5" : "#fee2e2", color: row.status === "approved" ? "#065f46" : "#991b1b" }}>{row.status}</span>
    : <div className="row-actions"><button className="btn small" onClick={() => act(row.id, "approve")}>Approve</button><button className="btn ghost small" onClick={() => act(row.id, "reject")}>Reject</button></div>;
  const who = (row) => <td><Link to={row.user_id ? `/admin/users/${row.user_id}` : "/admin/users"}><b>{row.full_name}</b></Link><div className="sub">{row.email}</div></td>;
  return (
    <>
      <div className="table-wrap desktop-table"><table>
        <thead>{kind === "withdraw"
          ? <tr><th>Name</th><th>Amount</th><th>Method</th><th>Account name</th><th>Account number</th><th></th><th></th></tr>
          : kind === "upgrade"
            ? <tr><th>Name</th><th>From</th><th>To</th><th>Amount</th><th>Sender</th><th>Slip</th><th></th></tr>
            : <tr><th>Name</th><th>Plan</th><th>Amount</th><th>Method</th><th>Sender</th><th>Slip</th><th></th></tr>}
        </thead>
        <tbody>{rows.map((row) => kind === "withdraw" ? (
          <tr key={row.id}>{who(row)}<td>Rs {row.amount}</td><td>{row.method}</td><td>{row.account_name || "—"}</td><td>{row.account || "—"}</td><td>{actions(row)}</td><td><button className="view-btn" type="button" onClick={() => setDetail(paymentDetail(row, kind))}>View</button></td></tr>
        ) : kind === "upgrade" ? (
          <tr key={row.id}>{who(row)}<td>{row.from_plan}</td><td>{row.to_plan}</td><td>Rs {row.amount}</td><td>{row.sender || "—"}</td><td><SlipView src={row.screenshot} onOpen={() => setDetail(paymentDetail(row, kind))} /></td><td>{actions(row)}</td></tr>
        ) : (
          <tr key={row.id}>{who(row)}<td>{row.plan || "—"}</td><td>Rs {row.amount}</td><td>{row.method || "—"}</td><td>{row.sender || "—"}</td><td><SlipView src={row.screenshot} onOpen={() => setDetail(paymentDetail(row, kind))} /></td><td>{actions(row)}</td></tr>
        ))}</tbody>
      </table></div>
      <div className="cards">{rows.map((row) => (
        <div className="lb-card" key={row.id}>
          <b>{row.full_name}</b>
          <div className="sub">{row.email}</div>
          <div className="sub">{kind === "upgrade" ? `${row.from_plan} → ${row.to_plan}` : (row.plan || row.method)} · Rs {row.amount}{row.sender ? ` · ${row.sender}` : ""}{row.account_name ? ` · ${row.account_name}` : ""}{row.account ? ` · ${row.account}` : ""}</div>
          <button className="view-btn" type="button" onClick={() => setDetail(paymentDetail(row, kind))}>Open details</button>
          {actions(row)}
        </div>
      ))}</div>
      {rows.length === 0 && <p className="empty">Nothing waiting in this list.</p>}
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} onAction={act} />}
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
  const today = params.get("today") === "1" ? "&today=1" : "";
  return <><h1>{today ? "Today Received Balance" : "New user Request"}</h1><QueueFilters /><MoneyList path={`/api/admin/deposits?status=${status}${today}`} actionPath="/api/admin/deposits" /></>;
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
  const [params] = useSearchParams();
  const [category, setCategory] = useState(params.get("category") || "");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState(null);
  const data = useLoad(`/api/admin/transactions?category=${category}&q=${encodeURIComponent(q)}`);
  return (
    <>
      <h1>Transactions</h1>
      <div className="search-row"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, or commission" /><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All</option><option value="direct_traffic">Direct Referral Commission</option><option value="level_2">Level 2 Indirect Referral Commission</option><option value="level_3">Level 3 Indirect Referral Commission</option><option value="ads">Ads Earning</option><option value="manual_add">Manual Additions</option><option value="manual_sub">Manual Subtractions</option><option value="withdraw">Withdraw</option></select></div>
      <div className="table-wrap desktop-table"><table><tbody>{(data || []).map((t) => <tr key={t.id}><td><b>{t.user_name}</b><div className="sub">{t.user_email}</div><div className="sub">{t.title}</div></td><td>Rs {t.amount}</td><td><button className="view-btn" type="button" onClick={() => setDetail({ title: t.title, subtitle: t.user_name, fields: [["User", t.user_name], ["Email", t.user_email], ["From", t.source_email || "—"], ["Plan", t.plan_name || "—"], ["Amount", `Rs ${t.amount}`]] })}>View</button></td></tr>)}</tbody></table></div>
      <div className="cards">{(data || []).map((t) => <button className="lb-card tap" type="button" key={t.id} onClick={() => setDetail({ title: t.title, subtitle: t.user_name, fields: [["User", t.user_name], ["Email", t.user_email], ["From", t.source_email || "—"], ["Plan", t.plan_name || "—"], ["Amount", `Rs ${t.amount}`]] })}><b>{t.user_name}</b><div className="sub">{t.title}</div><div className="sub">Rs {t.amount}</div></button>)}</div>
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} onAction={() => setDetail(null)} />}
    </>
  );
}
export function Settings() {
  const [notice, setNotice] = useState("");
  useEffect(() => { api("/api/admin/settings").then((d) => setNotice(d.notice)); }, []);
  return <><h1>General Setting</h1><textarea rows="5" value={notice} onChange={(e) => setNotice(e.target.value)} /><button className="btn" style={{ marginTop: 10, maxWidth: 220 }} onClick={() => api("/api/admin/settings", { method: "POST", body: { notice } })}>Save notice</button></>;
}
export function Channels() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ title: "", purpose: "", link: "https://flowersblom.com", description: "" });
  const [shot, setShot] = useState("");
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
  return <><h1>Official Channels</h1><form onSubmit={submit} className="stat"><input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><input placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /><input placeholder="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /><input name="image" type="file" accept="image/*" /><button className="btn" style={{ marginTop: 8 }}>Add channel</button></form><div className="stats" style={{ marginTop: 16 }}>{rows.map((c) => <div className="stat" key={c.id}>{c.image && <button type="button" className="slip-thumb" onClick={() => setShot(c.image)}><img src={c.image} alt="" /></button>}<b>{c.title}</b><div className="sub">{c.purpose}</div></div>)}</div>{shot && <DetailModal detail={{ title: "Channel picture", image: shot, fields: [] }} onClose={() => setShot("")} onAction={() => setShot("")} />}</>;
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
