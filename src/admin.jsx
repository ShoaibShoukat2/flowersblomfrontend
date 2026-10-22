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
    ["/admin/analytics", "chart", "Earnings analytics"],
    ["/admin/account", "gear", "Admin account"],
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
    wallet: "M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5zM3 10h18M16 14.5h2",
    clock: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
    plus: "M12 6v12M6 12h12",
    minus: "M6 12h12",
    bars: "M5 19V11M10 19V7M15 19v-5M20 19V4",
    layers: "M12 4l8 4-8 4-8-4 8-4zM4 12l8 4 8-4M4 16l8 4 8-4",
  };
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const quickLinks = [
  ["/admin", "home", "Home", ""],
  ["/admin/deposits", "dot", "Requests", "deposits"],
  ["/admin/withdrawals", "down", "Withdraw", "withdrawals"],
  ["/admin/upgrades", "up", "Upgrade", "upgrades"],
  ["/admin/users", "users", "Users", ""],
  ["/admin/today-users", "check", "Today", ""],
  ["/admin/today-withdrawals", "check", "Paid", ""],
  ["/admin/analytics", "chart", "Earnings", ""],
  ["/admin/gateways", "card", "Accounts", ""],
  ["/admin/analytics", "chart", "Earnings", ""],
  ["/admin/rejected", "x", "Rejected", ""],
  ["/admin/leaderboard", "trophy", "Ranks", ""],
];

function pageJumps(pathname) {
  if (pathname.startsWith("/admin/withdrawals") || pathname.startsWith("/admin/today-withdrawals")) {
    return [
      ["/admin/withdrawals?wstatus=pending", "down", "Pending"],
      ["/admin/withdrawals?wstatus=approved", "check", "Approved"],
      ["/admin/today-withdrawals", "check", "Today"],
      ["/admin/withdrawals?wstatus=rejected", "x", "Rejected"],
      ["/admin/deposits", "dot", "Deposits"],
      ["/admin/users", "users", "Users"],
      ["/admin/analytics", "chart", "Earnings"],
    ];
  }
  if (pathname.startsWith("/admin/deposits")) {
    return [
      ["/admin/deposits?slip=pending", "dot", "Pending"],
      ["/admin/deposits?slip=approved", "check", "Approved"],
      ["/admin/deposits?slip=approved&today=1", "card", "Today"],
      ["/admin/deposits?slip=rejected", "x", "Rejected"],
      ["/admin/withdrawals", "down", "Withdrawals"],
      ["/admin/users", "users", "Users"],
      ["/admin/upgrades", "up", "Upgrades"],
    ];
  }
  if (pathname.startsWith("/admin/users")) {
    return [
      ["/admin/users?status=all", "users", "All users"],
      ["/admin/users?status=approved", "check", "Approved"],
      ["/admin/users?status=pending", "dot", "Pending"],
      ["/admin/rejected", "x", "Rejected"],
      ["/admin/deposits", "dot", "Deposits"],
      ["/admin/withdrawals", "down", "Withdrawals"],
      ["/admin/analytics", "chart", "Earnings"],
    ];
  }
  if (pathname === "/admin") {
    return [
      ["/admin/deposits", "dot", "New requests"],
      ["/admin/withdrawals", "down", "Withdrawals"],
      ["/admin/today-users", "check", "Today users"],
      ["/admin/today-withdrawals", "check", "Today paid"],
      ["/admin/analytics", "chart", "Analytics"],
    ];
  }
  return [
    ["/admin", "home", "Dashboard"],
    ["/admin/deposits", "dot", "Requests"],
    ["/admin/withdrawals", "down", "Withdrawals"],
    ["/admin/users", "users", "Users"],
    ["/admin/transactions", "list", "Transactions"],
    ["/admin/gateways", "card", "Accounts"],
  ];
}

function JumpLink({ to, icon, label }) {
  const loc = useLocation();
  const here = `${loc.pathname}${loc.search}`;
  const on = here === to || (to.indexOf("?") < 0 && loc.pathname === to && !loc.search);
  return <Link className={on ? "jump on" : "jump"} to={to}><NavIcon name={icon} /><span>{label}</span></Link>;
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
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, or phone" aria-label="Search user" />
          </form>
          <nav className="quick-rail" aria-label="Admin features">
            {quickLinks.map(([to, icon, label, countKey]) => (
              <NavLink key={to} to={to} end={to === "/admin"}>
                <NavIcon name={icon} />
                <span>{label}</span>
                {countKey && counts[countKey] > 0 && <i className="rail-count">{counts[countKey]}</i>}
              </NavLink>
            ))}
          </nav>
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
        <main className="main">
          {pathname !== "/admin" && (
            <nav className="page-jumps" aria-label="Actions for this page">
              {pageJumps(pathname).map(([to, icon, label]) => <JumpLink key={to} to={to} icon={icon} label={label} />)}
            </nav>
          )}
          {children}
        </main>
      </div>
    </div>
    </refreshCountsContext.Provider>
  );
}

