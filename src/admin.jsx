import { useContext, useEffect, useState, createContext } from "react";
import { Link, NavLink, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, clearSession, LOGO, token } from "./api";

const refreshCountsContext = createContext(() => {});

const groups = [
  ["Menu", [
    ["/admin", "home", "Dashboard"],
    ["/admin/users", "users", "All approved user"],
    ["/admin/leaderboard", "trophy", "Leaderboard"],
    ["/admin/referrals", "percent", "Referral Commissions"],
    ["/admin/deposits", "dot", "New user Request"],
    ["/admin/withdrawals", "down", "Withdrawal Request"],
    ["/admin/today-users", "check", "Today Approved Users"],
    ["/admin/today-withdrawals", "check", "Today approved Withdrawal"],
    ["/admin/rejected", "x", "Rejected User"],
    ["/admin/upgrades", "up", "Plan Upgrade"],
    ["/admin/gateways", "card", "Easypaisa & Jazz Cash"],
  ]],
  ["Settings", [
    ["/admin/settings", "gear", "General Setting"],
    ["/admin/channels", "megaphone", "Official Channels"],
    ["/admin/contacts", "phone", "Contact Us Admins"],
    ["/admin/levels", "sliders", "Levels Setting"],
    ["/admin/rewards", "gift", "Rewards"],
    ["/admin/analytics", "chart", "Earnings analytics"],
    ["/admin/transactions", "list", "Transactions"],
  ]],
];