function DetailModal({ detail, onClose, onAction }) {
  const [reason, setReason] = useState("");
  const [custom, setCustom] = useState("");
  const [pay, setPay] = useState("no");
  const chosen = reason === "custom" ? custom.trim() : reason;
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
      <div className={detail.team || detail.sheet ? "modal-card wide" : "modal-card"} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
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
        {detail.userPack && (
          <section className="review-block">
            <h3>This user, on this page</h3>
            <div className="mini-links">
              <Link to={`/admin/users/${detail.userPack.id}`} onClick={onClose}><NavIcon name="users" /> Full profile</Link>
              <Link to={`/admin/deposits?slip=all&q=${encodeURIComponent(detail.userPack.email)}`} onClick={onClose}><NavIcon name="dot" /> Deposits</Link>
              <Link to={`/admin/withdrawals?wstatus=all&q=${encodeURIComponent(detail.userPack.email)}`} onClick={onClose}><NavIcon name="down" /> Withdrawals</Link>
              <Link to={`/admin/transactions?q=${encodeURIComponent(detail.userPack.email)}`} onClick={onClose}><NavIcon name="list" /> Transactions</Link>
              <Link to={`/admin/upgrades?q=${encodeURIComponent(detail.userPack.email)}`} onClick={onClose}><NavIcon name="up" /> Upgrades</Link>
            </div>
            <div className="profile-board mini">
              <span className="profile-card balance"><span>Balance</span><b>Rs {detail.userPack.profile?.balance || "0.00"}</b></span>
              <span className="profile-card deposits"><span>Deposits</span><b>Rs {detail.userPack.profile?.deposits || "0.00"}</b></span>
              <span className="profile-card withdrawals"><span>Withdrawals</span><b>Rs {detail.userPack.profile?.withdrawals || "0.00"}</b></span>
              <span className="profile-card tx"><span>Transactions</span><b>{detail.userPack.profile?.transactions || 0}</b></span>
            </div>
            <p className="sub">Flower Rs {detail.userPack.profile?.flower_balance || "0.00"} · {detail.userPack.profile?.status || "—"} · Level {detail.userPack.profile?.level || 0} · Team {detail.userPack.profile?.team || 0}</p>
            <h3>Withdrawals</h3>
            <div className="same-list">
              {(detail.userPack.withdrawals || []).map((item) => <div key={item.id}><b>Rs {item.amount}</b><span>{item.method} · {item.account || "—"} · {item.status}</span></div>)}
              {(detail.userPack.withdrawals || []).length === 0 && <p>No withdrawal yet.</p>}
            </div>
            <h3>Deposits</h3>
            <div className="same-list">
              {(detail.userPack.deposits || []).map((item) => <div key={item.id}><b>Rs {item.amount}</b><span>{item.plan || item.method || "Plan"} · {item.sender || "No sender"} · {item.status}</span></div>)}
              {(detail.userPack.deposits || []).length === 0 && <p>No deposit yet.</p>}
            </div>
            <h3>Latest transactions</h3>
            <div className="same-list">
              {(detail.userPack.transactions || []).map((item) => <div key={item.id}><b>{item.title}</b><span>Rs {item.amount}</span></div>)}
              {(detail.userPack.transactions || []).length === 0 && <p>No transaction yet.</p>}
            </div>
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
          <div className="stack">
            {detail.kind === "upgrade" && !detail.reapprove && (
              <label>Upgrade referral commission
                <select value={pay} onChange={(e) => setPay(e.target.value)}>
                  <option value="no">No — do not credit commission</option>
                  <option value="yes">Yes — 20% of the additional payment to the direct upliner</option>
                </select>
              </label>
            )}
            {!detail.reapprove && (
              <>
                <select value={reason} onChange={(e) => setReason(e.target.value)}>
                  <option value="">Rejection reason</option>
                  <option>Kindly correct payment screenshot laga kar dobara submit karein.</option>
                  <option>Fake payment screenshot hai. Kindly correct payment screenshot upload karein.</option>
                  <option>Aapka account already approved hai.</option>
                  <option value="custom">Write a custom reason</option>
                </select>
                {reason === "custom" && <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Custom reason" />}
              </>
            )}
            <div className="row-actions">
              <button className="btn small" type="button" onClick={() => onAction(detail.id, "approve", { pay_commission: pay === "yes" })}>{detail.reapprove ? "Re-Approve" : "Approve"}</button>
              {!detail.reapprove && <button className="btn ghost small" type="button" onClick={() => { if (!chosen) { window.alert("A rejection reason is required."); return; } onAction(detail.id, "reject", { reason: chosen }); }}>Reject</button>}
            </div>
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

function Trend({ value }) {
  const amount = Number(value || 0);
  const up = amount >= 0;
  return <small className={up ? "trend up" : "trend down"}>{up ? "↑" : "↓"} {Math.abs(amount)}% vs. last week</small>;
}

export function AdminHome() {
  const data = useLoad("/api/admin/summary");
  if (!data) return <p>Loading...</p>;
  const money = data.money || {};
  return (
    <div className="home-desk">
      <div className="home-brand">
        <img src={LOGO} alt="" />
        <div><b>Flowers</b><span>Admin Dashboard</span></div>
      </div>
      <div className="home-top">
        <Link className="home-tile users" to="/admin/users?status=all">
          <span className="home-tile-top"><span className="home-ico pink"><NavIcon name="users" /></span><span className="home-label">Total Users</span></span>
          <b>{Number(data.users || 0).toLocaleString("en-US")}</b>
          <Trend value={data.users_week_percent} />
          <span className="chev" aria-hidden="true">›</span>
        </Link>
        <Link className="home-tile receive" to="/admin/deposits?slip=approved">
          <span className="home-tile-top"><span className="home-ico violet"><NavIcon name="wallet" /></span><span className="home-label">Total Receive Balance</span></span>
          <b>Rs {rs(money.deposited)}</b>
          <Trend value={data.deposited_week_percent} />
          <span className="chev" aria-hidden="true">›</span>
        </Link>
      </div>
      <article className="home-row withdraw">
        <Link className="home-row-main" to="/admin/withdrawals?wstatus=approved">
          <span className="home-ico rose"><NavIcon name="wallet" /></span>
          <span><span className="home-label">Total Withdraw</span><b>Rs {rs(money.withdrawn)}</b></span>
        </Link>
        <Link className="pending-pill" to="/admin/withdrawals?wstatus=pending">Pending</Link>
        <Link className="chev" to="/admin/withdrawals?wstatus=approved" aria-label="Open withdrawals">›</Link>
      </article>
      <Link className="home-row today-users" to="/admin/today-users">
        <span className="home-ico green"><NavIcon name="check" /></span>
        <span><span className="home-label">Today Approved Users</span><b>{Number(money.approved_users_today || 0).toLocaleString("en-US")}</b></span>
        <span className="chev" aria-hidden="true">›</span>
      </Link>
      <Link className="home-row today-receive" to="/admin/today-users">
        <span className="home-ico blue"><NavIcon name="wallet" /></span>
        <span><span className="home-label">Today Receive Balance</span><b>Rs {rs(money.received_today)}</b></span>
        <span className="chev" aria-hidden="true">›</span>
      </Link>
      <Link className="home-row today-paid" to="/admin/today-withdrawals">
        <span className="home-ico orange"><NavIcon name="clock" /></span>
        <span><span className="home-label">Today Approved Withdraw</span><b>Rs {rs(money.withdrawals_today)}</b></span>
        <span className="chev" aria-hidden="true">›</span>
      </Link>
      <section className="earn-head">
        <span className="home-ico bars" aria-hidden="true"><NavIcon name="bars" /></span>
        <div>
          <h2>Earnings Breakdown</h2>
          <p>Each source is counted on its own. Plan payments are not mixed into these totals.</p>
        </div>
      </section>
      <div className="earn-grid">
        <Link className="earn-card task" to="/admin/transactions?category=ads&date=today">
          <span className="home-ico violet"><NavIcon name="layers" /></span>
          <span><span className="home-label">Total Task Earnings</span><b>Rs {rs(money.task)}</b><small className="today-line">Today Rs {rs(money.task_today)}</small></span>
          <span className="chev" aria-hidden="true">›</span>
        </Link>
        <Link className="earn-card add" to="/admin/transactions?category=manual_add&date=today">
          <span className="home-ico leaf"><NavIcon name="plus" /></span>
          <span><span className="home-label">Manual Additions</span><b>Rs {rs(money.manual_add)}</b><small className="today-line">Today Rs {rs(money.manual_add_today)}</small></span>
          <span className="chev" aria-hidden="true">›</span>
        </Link>
        <Link className="earn-card sub" to="/admin/transactions?category=manual_sub&date=today">
          <span className="home-ico amber"><NavIcon name="minus" /></span>
          <span><span className="home-label">Manual Subtractions</span><b>Rs {rs(money.manual_sub)}</b><small className="today-line">Today Rs {rs(money.manual_sub_today)}</small></span>
          <span className="chev" aria-hidden="true">›</span>
        </Link>
        <Link className="earn-card ref" to="/admin/transactions?category=referral&date=today">
          <span className="home-ico blue"><NavIcon name="users" /></span>
          <span><span className="home-label">Referral Commissions</span><b>Rs {rs(money.referral)}</b><small className="today-line">Today Rs {rs(money.referral_today)}</small></span>
          <span className="chev" aria-hidden="true">›</span>
        </Link>
      </div>
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
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [query, setQuery] = useState("");
  const data = useLoad(`/api/admin/analytics${query}`);
  if (!data?.overall) return <p>Loading...</p>;
  const show = query && data.period ? data.period : data.overall;
  const cards = [
    ["Total user earnings", show.earnings, "Task, referral, and restored earnings"],
    ["Manual balance added", show.manual_added, "Admin balance additions only"],
    ["Total withdrawals", show.withdrawals, "Approved payments only"],
    ["Tasks completed", show.tasks, "Successfully completed tasks"],
    ["Approved users", show.approved_users, "Distinct approved accounts"],
    ["Current wallet balance", data.overall.wallet_balance, "Live total, not filtered by date"],
  ];
  return (
    <>
      <h1>Earning analyze</h1>
      <form className="filters" onSubmit={(e) => { e.preventDefault(); setQuery(start || end ? `?start=${start}&end=${end}` : ""); }}>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        <button className="btn small" type="submit">Apply dates</button>
      </form>
      <p className="sub">{query ? "Selected period is shown. Wallet balance stays the current total." : "Overall totals from saved records."}</p>
      <div className="stats">{cards.map(([label, value, note]) => <div className="stat" key={label}><div className="sub">{label}</div><h2>{label === "Tasks completed" || label === "Approved users" ? value : `Rs ${value}`}</h2><span>{note}</span></div>)}</div>
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
  return (
    <div className="slip-box">
      <img className="modal-slip" src={url} alt="Payment slip" />
      <a className="btn small" href={url} download="payment-slip">Download image</a>
    </div>
  );
}

function paymentDetail(row, kind) {
  const amount = `Rs ${row.amount}`;
  const when = row.created_at ? new Date(row.created_at).toLocaleString() : "—";
  const upliner = row.upliner ? row.upliner.full_name : "Joined directly";
  const moneyRows = [["Amount", amount], ["Charge", "Rs 0.00"], ["After charge", amount], ["Rate", "1 Rs = 1.00 PKR"], ["Payable", amount], ["Status", row.status]];
  let title = "Payment slip";
  let fields = [["Name", row.full_name], ["Email", row.email]];
  if (kind === "upgrade") {
    title = "Plan upgrade";
    fields.push(["Upliner", upliner], ["Username", row.username || "—"], ["Email", row.email], ["Current plan", row.from_plan], ["Requested plan", row.to_plan], ["Old paid amount", row.old_paid ? `Rs ${row.old_paid}` : "—"], ["Additional payment", row.additional ? `Rs ${row.additional}` : amount], ["Method", row.method || "—"], ["Transaction number", row.sender || "—"], ["Sender name", row.sender || "—"], ["Status", row.status], ["Reason", row.reject_reason || "—"]);
  } else if (kind === "withdraw") {
    title = `Withdraw via ${row.method || "account"}`;
    fields = [
      ["Date", when], ["Request number", String(row.id)], ["Username", row.username || "—"], ["Name", row.full_name],
      ["Email", row.email], ["Mobile", row.phone || "—"], ["Referred by", upliner], ["Method", row.method || "—"],
      ["Account name", row.account_name || "—"], ["Account number", row.account || "—"], ...moneyRows,
    ];
  } else {
    title = `Deposit via ${row.method || "account"}`;
    fields = [
      ["Gateway", row.method || "—"], ["Initiated", when], ["Sender number", row.sender || "—"], ["Transaction number", String(row.id)],
      ["Username", row.username || "—"], ["Name", row.full_name], ["Email", row.email], ["Mobile", row.phone || "—"],
      ["Upliner", upliner], ["Plan", row.plan || "—"], ...moneyRows,
    ];
  }
  return { id: row.id, title, subtitle: row.email, image: row.screenshot, fields, sheet: kind !== "upgrade", kind, pending: row.status !== "approved", reapprove: row.status === "rejected" };
}

function SlipView({ src, onOpen }) {
  const { url } = useAuthImage(src);
  if (!src || !url) return <button type="button" className="view-btn" onClick={onOpen}>View details</button>;
  return <button type="button" className="slip-thumb" onClick={onOpen}><img src={url} alt="Deposit slip" /></button>;
}

function ProfileTools({ id }) {
  const [box, setBox] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  async function send(path, body) {
    setBusy(true);
    setNote("");
    try {
      await api(path, { method: "POST", body });
      setBox("");
      setAmount("");
      setReason("");
      setPassword("");
      window.location.reload();
    } catch (err) {
      setNote(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="info-sheet">
      <h2>Profile actions</h2>
      <div className="action-row">
        {[["balance_add", "Add Balance"], ["balance_sub", "Subtract Balance"], ["flower_add", "Add Flower Earnings"], ["flower_sub", "Subtract Flower Earnings"], ["ban", "Ban User"], ["password", "Change password"]].map(([key, label]) => (
          <button key={key} type="button" className="btn small" onClick={() => { setBox(key); setNote(""); }}>{label}</button>
        ))}
        <button type="button" className="btn small" onClick={async () => {
          const data = await api(`/api/admin/users/${id}/impersonate`, { method: "POST", body: {} });
          window.open(`/impersonate?code=${encodeURIComponent(data.code)}`, "_blank", "noopener");
        }}>Login as User</button>
      </div>
      {box && box !== "ban" && box !== "password" && (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); send(`/api/admin/users/${id}/adjust`, { kind: box, amount, reason, request_key: `${id}-${box}-${Date.now()}` }); }}>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" inputMode="decimal" required />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" required />
          <button className="btn" disabled={busy} type="submit">Save</button>
        </form>
      )}
      {box === "ban" && (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); send(`/api/admin/users/${id}/ban`, { reason }); }}>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ban reason" required />
          <button className="btn" disabled={busy} type="submit">Ban this user</button>
        </form>
      )}
      {box === "password" && (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); send(`/api/admin/users/${id}/password`, { password }); }}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" required />
          <button className="btn" disabled={busy} type="submit">Update password</button>
        </form>
      )}
      {note && <p className="sub">{note}</p>}
    </section>
  );
}

export function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = useLoad(`/api/admin/users/${id}`);
  const [detail, setDetail] = useState(null);
  const [txQuery, setTxQuery] = useState("");
  if (!data) return <p>Loading...</p>;
  const openDeposit = (d) => setDetail(paymentDetail({ ...d, full_name: data.user.full_name, email: data.user.email, username: data.user.username, phone: data.user.phone, upliner: data.upliner }, "deposit"));
  const openUpgrade = (d) => setDetail(paymentDetail({ ...d, full_name: data.user.full_name, email: data.user.email, plan: d.to_plan }, "upgrade"));
  const profile = data.profile || {};
  const parts = String(profile.full_name || data.user.full_name || "").split(" ");
  const referral = `${window.location.origin}/register?ref=${profile.referral_code || ""}`;
  const copyCode = () => navigator.clipboard.writeText(referral);
  return (
    <>
      <Link className="back-link" to="/admin/users?status=all">← Users</Link>
      <h1>User profile</h1>
      <p className="sub">{data.user.full_name} · {data.user.email}</p>
      <div className="profile-layout">
        <div className="profile-board">
          <a className="profile-card balance" href="#user-history"><span>Current Balance</span><b>Rs {rs(profile.balance || data.user.balance)}</b><em>History</em></a>
          <a className="profile-card deposits" href="#user-slips"><span>Total Deposit</span><b>Rs {rs(profile.deposits || 0)}</b><em>Slips</em></a>
          <a className="profile-card withdrawals" href="#user-history"><span>Total Withdraw</span><b>Rs {rs(profile.withdrawals || 0)}</b><em>History</em></a>
          <a className="profile-card tx" href="#user-history"><span>Transactions</span><b>{Number(profile.transactions || 0).toLocaleString("en-US")}</b><em>This user</em></a>
        </div>
        <section className="info-sheet">
          <h2>User information</h2>
          <div><span>First name</span><b>{profile.first_name || parts[0] || "—"}</b></div>
          <div><span>Last name</span><b>{profile.last_name || parts.slice(1).join(" ") || "—"}</b></div>
          <div><span>Email</span><b>{profile.email || data.user.email}</b></div>
          <div><span>Mobile number</span><b>{profile.phone || data.user.phone || "—"}</b></div>
          <div><span>Current level</span><b>Level {profile.level ?? data.user.level}</b></div>
          <div><span>Total approved team</span><b>{data.team.filter((m) => m.paid).length}</b></div>
          <div><span>Purchased plan</span><b>{data.user.plan || "No plan"}</b></div>
          <div><span>Upliner</span><b>{data.upliner ? <Link to={`/admin/users/${data.upliner.id}`}>{data.upliner.full_name} · {data.upliner.email}</Link> : "Joined directly"}</b></div>
          <div><span>Flower earnings</span><b>Rs {rs(profile.flower_balance || 0)}</b></div>
          {profile.status === "banned" && <div><span>Ban reason</span><b>{profile.ban_reason || "Banned"}</b></div>}
        </section>
        <ProfileTools id={id} />
      </div>
      <section className="stat upliner-panel">
        <div className="sub">Upliner</div>
        {data.upliner ? <Link to={`/admin/users/${data.upliner.id}`}><b>{data.upliner.full_name}</b><div className="sub">{data.upliner.email} · {data.upliner.phone || "No phone"} · {data.upliner.plan || "No plan"} · Level {data.upliner.level}</div></Link> : <b>No upliner. This account joined directly.</b>}
      </section>
      <h2 id="user-slips">Deposit slips</h2>
      <div className="table-wrap desktop-table"><table><thead><tr><th>Plan</th><th>Amount</th><th>Method</th><th>Sender</th><th>Slip</th><th>Status</th></tr></thead><tbody>
        {(data.deposits || []).map((d) => <tr key={d.id}><td>{d.plan || "—"}</td><td>Rs {d.amount}</td><td>{d.method || "—"}</td><td>{d.sender || "—"}</td><td><SlipView src={d.screenshot} onOpen={() => openDeposit(d)} /></td><td>{d.status}</td></tr>)}
      </tbody></table></div>
      <div className="cards">{(data.deposits || []).map((d) => <button className="lb-card tap" type="button" key={d.id} onClick={() => openDeposit(d)}><b>{d.plan || "Plan"} · Rs {d.amount}</b><div className="sub">{d.method} · {d.sender || "No sender"} · {d.status}</div><span className="view-btn">Open slip</span></button>)}</div>
      {(data.deposits || []).length === 0 && <p>No deposit yet.</p>}
      <h2>Team</h2>
      <div className="team-counts"><span>Paid users {data.team.filter((m) => m.paid).length}</span><span>Unpaid users {data.team.filter((m) => !m.paid).length}</span></div>
      <div className="table-wrap desktop-table"><table><thead><tr><th>#</th><th>Name</th><th>Plan</th><th>Date</th><th>Payment Status</th><th>Details</th></tr></thead><tbody>
        {data.team.map((m, i) => <tr className="click-row" key={m.id} onClick={() => navigate(`/admin/users/${m.id}`)}><td>{i + 1}</td><td><b>{m.full_name}</b><div className="sub">{m.email}</div></td><td><PlanBadge name={m.plan} color={m.plan_color} text={m.plan_text} /></td><td>{new Date(m.date).toLocaleDateString()}<div className="sub">{new Date(m.date).toLocaleTimeString()}</div></td><td><span className="badge" style={{ background: m.paid ? "#d1fae5" : "#fff3cd", color: m.paid ? "#065f46" : "#856404" }}>{m.paid ? "Paid" : "Unpaid"}</span></td><td><Link to={`/admin/users/${m.id}`} onClick={(e) => e.stopPropagation()}>Details</Link></td></tr>)}
      </tbody></table></div>
      <div className="cards">{data.team.map((m) => <Link className="lb-card" to={`/admin/users/${m.id}`} key={m.id}><b>{m.full_name}</b><div className="sub">{m.email}</div><PlanBadge name={m.plan} color={m.plan_color} text={m.plan_text} /><div className="sub">{m.paid ? "Paid" : "Unpaid"}</div><span className="view-btn">Open details</span></Link>)}</div>
      {data.team.length === 0 && <p>No team members yet.</p>}
      <h2 id="user-history">Transactions</h2>
      <input value={txQuery} onChange={(e) => setTxQuery(e.target.value)} placeholder="Search this user's history" />
      <div className="table-wrap"><table><tbody>{data.transactions.filter((t) => `${t.title} ${t.source_email || ""} ${t.remark || ""}`.toLowerCase().includes(txQuery.toLowerCase())).map((t) => <tr key={t.id}><td><b>{t.title}</b><div className="sub">{t.remark || "entry"} · {t.source_email || "—"}</div></td><td>Rs {t.amount}</td></tr>)}</tbody></table></div>
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} onAction={() => setDetail(null)} />}
    </>
  );
}