function NavIcon({ name }) {
  const paths = {
    home: "M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z",
    users: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 19a5 5 0 0 1 10 0M14 19a4 4 0 0 1 7 0",
    trophy: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 3M16 6h3a3 3 0 0 1-3 3M12 13v3M9 20h6M10 16h4",
    percent: "M7 17 17 7M8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM16 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
    dot: "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
    down: "M12 4v12M7 11l5 5 5-5M5 20h14",
    check: "M5 12.5 9.5 17 19 7",
    x: "M7 7l10 10M17 7 7 17",
    up: "M12 20V8M7 13l5-5 5 5",
    card: "M3 7h18v10H3zM3 11h18",
    gear: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4",
    megaphone: "M5 10v4h3l5 3V7L8 10zM16 9.5a3 3 0 0 1 0 5",
    phone: "M8 4h3l1 4-2 1a12 12 0 0 0 5 5l1-2 4 1v3a2 2 0 0 1-2 2A16 16 0 0 1 6 6a2 2 0 0 1 2-2z",
    sliders: "M4 7h16M4 12h16M4 17h16M8 7v0M14 12v0M10 17v0",
    gift: "M4 10h16v10H4zM12 10v10M4 14h16M12 10c-2-4-6-4-6 0h6zM12 10c2-4 6-4 6 0h-6z",
    chart: "M4 19V5M4 19h16M8 16v-4M12 16V8M16 16v-6",
    list: "M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01",
  };
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavLinks({ onPick, counts }) {
  const badges = { "/admin/deposits": counts.deposits, "/admin/withdrawals": counts.withdrawals, "/admin/upgrades": counts.upgrades };
  return groups.map(([title, items]) => (
    <div key={title}>
      <div className="nav-label">{title}</div>
      {items.map(([to, icon, label]) => (
        <NavLink key={to} to={to} end={to === "/admin"} onClick={onPick}>
          <span className="nav-item"><NavIcon name={icon} />{label}</span>
          {badges[to] > 0 && <span className="nav-count" aria-label={`${badges[to]} waiting`}>{badges[to]}</span>}
        </NavLink>
      ))}
    </div>
  ));
}

export function AdminShell({ children }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [counts, setCounts] = useState({ deposits: 0, withdrawals: 0, upgrades: 0 });
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const refreshCounts = () => api("/api/admin/summary").then((data) => {
    setCounts({ deposits: data.pending_deposits || 0, withdrawals: data.pending_withdrawals || 0, upgrades: data.pending_upgrades || 0 });
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
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search here..." aria-label="Search user" />
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
      <div className={detail.team ? "modal-card wide" : "modal-card"} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
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
        {detail.loading && <p className="sub">Loading account, upliner, and team...</p>}
        {detail.account && (
          <section className="review-block">
            <h3>Account</h3>
            <div className="modal-fields">
              <div><span>Phone</span><b>{detail.account.phone || "—"}</b></div>
              <div><span>Plan</span><b>{detail.account.plan || "No plan"}</b></div>
              <div><span>Level</span><b>Level {detail.account.level}</b></div>
              <div><span>Balance</span><b>Rs {detail.account.balance}</b></div>
              <div><span>Account status</span><b>{detail.account.status}</b></div>
              <div><span>Payment</span><b>{detail.account.paid ? "Paid" : "Unpaid"}</b></div>
            </div>
          </section>
        )}
        {detail.review && (
          <section className="review-block">
            <h3>Upliner</h3>
            {detail.upliner ? (
              <Link className="upliner-card" to={`/admin/users/${detail.upliner.id}`}>
                <b>{detail.upliner.full_name}</b>
                <span>{detail.upliner.email}</span>
                <span>{detail.upliner.phone || "No phone"} · {detail.upliner.plan || "No plan"} · Level {detail.upliner.level} · {detail.upliner.status}</span>
              </Link>
            ) : <p className="sub">No upliner. This account joined directly.</p>}
          </section>
        )}
        {detail.team && (
          <section className="review-block">
            <h3>Complete team</h3>
            <div className="team-counts">
              <span>{detail.team.total} direct</span>
              <span>{detail.team.active} active</span>
              <span>{detail.team.pending} pending</span>
              <span>Level 2 · {detail.team.level2}</span>
              <span>Level 3 · {detail.team.level3}</span>
            </div>
            <div className="team-scroll">
              {detail.team.members.map((member) => (
                <Link key={member.id} to={`/admin/users/${member.id}`}>
                  <b>{member.full_name}</b>
                  <span>{member.email}{member.phone ? ` · ${member.phone}` : ""}</span>
                  <span>{member.plan || "No plan"} · Level {member.level} · {member.paid ? "Paid" : "Unpaid"} · {member.status}</span>
                </Link>
              ))}
              {detail.team.members.length === 0 && <p>No team members yet.</p>}
            </div>
            {detail.team.total > detail.team.shown && <p className="sub">Showing {detail.team.shown} of {detail.team.total} direct members.</p>}
          </section>
        )}
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

function rs(value) {
  const n = Number(String(value ?? "0").replace(/,/g, ""));
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function AdminHome() {
  const data = useLoad("/api/admin/summary");
  if (!data) return <p>Loading...</p>;
  const money = data.money || {};
  return (
    <div className="desk">
      <h1>Dashboard</h1>
      <Link className="desk-users" to="/admin/users?status=all">
        <span className="desk-ico users" aria-hidden="true"><NavIcon name="users" /></span>
        <span>Total Users</span>
        <b>{Number(data.users || 0).toLocaleString("en-US")}</b>
      </Link>
      <Link className="desk-ref" to="/admin/referrals">
        <b>{rs(money.referral)} Rs</b>
        <span>Referral Commissions</span>
      </Link>
      <article className="desk-card">
        <span className="desk-ico green" aria-hidden="true"><NavIcon name="card" /></span>
        <div><b>Rs {rs(money.deposited)}</b><span>Total Deposited</span></div>
        <Link to="/admin/deposits?slip=all">View All</Link>
      </article>
      <article className="desk-card">
        <span className="desk-ico orange" aria-hidden="true"><NavIcon name="check" /></span>
        <div><b>{Number(money.approved_users_today || 0).toLocaleString("en-US")}</b><span>Today Approved Users</span></div>
        <Link to="/admin/today-users">View Detail</Link>
      </article>
      <article className="desk-card">
        <span className="desk-ico green" aria-hidden="true"><NavIcon name="card" /></span>
        <div><b>Rs {rs(money.received_today)}</b><span>Today Received Balance</span><small>New account payments only</small></div>
        <Link to="/admin/deposits?slip=approved&today=1">View Detail</Link>
      </article>
      <article className="desk-card">
        <span className="desk-ico amber" aria-hidden="true"><NavIcon name="down" /></span>
        <div><b>{Number(data.withdraw_today || 0).toLocaleString("en-US")}</b><span>Today Withdraw</span><small>Rs {rs(money.withdrawals_today)} approved today</small></div>
        <Link to="/admin/today-withdrawals">View Detail</Link>
      </article>
      <section className="desk-break">
        <h2>Earnings Breakdown</h2>
        <p>Each source is counted on its own. Plan upgrade payments are not included here.</p>
      </section>
      <article className="desk-card earn">
        <span className="desk-ico purple" aria-hidden="true"><NavIcon name="list" /></span>
        <div>
          <b>Rs {rs(money.task)}</b>
          <span>Task Earnings – Overall</span>
          <small className="today-line">Rs {rs(money.task_today)} Today Earnings</small>
        </div>
        <Link className="today-pill" to="/admin/transactions?category=ads">Today Details</Link>
      </article>
      <article className="desk-card earn">
        <span className="desk-ico green" aria-hidden="true"><NavIcon name="up" /></span>
        <div>
          <b>Rs {rs(money.manual_add)}</b>
          <span>Manual Balance Add – Overall</span>
          <small className="today-line">Rs {rs(money.manual_add_today)} Today Manual Balance Add</small>
        </div>
        <Link className="today-pill" to="/admin/transactions?category=manual_add">Today Details</Link>
      </article>
      <article className="desk-card">
        <span className="desk-ico mint" aria-hidden="true"><NavIcon name="card" /></span>
        <div><b>Rs {rs(money.withdrawn)}</b><span>Total Withdrawn</span></div>
        <Link to="/admin/withdrawals?wstatus=approved">View All</Link>
      </article>
    </div>
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
  const navigate = useNavigate();
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
      <div className="table-wrap desktop-table"><table><thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Plan</th><th>Status</th><th></th></tr></thead><tbody>{(data || []).map((u, i) => <tr className="click-row" key={u.id} onClick={() => navigate(`/admin/users/${u.id}`)}><td>{i + 1}</td><td><b>{u.full_name}</b><div className="sub">{u.email}</div></td><td>{u.phone || "—"}</td><td><PlanBadge name={u.plan} color={u.plan_color} text={u.plan_text} /></td><td>{u.paid ? "Paid" : "Unpaid"}</td><td><Link to={`/admin/users/${u.id}`} onClick={(e) => e.stopPropagation()}>Details</Link></td></tr>)}</tbody></table></div>
      <div className="cards">{(data || []).map((u) => <Link className="lb-card" to={`/admin/users/${u.id}`} key={u.id}><b>{u.full_name}</b><div className="sub">{u.email}</div><div className="sub">{u.phone || "No phone"}</div><PlanBadge name={u.plan} color={u.plan_color} text={u.plan_text} /><span className="view-btn">Open details</span></Link>)}</div>
      {data && data.length === 0 && <p>No users match this search.</p>}
    </>
  );
}

function useAuthImage(src) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!src) return undefined;
    let gone = false;
    let objectUrl = "";
    const headers = src.startsWith("/api/") ? { Authorization: `Token ${token()}` } : {};
    fetch(src, { headers })
      .then((response) => {
        if (!response.ok) throw new Error("slip");
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (!gone) setUrl(objectUrl);
      })
      .catch(() => {
        if (!gone) setFailed(true);
      });
    return () => {
      gone = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);
  return { url, failed };
}

function SlipImage({ src }) {
  const { url, failed } = useAuthImage(src);
  if (!src || failed) return <div className="slip-empty">{failed ? "Slip could not be opened." : "Screenshot did not reach the server. Ask the user to upload it again."}</div>;
  if (!url) return <div className="slip-empty">Loading slip...</div>;
  return <img className="modal-slip" src={url} alt="Payment slip" />;
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
  const { url } = useAuthImage(src);
  if (!src || !url) return <button type="button" className="view-btn" onClick={onOpen}>View details</button>;
  return <button type="button" className="slip-thumb" onClick={onOpen}><img src={url} alt="Deposit slip" /></button>;
}

export function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <section className="stat upliner-panel">
        <div className="sub">Upliner</div>
        {data.upliner ? <Link to={`/admin/users/${data.upliner.id}`}><b>{data.upliner.full_name}</b><div className="sub">{data.upliner.email} · {data.upliner.phone || "No phone"} · {data.upliner.plan || "No plan"} · Level {data.upliner.level}</div></Link> : <b>No upliner. This account joined directly.</b>}
      </section>
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
        {data.team.map((m, i) => <tr className="click-row" key={m.id} onClick={() => navigate(`/admin/users/${m.id}`)}><td>{i + 1}</td><td><b>{m.full_name}</b><div className="sub">{m.email}</div></td><td><PlanBadge name={m.plan} color={m.plan_color} text={m.plan_text} /></td><td>{new Date(m.date).toLocaleDateString()}<div className="sub">{new Date(m.date).toLocaleTimeString()}</div></td><td><span className="badge" style={{ background: m.paid ? "#d1fae5" : "#fff3cd", color: m.paid ? "#065f46" : "#856404" }}>{m.paid ? "Paid" : "Unpaid"}</span></td><td><Link to={`/admin/users/${m.id}`} onClick={(e) => e.stopPropagation()}>Details</Link></td></tr>)}
      </tbody></table></div>
      <div className="cards">{data.team.map((m) => <Link className="lb-card" to={`/admin/users/${m.id}`} key={m.id}><b>{m.full_name}</b><div className="sub">{m.email}</div><PlanBadge name={m.plan} color={m.plan_color} text={m.plan_text} /><div className="sub">{m.paid ? "Paid" : "Unpaid"}</div><span className="view-btn">Open details</span></Link>)}</div>
      {data.team.length === 0 && <p>No team members yet.</p>}
      <h2>Transactions</h2>
      <div className="table-wrap"><table><tbody>{data.transactions.map((t) => <tr key={t.id}><td><b>{t.title}</b><div className="sub">From: {t.source_email || "—"}</div>{t.plan_name && <div className="sub">Plan: {t.plan_name}</div>}</td><td>Rs {t.amount}</td><td><button className="view-btn" type="button" onClick={() => setDetail({ title: t.title, subtitle: `Rs ${t.amount}`, fields: [["From", t.source_email || "—"], ["Plan", t.plan_name || "—"], ["Amount", `Rs ${t.amount}`]] })}>View</button></td></tr>)}</tbody></table></div>
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} onAction={() => setDetail(null)} />}
    </>
  );
}

export function Leaderboard() {
  const data = useLoad("/api/admin/leaderboard");
  const navigate = useNavigate();
  return (
    <>
      <h1>Leaderboard</h1>
      <div className="table-wrap desktop-table"><table><thead><tr><th>#</th><th>Name</th><th>Active Team</th><th>Level</th><th>Total Earnings</th><th>Details</th></tr></thead><tbody>
        {(data || []).map((u, i) => <tr className="click-row" key={u.id} onClick={() => navigate(`/admin/users/${u.id}`)}><td>{i + 1}</td><td><b>{u.full_name}</b><div className="sub">{u.email}</div></td><td>{u.active_team}</td><td>Level {u.level}</td><td>Rs {u.earnings}</td><td><Link to={`/admin/users/${u.id}`} onClick={(e) => e.stopPropagation()}>Details</Link></td></tr>)}
      </tbody></table></div>
      <div className="cards">{(data || []).map((u, i) => <Link className="lb-card" to={`/admin/users/${u.id}`} key={u.id}><b>#{i + 1} {u.full_name}</b><div className="sub">{u.email}</div><div>Active team {u.active_team} · Level {u.level}</div><div>Rs {u.earnings}</div><span className="view-btn">Open details</span></Link>)}</div>
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
  const who = (row) => <td><Link to={row.user_id ? `/admin/users/${row.user_id}` : "/admin/users"}><b>{row.full_name}</b></Link><div className="sub">{row.email}</div>{row.upliner && <div className="sub">Upliner: {row.upliner.full_name}</div>}</td>;
  const openRow = (row) => {
    const base = paymentDetail(row, kind);
    if (kind !== "withdraw") {
      setDetail({ ...base, review: kind === "deposit", upliner: row.upliner || null });
      return;
    }
    setDetail({ ...base, review: true, loading: true });
    api(`/api/admin/withdrawals/${row.id}`).then((extra) => {
      setDetail((current) => (current && current.id === row.id ? { ...base, review: true, loading: false, account: extra.account, upliner: extra.upliner, team: extra.team } : current));
    }).catch(() => setDetail({ ...base, review: true, loading: false }));
  };
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
          <tr key={row.id}>{who(row)}<td>Rs {row.amount}</td><td>{row.method}</td><td>{row.account_name || "—"}</td><td>{row.account || "—"}</td><td>{actions(row)}</td><td><button className="view-btn" type="button" onClick={() => openRow(row)}>View</button></td></tr>
        ) : kind === "upgrade" ? (
          <tr key={row.id}>{who(row)}<td>{row.from_plan}</td><td>{row.to_plan}</td><td>Rs {row.amount}</td><td>{row.sender || "—"}</td><td><SlipView src={row.screenshot} onOpen={() => openRow(row)} /></td><td>{actions(row)}</td></tr>
        ) : (
          <tr key={row.id}>{who(row)}<td>{row.plan || "—"}</td><td>Rs {row.amount}</td><td>{row.method || "—"}</td><td>{row.sender || "—"}</td><td><SlipView src={row.screenshot} onOpen={() => openRow(row)} /></td><td>{actions(row)}</td></tr>
        ))}</tbody>
      </table></div>
      <div className="cards">{rows.map((row) => (
        <div className="lb-card" key={row.id}>
          <b>{row.full_name}</b>
          <div className="sub">{row.email}</div>
          {row.upliner && <div className="sub">Upliner: {row.upliner.full_name}</div>}
          <div className="sub">{kind === "upgrade" ? `${row.from_plan} → ${row.to_plan}` : (row.plan || row.method)} · Rs {row.amount}{row.sender ? ` · ${row.sender}` : ""}{row.account_name ? ` · ${row.account_name}` : ""}{row.account ? ` · ${row.account}` : ""}</div>
          <button className="view-btn" type="button" onClick={() => openRow(row)}>Open details</button>
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
  const [rows, setRows] = useState([]);
  const [note, setNote] = useState("");
  const load = () => api("/api/admin/gateways").then((data) => {
    const next = ["JazzCash", "Easypaisa"].map((name) => {
      const found = (data || []).find((row) => row.name.toLowerCase().replace(/\s+/g, "") === name.toLowerCase());
      return found ? { ...found, name } : { name, account_name: "", account_number: "", active: true };
    });
    setRows(next);
  });
  useEffect(() => { load(); }, []);
  const update = (name, field, value) => setRows((current) => current.map((row) => row.name === name ? { ...row, [field]: value } : row));
  const save = async (row) => {
    setNote("");
    try {
      await api("/api/admin/gateways", { method: "POST", body: row });
      setNote(`${row.name} saved. Users will see it above the payment screenshot.`);
      load();
    } catch (err) {
      setNote(err.message);
    }
  };
  return (
    <>
      <h1>Easypaisa & JazzCash</h1>
      <p className="sub">These details show on the user payment page, above the screenshot.</p>
      <div className="stats">{rows.map((row) => (
        <form className="stat" key={row.name} onSubmit={(e) => { e.preventDefault(); save(row); }}>
          <b>{row.name}</b>
          <input placeholder="Account title" value={row.account_name} onChange={(e) => update(row.name, "account_name", e.target.value)} />
          <input placeholder="Account number" value={row.account_number} onChange={(e) => update(row.name, "account_number", e.target.value)} />
          <button className="btn" type="submit">Save {row.name}</button>
        </form>
      ))}</div>
      {note && <p>{note}</p>}
    </>
  );
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
      <div className="table-wrap desktop-table"><table><tbody>{(data || []).map((t) => <tr key={t.id}><td><Link to={t.user_id ? `/admin/users/${t.user_id}` : "/admin/users"}><b>{t.user_name}</b></Link><div className="sub">{t.user_email}</div><div className="sub">{t.title}</div></td><td>Rs {t.amount}</td><td><button className="view-btn" type="button" onClick={() => setDetail({ title: t.title, subtitle: t.user_name, fields: [["User", t.user_name], ["Email", t.user_email], ["From", t.source_email || "—"], ["Plan", t.plan_name || "—"], ["Amount", `Rs ${t.amount}`]] })}>View</button></td></tr>)}</tbody></table></div>
      <div className="cards">{(data || []).map((t) => <div className="lb-card" key={t.id}><Link to={t.user_id ? `/admin/users/${t.user_id}` : "/admin/users"}><b>{t.user_name}</b></Link><div className="sub">{t.title}</div><div className="sub">Rs {t.amount}</div><button className="view-btn" type="button" onClick={() => setDetail({ title: t.title, subtitle: t.user_name, fields: [["User", t.user_name], ["Email", t.user_email], ["From", t.source_email || "—"], ["Plan", t.plan_name || "—"], ["Amount", `Rs ${t.amount}`]] })}>View</button></div>)}</div>
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