export function Leaderboard() {
  const data = useLoad("/api/admin/leaderboard");
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("earnings");
  const rows = (data || []).filter((u) => `${u.full_name} ${u.email}`.toLowerCase().includes(q.toLowerCase()) && (!level || String(u.level) === level));
  rows.sort((a, b) => sort === "level" ? b.level - a.level || Number(b.earnings) - Number(a.earnings) : Number(b.earnings) - Number(a.earnings) || b.level - a.level);
  return (
    <>
      <h1>Leaderboard</h1>
      <div className="filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" />
        <select value={level} onChange={(e) => setLevel(e.target.value)}><option value="">All levels</option>{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>Level {n}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="earnings">Earnings high to low</option><option value="level">Level high to low</option></select>
      </div>
      <div className="table-wrap desktop-table"><table><thead><tr><th>#</th><th>Name</th><th>Approved team</th><th>Level</th><th>Earnings</th><th>Details</th></tr></thead><tbody>
        {rows.map((u, i) => <tr className="click-row" key={u.id} onClick={() => navigate(`/admin/users/${u.id}`)}><td>{i + 1}</td><td><Link to={`/admin/users/${u.id}`} onClick={(e) => e.stopPropagation()}><b>{u.full_name}</b></Link><div className="sub">{u.email}</div></td><td>{u.active_team}</td><td>Level {u.level}</td><td>Rs {u.earnings}</td><td><Link to={`/admin/users/${u.id}`} onClick={(e) => e.stopPropagation()}>View details</Link></td></tr>)}
      </tbody></table></div>
      <div className="cards">{rows.map((u, i) => <Link className="lb-card" to={`/admin/users/${u.id}`} key={u.id}><b>#{i + 1} {u.full_name}</b><div className="sub">{u.email}</div><div>Approved team {u.active_team} · Level {u.level}</div><div>Rs {u.earnings}</div><span className="view-btn">View details</span></Link>)}</div>
    </>
  );
}

export function Referrals() {
  const data = useLoad("/api/admin/levels");
  const [form, setForm] = useState(null);
  const [note, setNote] = useState("");
  useEffect(() => { if (data && !form) setForm({ direct_label: data.direct_label || "", level2_label: data.level2_label || "", level3_label: data.level3_label || "", direct_percent: data.direct || "", level2_percent: data.level2 || "", level3_percent: data.level3 || "" }); }, [data]);
  if (!form) return <p>Loading...</p>;
  const save = (e) => { e.preventDefault(); api("/api/admin/levels/save", { method: "POST", body: form }).then(() => setNote("Saved for future commissions. Older commission records stay unchanged.")).catch((err) => setNote(err.message)); };
  return <><h1>Referral Commissions</h1><p className="sub">Current direct {data.direct}% · Level 2 {data.level2}% · Level 3 {data.level3}%. Saving changes future calculations only.</p><form className="stack stat" onSubmit={save}><input value={form.direct_label} onChange={(e) => setForm({ ...form, direct_label: e.target.value })} placeholder="Direct label" /><input value={form.direct_percent} onChange={(e) => setForm({ ...form, direct_percent: e.target.value })} placeholder="Direct percent" /><input value={form.level2_label} onChange={(e) => setForm({ ...form, level2_label: e.target.value })} placeholder="Level 2 label" /><input value={form.level2_percent} onChange={(e) => setForm({ ...form, level2_percent: e.target.value })} placeholder="Level 2 percent" /><input value={form.level3_label} onChange={(e) => setForm({ ...form, level3_label: e.target.value })} placeholder="Level 3 label" /><input value={form.level3_percent} onChange={(e) => setForm({ ...form, level3_percent: e.target.value })} placeholder="Level 3 percent" /><button className="btn">Save future rates</button>{note && <p>{note}</p>}</form></>;
}

function MoneyList({ path, actionPath, kind = "deposit" }) {
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(null);
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const fullPath = path.includes("q=") ? path : `${path}${path.includes("?") ? "&" : "?"}q=${encodeURIComponent(q)}`;
  const refreshCounts = useContext(refreshCountsContext);
  const load = () => api(fullPath).then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, [fullPath]);
  const act = (id, action, extra = {}) => api(`${actionPath}/${id}`, { method: "POST", body: { action, reason: extra.reason || "", pay_commission: extra.pay_commission ? "yes" : "no" } }).then(() => { setDetail(null); load(); refreshCounts(); }).catch((err) => window.alert(err.message));
  const actions = (row) => row.status === "approved"
    ? <span className="badge" style={{ background: "#d1fae5", color: "#065f46" }}>approved</span>
    : row.status === "rejected"
      ? (kind === "deposit" ? <button className="btn small" onClick={() => act(row.id, "approve")}>Re-Approve</button> : <span className="badge" style={{ background: "#fee2e2", color: "#991b1b" }}>rejected</span>)
      : <div className="row-actions"><button className="btn small" onClick={() => act(row.id, "approve", { pay_commission: kind === "upgrade" && window.confirm("Credit 20% of the additional payment to the direct upliner?") })}>Approve</button><button className="btn ghost small" onClick={() => { const reason = window.prompt("Rejection reason"); if (reason) act(row.id, "reject", { reason }); }}>Reject</button></div>;
  const who = (row) => <td><Link to={row.user_id ? `/admin/users/${row.user_id}` : "/admin/users"}><b>{row.full_name}</b></Link><div className="sub">{row.email}</div>{row.upliner && <div className="sub">Upliner: {row.upliner.full_name}</div>}</td>;
  const openRow = (row) => {
    const base = paymentDetail(row, kind);
    setDetail({ ...base, review: kind !== "upgrade", upliner: row.upliner || null, loading: Boolean(row.user_id) || kind === "withdraw" });
    const extraJob = kind === "withdraw" ? api(`/api/admin/withdrawals/${row.id}`) : Promise.resolve(null);
    const userJob = Promise.resolve(null);
    Promise.all([extraJob, userJob]).then(([extra, userData]) => {
      let fields = base.fields;
      let account = null;
      let upliner = row.upliner || null;
      let team = null;
      if (extra) {
        fields = base.fields.map(([label, value]) => {
          if (label === "Referred by" && extra.upliner) return [label, extra.upliner.full_name];
          if (label === "Mobile" && extra.account) return [label, extra.account.phone || value];
          if (label === "Username" && extra.account) return [label, extra.account.username || value];
          return [label, value];
        });
        fields.splice(1, 0, ["Total team", String(extra.team?.total ?? 0)]);
        account = extra.account;
        upliner = extra.upliner;
        team = extra.team;
      }
      const userPack = userData ? {
        id: userData.user.id,
        email: userData.user.email,
        profile: userData.profile || {},
        deposits: (userData.deposits || []).slice(0, 6),
        withdrawals: (userData.withdrawals || []).slice(0, 6),
        transactions: (userData.transactions || []).slice(0, 6),
      } : null;
      setDetail((current) => (current && current.id === row.id ? { ...base, fields, review: kind !== "upgrade", loading: false, account, upliner, team, userPack } : current));
    }).catch(() => setDetail((current) => (current && current.id === row.id ? { ...base, review: kind !== "upgrade", loading: false } : current)));
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
export function TodayUsers() {
  const [q, setQ] = useState("");
  const [day, setDay] = useState("");
  const [plan, setPlan] = useState("");
  const [data, setData] = useState(null);
  const [detail, setDetail] = useState(null);
  const load = () => api(`/api/admin/today-approved?q=${encodeURIComponent(q)}&date=${day}&plan=${encodeURIComponent(plan)}`).then(setData);
  useEffect(() => { load(); }, [q, day, plan]);
  if (!data) return <p>Loading...</p>;
  return (
    <>
      <h1>Today Approved Users</h1>
      <p className="sub">Each plan payment is counted on the day it is approved. An older pending or rejected request approved on this date is included.</p>
      <div className="stats">
        <div className="stat"><div className="sub">Today Receive Balance</div><h2>Rs {data.receive}</h2></div>
        <div className="stat"><div className="sub">Today Approved User Count</div><h2>{data.users}</h2></div>
        {(data.plans || []).map((item) => <div className="stat" key={item.name}><div className="sub">{item.name}</div><h2>{item.count}</h2></div>)}
      </div>
      <div className="filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, username, or email" />
        <input type="date" value={day || data.date || ""} onChange={(e) => setDay(e.target.value)} />
        <select value={plan} onChange={(e) => setPlan(e.target.value)}><option value="">All plans</option>{["Basic", "Gold", "Standard", "Premium", "Super Premium"].map((name) => <option key={name}>{name}</option>)}</select>
      </div>
      <div className="table-wrap"><table><tbody>{(data.rows || []).map((row) => <tr key={row.id}><td><Link to={`/admin/users/${row.user_id}`}><b>{row.full_name}</b></Link><div className="sub">{row.email}</div></td><td>{row.plan}<div className="sub">Rs {row.amount}</div><div className="sub">Submitted {String(row.created_at || "").slice(0, 10)}</div></td><td><button className="view-btn" type="button" onClick={() => setDetail(paymentDetail({ ...row, status: "approved" }, "deposit"))}>View detail</button></td></tr>)}</tbody></table></div>
      {(data.rows || []).length === 0 && <p>0 users for this filter.</p>}
      {detail && <DetailModal detail={{ ...detail, pending: false }} onClose={() => setDetail(null)} onAction={() => setDetail(null)} />}
    </>
  );
}
export function Withdrawals() {
  const [params] = useSearchParams();
  const status = params.get("wstatus") || "pending";
  const titles = { pending: "Withdrawal Request", approved: "All Approved Withdraw", rejected: "Rejected Withdrawals", all: "All Withdrawals" };
  return <><h1>{titles[status] || "Withdrawal Request"}</h1><QueueFilters param="wstatus" /><MoneyList kind="withdraw" path={`/api/admin/withdrawals?status=${status}`} actionPath="/api/admin/withdrawals" /></>;
}
export function TodayWithdrawals() {
  const [q, setQ] = useState("");
  const [day, setDay] = useState("");
  return <><h1>Today approved Withdrawal</h1><div className="filters"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Email, mobile, or account number" /><input type="date" value={day} onChange={(e) => setDay(e.target.value)} /></div><MoneyList kind="withdraw" path={`/api/admin/withdrawals?status=approved&today=1&q=${encodeURIComponent(q)}&date=${day}`} actionPath="/api/admin/withdrawals" /></>;
}
export function Rejected() {
  const [q, setQ] = useState("");
  const [day, setDay] = useState("");
  const [plan, setPlan] = useState("");
  return <><h1>Rejected User</h1><div className="filters"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Email, username, or mobile" /><input type="date" value={day} onChange={(e) => setDay(e.target.value)} /><select value={plan} onChange={(e) => setPlan(e.target.value)}><option value="">All plans</option>{["Basic", "Gold", "Standard", "Premium", "Super Premium"].map((name) => <option key={name}>{name}</option>)}</select></div><MoneyList kind="deposit" path={`/api/admin/deposits?status=rejected&q=${encodeURIComponent(q)}&date=${day}&plan=${encodeURIComponent(plan)}`} actionPath="/api/admin/deposits" /></>;
}
export function Upgrades() {
  const [params] = useSearchParams();
  const board = useLoad("/api/admin/upgrade-board");
  const status = params.get("ustatus") || "pending";
  return <><h1>Plan Upgrade</h1><div className="stats"><div className="stat"><div className="sub">Today Plan Upgrades</div><h2>{board?.today_count || 0}</h2></div><div className="stat"><div className="sub">Today Receive Balance</div><h2>Rs {board?.today_receive || "0.00"}</h2></div><div className="stat"><div className="sub">Pending</div><h2>{board?.pending || 0}</h2></div><div className="stat"><div className="sub">Approved</div><h2>{board?.approved || 0}</h2></div><div className="stat"><div className="sub">Rejected</div><h2>{board?.rejected || 0}</h2></div></div><p className="sub">{board?.commission_base}</p><QueueFilters param="ustatus" /><MoneyList kind="upgrade" path={`/api/admin/upgrades?status=${status}`} actionPath="/api/admin/upgrades" /></>;
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
      const body = new FormData();
      body.append("id", row.id || "");
      body.append("name", row.name);
      body.append("account_name", row.account_name || "");
      body.append("account_number", row.account_number || "");
      body.append("active", row.active === false ? "0" : "1");
      if (row.imageFile) body.append("image", row.imageFile);
      await api("/api/admin/gateways", { method: "POST", body });
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
          <label><input type="checkbox" checked={row.active !== false} onChange={(e) => update(row.name, "active", e.target.checked)} /> Enabled</label>
          <input type="file" accept="image/*" onChange={(e) => update(row.name, "imageFile", e.target.files[0])} />
          {row.image && <img src={row.image} alt="" width="42" height="42" />}
          <button className="btn" type="submit">Save {row.name}</button>
        </form>
      ))}</div>
      {note && <p>{note}</p>}
    </>
  );
}
export function Transactions() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const day = params.get("date") || "";
  const q = params.get("q") || "";
  const page = params.get("page") || "1";
  const [detail, setDetail] = useState(null);
  const data = useLoad(`/api/admin/transactions?category=${encodeURIComponent(category)}&q=${encodeURIComponent(q)}&date=${encodeURIComponent(day)}&page=${page}`);
  const rows = Array.isArray(data) ? data : (data?.rows || []);
  const titles = {
    ads: "Task Earnings",
    manual_add: "Manual Additions",
    manual_sub: "Manual Subtractions",
    referral: "Referral Commissions",
  };
  const setQuery = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  };
  const open = (t) => setDetail({
    title: t.title,
    subtitle: t.user_name,
    fields: [["User", t.user_name], ["Email", t.user_email], ["From", t.source_email || "—"], ["Plan", t.plan_name || "—"], ["Amount", `Rs ${t.amount}`], ["Date", String(t.created_at || "").replace("T", " ").slice(0, 16)]],
  });
  if (!data) return <p>Loading...</p>;
  const picked = day === "today" ? (data.date || "") : day;
  return (
    <>
      <h1>{titles[category] || "Transactions"}</h1>
      <p className="sub">{picked ? `Showing ${picked}. This total uses the same records as the dashboard for that date.` : "All dates. This total matches the dashboard overall figure for this source."}</p>
      <div className="stat"><div className="sub">{picked ? "Selected date total" : "Overall total"}</div><h2>Rs {rs(data.total || 0)}</h2><span>{Number(data.count || rows.length).toLocaleString("en-US")} records</span></div>
      <div className="search-row">
        <input value={q} onChange={(e) => setQuery({ q: e.target.value })} placeholder="Search name, email, or commission" />
        <select value={category} onChange={(e) => setQuery({ category: e.target.value })}>
          <option value="">All</option>
          <option value="direct_traffic">Direct Referral Commission</option>
          <option value="level_2">Level 2 Indirect Referral Commission</option>
          <option value="level_3">Level 3 Indirect Referral Commission</option>
          <option value="ads">Task Earnings</option>
          <option value="manual_add">Manual Additions</option>
          <option value="manual_sub">Manual Subtractions</option>
          <option value="referral">Referral Commissions</option>
          <option value="withdraw">Withdraw</option>
        </select>
        <input type="date" value={picked} onChange={(e) => setQuery({ date: e.target.value })} />
        <button className="btn small" type="button" onClick={() => setQuery({ date: "" })}>All dates</button>
      </div>
      <div className="table-wrap desktop-table"><table><tbody>{rows.map((t) => <tr key={t.id}><td><Link to={t.user_id ? `/admin/users/${t.user_id}` : "/admin/users"}><b>{t.user_name}</b></Link><div className="sub">{t.user_email}</div><div className="sub">{t.title}</div><div className="sub">{String(t.created_at || "").slice(0, 10)}</div></td><td>Rs {t.amount}</td><td><button className="view-btn" type="button" onClick={() => open(t)}>View</button></td></tr>)}</tbody></table></div>
      <div className="cards">{rows.map((t) => <div className="lb-card" key={t.id}><Link to={t.user_id ? `/admin/users/${t.user_id}` : "/admin/users"}><b>{t.user_name}</b></Link><div className="sub">{t.title}</div><div className="sub">{String(t.created_at || "").slice(0, 10)} · Rs {t.amount}</div><button className="view-btn" type="button" onClick={() => open(t)}>View</button></div>)}</div>
      {rows.length === 0 && <p>No records for this filter.</p>}
      {Number(data.pages) > 1 && (
        <div className="row-actions">
          <button className="btn ghost small" type="button" disabled={Number(data.page) <= 1} onClick={() => setQuery({ page: String(Number(data.page) - 1), q, category, date: day })}>Previous</button>
          <span className="sub">Page {data.page} of {data.pages}</span>
          <button className="btn ghost small" type="button" disabled={Number(data.page) >= Number(data.pages)} onClick={() => setQuery({ page: String(Number(data.page) + 1), q, category, date: day })}>Next</button>
        </div>
      )}
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
  const edit = async (channel) => {
    const title = window.prompt("Channel title", channel.title);
    if (!title) return;
    const purpose = window.prompt("Channel purpose", channel.purpose || "") || "";
    const link = window.prompt("Channel link", channel.link) || channel.link;
    const body = new FormData();
    body.append("title", title);
    body.append("purpose", purpose);
    body.append("link", link);
    await api(`/api/admin/channels/${channel.id}`, { method: "POST", body });
    load();
  };
  const remove = async (channel) => {
    if (!window.confirm(`Delete ${channel.title}?`)) return;
    const body = new FormData();
    body.append("delete", "1");
    await api(`/api/admin/channels/${channel.id}`, { method: "POST", body });
    load();
  };
  return <><h1>Official Channels</h1><form onSubmit={submit} className="stat"><input placeholder="Channel title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><input placeholder="Channel purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /><input placeholder="Channel link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /><input name="image" type="file" accept="image/*" /><button className="btn" style={{ marginTop: 8 }}>Add channel</button></form><div className="stats" style={{ marginTop: 16 }}>{rows.map((c) => <div className="stat" key={c.id}>{c.image && <img src={c.image} alt="" width="42" height="42" />}<b>{c.title}</b><div className="sub">{c.purpose}</div><a href={c.link} target="_blank" rel="noreferrer">{c.link}</a><div className="row-actions"><button className="btn small" type="button" onClick={() => edit(c)}>Edit</button><button className="btn ghost small" type="button" onClick={() => remove(c)}>Delete</button></div></div>)}</div>{shot && <DetailModal detail={{ title: "Channel picture", image: shot, fields: [] }} onClose={() => setShot("")} onAction={() => setShot("")} />}</>;
}
export function Contacts() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: "", instructions: "", purpose: "", number: "", number_type: "whatsapp" });
  const load = () => api("/api/admin/contacts").then(setRows);
  useEffect(() => { load(); }, []);
  const save = async (e) => {
    e.preventDefault();
    await api("/api/admin/contacts/save", { method: "POST", body: form });
    setForm({ name: "", instructions: "", purpose: "", number: "", number_type: "whatsapp" });
    load();
  };
  return <><h1>Contact Us</h1><form className="stack stat" onSubmit={save}><input placeholder="Admin name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><input placeholder="Instructions" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /><input placeholder="Admin purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /><input placeholder="Contact number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} required /><select value={form.number_type} onChange={(e) => setForm({ ...form, number_type: e.target.value })}><option value="whatsapp">WhatsApp</option><option value="botim">Botim</option></select><button className="btn">Add admin</button></form><div className="stats">{rows.map((c) => <div className="stat" key={c.id}><b>{c.name}</b><div>{c.number_type || "whatsapp"} · {c.whatsapp}</div><div className="sub">{c.purpose || c.role}</div><div className="sub">{c.note}</div><button className="btn ghost small" type="button" onClick={async () => { if (window.confirm(`Delete ${c.name}?`)) { await api("/api/admin/contacts/save", { method: "POST", body: { id: c.id, delete: "1" } }); load(); } }}>Delete</button></div>)}</div></>;
}
export function Levels() {
  const data = useLoad("/api/admin/levels");
  const [form, setForm] = useState(null);
  const [note, setNote] = useState("");
  useEffect(() => { if (data && !form) setForm({ direct_percent: data.direct || "", level2_percent: data.level2 || "", level3_percent: data.level3 || "" }); }, [data]);
  if (!form) return <p>Loading...</p>;
  return <><h1>Levels Setting</h1><p className="sub">Current direct {data.direct}% · Level 2 {data.level2}% · Level 3 {data.level3}%. New percentages apply to future eligible calculations.</p><form className="stack stat" onSubmit={(e) => { e.preventDefault(); api("/api/admin/levels/save", { method: "POST", body: form }).then(() => setNote("Saved.")).catch((err) => setNote(err.message)); }}><label>Direct traffic commission <input value={form.direct_percent} onChange={(e) => setForm({ ...form, direct_percent: e.target.value })} /></label><label>Indirect commission – Level 2 <input value={form.level2_percent} onChange={(e) => setForm({ ...form, level2_percent: e.target.value })} /></label><label>Indirect commission – Level 3 <input value={form.level3_percent} onChange={(e) => setForm({ ...form, level3_percent: e.target.value })} /></label><button className="btn">Save future percentages</button>{note && <p>{note}</p>}</form></>;
}
export function AdminAccount() {
  const [email, setEmail] = useState("");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [sessions, setSessions] = useState([]);
  const [note, setNote] = useState("");
  const load = () => { api("/api/admin/account").then((d) => setEmail(d.email)); api("/api/admin/sessions").then(setSessions); };
  useEffect(() => { load(); }, []);
  return <><h1>Admin account</h1><form className="stack stat" onSubmit={async (e) => { e.preventDefault(); try { await api("/api/admin/account", { method: "POST", body: { email, current_password: current, new_password: next } }); setNote("Saved."); setCurrent(""); setNext(""); } catch (err) { setNote(err.message); } }}><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" /><input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" required /><input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password, optional" /><button className="btn">Save account</button>{note && <p>{note}</p>}</form><h2>Active sessions</h2>{sessions.map((row) => <div className="stat" key={row.key}><b>{row.email}</b><div>{row.device} · {row.browser}</div><div className="sub">Login {new Date(row.login_time).toLocaleString()}</div><div className="sub">Last activity {row.last_seen ? new Date(row.last_seen).toLocaleString() : "—"}</div>{row.revoked ? <span>Revoked</span> : <button className="btn ghost small" type="button" onClick={async () => { await api("/api/admin/sessions", { method: "POST", body: { key: row.key } }); load(); }}>Revoke</button>}</div>)}</>;
}
export function Rewards() {
  const data = useLoad("/api/admin/rewards");
  return <><h1>Rewards</h1>{(data || []).map((r) => <div className="stat" key={r.id}><b>{r.title}</b><div>{r.required_team} team · {r.prize}</div></div>)}</>;
}
