import { useContext, useEffect, useState, createContext } from "react";
import { Link, NavLink, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, clearSession, LOGO, token } from "./api";

const refreshCountsContext = createContext(() => {});
const toastContext = createContext(() => {});

function refreshAdmin() {
  window.dispatchEvent(new Event("admin-data-refresh"));
}

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
    ["/admin/gateways", "card", "Payment methods"],
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
    search: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM20 20l-3.5-3.5",
  };
  return (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

function adminListPath(pathname) {
  return pathname.startsWith("/admin") && !/^\/admin\/users\/\d+/.test(pathname);
}

export function AdminShell({ children }) {
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({ deposits: 0, withdrawals: 0, upgrades: 0 });
  const [toasts, setToasts] = useState([]);
  const location = useLocation();
  const pathname = location.pathname;
  const refreshCounts = () => api("/api/admin/summary").then((data) => {
    setCounts({ deposits: data.pending_deposits || 0, withdrawals: data.pending_withdrawals || 0, upgrades: data.pending_upgrades || 0 });
  }).catch(() => {});
  useEffect(() => { refreshCounts(); }, [pathname]);
  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    if (!adminListPath(location.pathname)) return undefined;
    const remember = () => sessionStorage.setItem("admin-list-return", JSON.stringify({ path, scroll: window.scrollY || 0 }));
    remember();
    window.addEventListener("scroll", remember, { passive: true });
    const saved = JSON.parse(sessionStorage.getItem("admin-list-scroll") || "null");
    if (saved && saved.path === path) window.requestAnimationFrame(() => window.scrollTo(0, saved.scroll || 0));
    return () => {
      sessionStorage.setItem("admin-list-scroll", JSON.stringify({ path, scroll: window.scrollY || 0 }));
      window.removeEventListener("scroll", remember);
    };
  }, [location.pathname, location.search]);
  const pushToast = (text, kind = "ok") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current.slice(-3), { id, text, kind }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3600);
  };
  const logout = () => { clearSession(); window.location.href = "/admin/login"; };
  return (
    <toastContext.Provider value={pushToast}>
    <refreshCountsContext.Provider value={refreshCounts}>
    <div className="admin">
      <div className="toast-stack" aria-live="polite">
        {toasts.map((item) => <div className={item.kind === "error" ? "toast err" : "toast"} key={item.id}>{item.text}</div>)}
      </div>
      <aside className="side">
        <div className="brand"><img src={LOGO} alt="Flower" /><b>Flower Admin</b><span>Control desk</span></div>
        <div className="side-nav"><NavLinks counts={counts} /></div>
        <button className="btn" onClick={logout}>Logout</button>
      </aside>
      <div className="admin-col">
        <header className="admin-top">
          <button className="burger" aria-label="Open admin menu" onClick={() => setOpen(true)}><span /><span /><span /></button>
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
    </toastContext.Provider>
  );
}

function AdminBack({ fallback = "/admin/users?status=all", label = "Back" }) {
  const navigate = useNavigate();
  return (
    <button
      className="back-link"
      type="button"
      onClick={() => {
        const saved = JSON.parse(sessionStorage.getItem("admin-list-return") || "null");
        if (saved?.path && saved.path !== `${window.location.pathname}${window.location.search}`) navigate(saved.path);
        else navigate(fallback);
      }}
    >
      ← {label}
    </button>
  );
}

function EmailLink({ email, userId }) {
  if (!email || email === "—") return "—";
  const to = userId ? `/admin/users/${userId}` : `/admin/users?status=all&q=${encodeURIComponent(email)}`;
  return <Link className="mail-link" to={to} onClick={(e) => e.stopPropagation()}>{email}</Link>;
}

function fieldText(label, value, detail) {
  const text = value || "—";
  if (!String(text).includes("@")) return text;
  const name = String(label || "").toLowerCase();
  if (name.includes("upline") && name.includes("email")) return <EmailLink email={text} userId={detail.upliner?.id} />;
  if (!name.includes("email") && name !== "from") return text;
  const userId = name === "from" ? detail.sourceUserId : (detail.userId || detail.account?.id);
  return <EmailLink email={text} userId={userId} />;
}

function statusWord(value) {
  const text = String(value || "").trim();
  if (!text) return "—";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function WithdrawBrief({ detail }) {
  const referral = detail.referral;
  const team = detail.team || {};
  return (
    <div className="wd-body">
      <section>
        <h3>User account</h3>
        <div className="wd-grid">
          <div><span>Current plan</span><b>{detail.plan || "—"}</b></div>
          <div><span>Account joining date</span><b>{detail.joined || "—"}</b></div>
          <div><span>Withdraw request</span><b>{detail.date || "—"}</b></div>
        </div>
      </section>
      <section>
        <h3>Approved team</h3>
        <div className="wd-grid">
          <div><span>Total approved team</span><b>{detail.loading ? "…" : (team.approved ?? detail.teamCount ?? "—")}</b></div>
          <div><span>Paid team</span><b>{detail.loading ? "…" : (team.paid ?? "—")}</b></div>
          <div><span>Unpaid team</span><b>{detail.loading ? "…" : (team.unpaid ?? "—")}</b></div>
        </div>
      </section>
      <section>
        <h3>User information</h3>
        <div className="wd-grid">
          <div><span>Name</span><b>{detail.name || "—"}</b></div>
          <div><span>Email</span><b><EmailLink email={detail.email} userId={detail.userId} /></b></div>
        </div>
      </section>
      <section>
        <h3>Referral by</h3>
        {referral ? (
          <div className="wd-grid">
            <div><span>Name</span><b>{referral.name || "—"}</b></div>
            <div><span>Email</span><b><EmailLink email={referral.email} userId={referral.id} /></b></div>
          </div>
        ) : (
          <p className="sub">{detail.loading ? "Loading upline..." : "Joined directly"}</p>
        )}
      </section>
      <section>
        <h3>Withdraw Details</h3>
        <div className="wd-grid">
          <div><span>Payment Method</span><b>{detail.method || "—"}</b></div>
          <div><span>Account Name</span><b>{detail.accountName || "—"}</b></div>
          <div><span>Account Number</span><b>{detail.accountNumber || "—"}</b></div>
          <div><span>Withdrawal Amount</span><b>{detail.amount || "—"}</b></div>
          <div><span>Withdrawal Status</span><b className={`wd-status ${detail.status || ""}`}>{statusWord(detail.status)}</b></div>
        </div>
      </section>
      {detail.status === "rejected" && (
        <section className="prior-reason">
          <h3>Rejection Reason</h3>
          <p>{String(detail.rejectReason || "").trim() || "No rejection reason available"}</p>
        </section>
      )}
    </div>
  );
}

function DetailModal({ detail, onClose, onAction }) {
  const toast = useContext(toastContext);
  const [reason, setReason] = useState("");
  const [custom, setCustom] = useState("");
  const [pay, setPay] = useState("no");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState("");
  const chosen = reason === "custom" ? custom.trim() : reason;
  useEffect(() => {
    setEditing(false);
    setEditError("");
    setEditForm(detail ? {
      plan_id: String(detail.plan_id || ""),
      amount: String(detail.amount || ""),
      method: detail.method || "",
      sender_name: detail.sender_name || "",
      sender: detail.sender || "",
      trx_no: detail.trx_no || "",
    } : null);
  }, [detail?.id]);
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
  const reviewAgain = detail.kind === "deposit" && detail.status === "rejected";
  const allowReject = Boolean(detail.pending) && (!detail.reapprove || reviewAgain);
  const cardClass = detail.compact ? "modal-card compact-withdraw" : (detail.team || detail.sheet ? "modal-card wide" : "modal-card");
  return (
    <div className="modal-back" onClick={onClose}>
      <div className={cardClass} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{detail.title}</h2>
            {detail.subtitle && <p className="sub">{detail.subtitle}</p>}
          </div>
          <button className="modal-x" type="button" onClick={onClose} aria-label="Close">×</button>
        </div>
        {detail.compact ? <WithdrawBrief detail={detail} /> : (
          <>
        {editing && editForm && (
          <form className="payment-edit-form" onSubmit={(event) => {
            event.preventDefault();
            setEditError("");
            const form = event.currentTarget;
            if (!editForm.plan_id || !editForm.amount || !Number.isFinite(Number(editForm.amount)) || Number(editForm.amount) <= 0) {
              setEditError("Choose a plan and enter a valid payment amount.");
              return;
            }
            onAction(detail.id, "edit", {
              ...editForm,
              screenshot: form.elements.screenshot.files[0] || null,
            });
          }}>
            <h3>Edit payment details</h3>
            <label>Selected plan
              <select value={editForm.plan_id} onChange={(event) => setEditForm({ ...editForm, plan_id: event.target.value })} required>
                <option value="">Choose a plan</option>
                {(detail.plans || []).map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · Rs {plan.price}</option>)}
              </select>
            </label>
            <label>Payment amount<input inputMode="decimal" value={editForm.amount} onChange={(event) => setEditForm({ ...editForm, amount: event.target.value })} required /></label>
            <label>Payment method<input value={editForm.method} onChange={(event) => setEditForm({ ...editForm, method: event.target.value })} /></label>
            <label>Sender name<input value={editForm.sender_name} onChange={(event) => setEditForm({ ...editForm, sender_name: event.target.value })} /></label>
            <label>Sender number<input value={editForm.sender} onChange={(event) => setEditForm({ ...editForm, sender: event.target.value })} /></label>
            <label>Transaction number<input value={editForm.trx_no} onChange={(event) => setEditForm({ ...editForm, trx_no: event.target.value })} /></label>
            <label>Replace payment screenshot<input name="screenshot" type="file" accept="image/jpeg,image/png,image/webp" /></label>
            {editError && <p className="error">{editError}</p>}
            <div className="row-actions">
              <button className="btn small" type="submit">Save payment details</button>
              <button className="btn ghost small" type="button" onClick={() => { setEditing(false); setEditError(""); }}>Cancel</button>
            </div>
          </form>
        )}
        {detail.brief && <div className="modal-fields">
          {(detail.fields || []).map(([label, value]) => <div key={label}><span>{label}</span><b>{fieldText(label, value, detail)}</b></div>)}
        </div>}
        <SlipImage src={detail.image} />
        {!detail.brief && <div className="modal-fields">
          {(detail.fields || []).map(([label, value]) => <div key={label}><span>{label}</span><b>{fieldText(label, value, detail)}</b></div>)}
        </div>}
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
          </>
        )}
        {reviewAgain && (
          <section className="review-block prior-reason">
            <h3>Previous Rejection Reason</h3>
            <p>{String(detail.rejectReason || "").trim() || "No previous rejection reason available"}</p>
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
            {allowReject && (
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
              {allowReject && <button className="btn ghost small" type="button" onClick={() => { if (!chosen) { toast("A rejection reason is required.", "error"); return; } onAction(detail.id, "reject", { reason: chosen }); }}>Reject</button>}
              {detail.editable && <button className="btn ghost small" type="button" onClick={() => { setEditing((current) => !current); setEditError(""); }}>{editing ? "Close editor" : "Edit"}</button>}
            </div>
          </div>
        )}
        {detail.settled && (
          <div className="row-actions">
            <button className="btn small" type="button" disabled>Approved</button>
          </div>
        )}
      </div>
    </div>
  );
}

function useLoad(path) {
  const [data, setData] = useState(null);
  const [tick, setTick] = useState(0);
  useEffect(() => { setData(null); }, [path]);
  useEffect(() => {
    let live = true;
    api(path).then((next) => { if (live) setData(next); }).catch((err) => {
      if (!live || err.name === "AbortError") return;
      setData(null);
    });
    return () => { live = false; };
  }, [path, tick]);
  useEffect(() => {
    const bump = () => setTick((value) => value + 1);
    window.addEventListener("admin-data-refresh", bump);
    return () => window.removeEventListener("admin-data-refresh", bump);
  }, []);
  return data;
}

function rowsOf(data) {
  if (Array.isArray(data)) return data;
  return data?.rows || [];
}

function SearchBox({ value = "", onSearch, onPick, placeholder, suggestPath }) {
  const [draft, setDraft] = useState(value || "");
  const [tips, setTips] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setDraft(value || ""); }, [value]);
  useEffect(() => {
    const q = draft.trim();
    if (!suggestPath || q.length < 2) {
      setTips([]);
      setBusy(false);
      return undefined;
    }
    const ctrl = new AbortController();
    setBusy(true);
    const timer = window.setTimeout(() => {
      const join = suggestPath.includes("?") ? "&" : "?";
      api(`${suggestPath}${join}suggest=1&limit=8&q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((payload) => {
          setTips(Array.isArray(payload) ? payload : (payload.rows || []));
          setBusy(false);
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          setTips([]);
          setBusy(false);
        });
    }, 280);
    return () => {
      window.clearTimeout(timer);
      ctrl.abort();
    };
  }, [draft, suggestPath]);
  const pick = (row) => {
    setOpen(false);
    setDraft(row.email || "");
    if (onPick) onPick(row);
    else onSearch(row.email || "");
  };
  const clearSearch = () => {
    setDraft("");
    setTips([]);
    setOpen(false);
    setBusy(false);
    onSearch("");
  };
  return (
    <form className="search-row" onSubmit={(e) => { e.preventDefault(); setOpen(false); onSearch(draft.trim()); }}>
      <div className="search-field">
        <input value={draft} placeholder={placeholder} aria-label={placeholder || "Search"} onChange={(e) => { setDraft(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 180)} />
        {draft ? <button className="search-clear" type="button" aria-label="Clear search" onMouseDown={(e) => e.preventDefault()} onClick={clearSearch}>×</button> : null}
      </div>
      <button className="btn small search-go" type="submit" aria-label="Search"><NavIcon name="search" /><span>Search</span></button>
      {open && draft.trim().length >= 2 && (
        <div className="suggest" role="listbox">
          {busy && <p>Searching...</p>}
          {!busy && tips.length === 0 && <p>No account found</p>}
          {!busy && tips.map((row) => (
            <button type="button" key={`${row.id}-${row.email}`} onMouseDown={(e) => { e.preventDefault(); pick(row); }}>
              <b>{row.full_name || row.email}</b>
              <span>{row.email}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

function Pager({ page, pages, onPage }) {
  if (!pages || Number(pages) <= 1) return null;
  return (
    <div className="row-actions">
      <button className="btn ghost small" type="button" disabled={Number(page) <= 1} onClick={() => onPage(Number(page) - 1)}>Previous</button>
      <span className="sub">Page {page} of {pages}</span>
      <button className="btn ghost small" type="button" disabled={Number(page) >= Number(pages)} onClick={() => onPage(Number(page) + 1)}>Next</button>
    </div>
  );
}

function whenText(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace("T", " ").slice(0, 16);
  return date.toLocaleString();
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
      <Link className="home-row total-withdraw" to="/admin/withdrawals?wstatus=approved">
        <span className="home-ico rose"><NavIcon name="wallet" /></span>
        <span><span className="home-label">Total Withdraw</span><b>Rs {rs(money.withdrawn)}</b></span>
        <span className="chev" aria-hidden="true">›</span>
      </Link>
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
      <div className="earn-rows">
        <Link className="home-row earn-line task" to="/admin/transactions?category=ads&date=today">
          <span className="home-ico violet"><NavIcon name="layers" /></span>
          <span><span className="home-label">Total Task Earnings</span><b>Rs {rs(money.task)}</b><small className="today-line">Today Rs {rs(money.task_today)}</small></span>
          <span className="chev" aria-hidden="true">›</span>
        </Link>
        <Link className="home-row earn-line add" to="/admin/transactions?category=manual_add&date=today">
          <span className="home-ico leaf"><NavIcon name="plus" /></span>
          <span><span className="home-label">Manual Additions</span><b>Rs {rs(money.manual_add)}</b><small className="today-line">Today Rs {rs(money.manual_add_today)}</small></span>
          <span className="chev" aria-hidden="true">›</span>
        </Link>
        <Link className="home-row earn-line sub" to="/admin/transactions?category=manual_sub&date=today">
          <span className="home-ico amber"><NavIcon name="minus" /></span>
          <span><span className="home-label">Manual Subtractions</span><b>Rs {rs(money.manual_sub)}</b><small className="today-line">Today Rs {rs(money.manual_sub_today)}</small></span>
          <span className="chev" aria-hidden="true">›</span>
        </Link>
        <Link className="home-row earn-line ref" to="/admin/transactions?category=referral&date=today">
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
  const page = params.get("page") || "1";
  const current = params.get("status") || status;
  const data = useLoad(`/api/admin/users?status=${encodeURIComponent(current)}&q=${encodeURIComponent(q)}&page=${page}`);
  const rows = rowsOf(data);
  const setFilter = (nextStatus) => {
    const next = new URLSearchParams(params);
    next.set("status", nextStatus);
    next.delete("page");
    setParams(next);
  };
  const commit = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("q", value); else next.delete("q");
    next.delete("page");
    setParams(next);
  };
  return (
    <>
      <h1>{searchable ? "Users" : title}</h1>
      {searchable && (
        <>
          <SearchBox value={q} placeholder="Search by full email" suggestPath={`/api/admin/users?status=${encodeURIComponent(current)}`} onSearch={commit} onPick={(row) => {
            const next = new URLSearchParams(params);
            if (row.email) next.set("q", row.email);
            const path = `${window.location.pathname}?${next.toString()}`;
            const place = { path, scroll: window.scrollY || 0 };
            sessionStorage.setItem("admin-list-return", JSON.stringify(place));
            sessionStorage.setItem("admin-list-scroll", JSON.stringify(place));
            navigate(`/admin/users/${row.id}`);
          }} />
          <div className="filters">
            {[["all", "All"], ["approved", "Approved"], ["pending", "Pending"], ["rejected", "Rejected"]].map(([value, label]) => (
              <button key={value} className={current === value ? "chip on" : "chip"} type="button" onClick={() => setFilter(value)}>{label}</button>
            ))}
          </div>
        </>
      )}
      {!data && <p>Loading...</p>}
      <div className="table-wrap desktop-table"><table><thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Plan</th><th>Status</th><th></th></tr></thead><tbody>{rows.map((u, i) => <tr className="click-row" key={u.id} onClick={() => navigate(`/admin/users/${u.id}`)}><td>{i + 1}</td><td><b>{u.full_name}</b><div className="sub"><EmailLink email={u.email} userId={u.id} /></div></td><td>{u.phone || "—"}</td><td><PlanBadge name={u.plan} color={u.plan_color} text={u.plan_text} /></td><td>{u.banned ? "Banned" : (u.paid ? "Paid" : "Unpaid")}</td><td><Link to={`/admin/users/${u.id}`} onClick={(e) => e.stopPropagation()}>Details</Link></td></tr>)}</tbody></table></div>
      <div className="cards">{rows.map((u) => <div className="lb-card" key={u.id}><b>{u.full_name}</b><div className="sub"><EmailLink email={u.email} userId={u.id} /></div><div className="sub">{u.phone || "No phone"} · {u.banned ? "Banned" : (u.paid ? "Paid" : "Unpaid")}</div><PlanBadge name={u.plan} color={u.plan_color} text={u.plan_text} /><Link className="view-btn" to={`/admin/users/${u.id}`}>Open details</Link></div>)}</div>
      {data && rows.length === 0 && <p>{q ? "No account found" : "No users match this search."}</p>}
      <Pager page={data?.page} pages={data?.pages} onPage={(nextPage) => { const next = new URLSearchParams(params); next.set("page", String(nextPage)); setParams(next); }} />
    </>
  );
}

const slipCache = new Map();

function useAuthImage(src) {
  const [url, setUrl] = useState(() => slipCache.get(src) || "");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!src) return undefined;
    const cached = slipCache.get(src);
    if (cached) {
      setUrl(cached);
      setFailed(false);
      return undefined;
    }
    let gone = false;
    const headers = src.startsWith("/api/") ? { Authorization: `Token ${token()}` } : {};
    fetch(src, { headers })
      .then((response) => {
        if (!response.ok) throw new Error("slip");
        return response.blob();
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        slipCache.set(src, objectUrl);
        if (!gone) setUrl(objectUrl);
      })
      .catch(() => {
        if (!gone) setFailed(true);
      });
    return () => { gone = true; };
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

function payerParts(row) {
  const named = String(row.sender_name || "").trim();
  const raw = String(row.sender || "").trim();
  if (named) return { name: named, number: raw || "—" };
  if (raw.includes(" · ")) {
    const [name, number] = raw.split(" · ");
    return { name: name || "—", number: number || "—" };
  }
  return { name: "—", number: raw || "—" };
}

function paymentDetail(row, kind, options = {}) {
  const amount = `Rs ${row.amount}`;
  const when = row.created_at ? new Date(row.created_at).toLocaleString() : "—";
  const upliner = row.upliner ? row.upliner.full_name : "Joined directly";
  const payer = payerParts(row);
  const moneyRows = [["Amount", amount], ["Charge", "Rs 0.00"], ["After charge", amount], ["Rate", "1 Rs = 1.00 PKR"], ["Payable", amount], ["Status", row.status]];
  let title = "Payment slip";
  let fields = [["Name", row.full_name], ["Email", row.email]];
  if (kind === "deposit" && options.brief) {
    title = "User Information";
    fields = [
      ["User Name", row.full_name || "—"],
      ["User Email", row.email || "—"],
      ["Date & Time", when],
      ["Sender Name", payer.name],
      ["Sender Number", payer.number],
    ];
  } else if (kind === "upgrade") {
    title = "Plan upgrade";
    fields.push(["Upliner", upliner], ["Username", row.username || "—"], ["Email", row.email], ["Current plan", row.from_plan], ["Requested plan", row.to_plan], ["Old paid amount", row.old_paid ? `Rs ${row.old_paid}` : "—"], ["Additional payment", row.additional ? `Rs ${row.additional}` : amount], ["Method", row.method || "—"], ["Transaction number", row.trx_no || "—"], ["Sender name", row.sender_name || payer.name], ["Sender number", payer.number], ["Status", row.status], ["Reason", row.reject_reason || "—"]);
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
  return {
    id: row.id,
    title,
    subtitle: options.brief ? "" : row.email,
    image: row.screenshot,
    fields,
    brief: kind === "deposit" && Boolean(options.brief),
    sheet: kind !== "upgrade",
    kind,
    pending: row.status !== "approved",
    editable: kind === "deposit" && row.status !== "approved",
    reapprove: row.status === "rejected",
    status: row.status || "",
    rejectReason: row.reject_reason || "",
    upliner: row.upliner || null,
    plan_id: row.plan_id,
    amount: row.amount,
    method: row.method || "",
    sender: payer.number === "—" ? "" : payer.number,
    sender_name: payer.name === "—" ? "" : payer.name,
    trx_no: row.trx_no || "",
  };
}

function SlipView({ onOpen }) {
  return <button type="button" className="view-btn" onClick={onOpen}>View slip</button>;
}

function ProfileTools({ id, banned }) {
  const toast = useContext(toastContext);
  const [box, setBox] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const messages = {
    balance_add: (n) => `Balance added successfully — Rs. ${rs(n)}`,
    balance_sub: (n) => `Balance subtracted successfully — Rs. ${rs(n)}`,
    flower_add: (n) => `Flower earnings added successfully — Rs. ${rs(n)}`,
    flower_sub: (n) => `Flower earnings subtracted successfully — Rs. ${rs(n)}`,
    ban: () => "User banned successfully",
    unban: () => "User unbanned successfully",
    password: () => "Password changed successfully",
  };
  async function send(path, body, message) {
    setBusy(true);
    try {
      await api(path, { method: "POST", body });
      setBox("");
      setAmount("");
      setReason("");
      setPassword("");
      toast(message);
      refreshAdmin();
    } catch (err) {
      toast(err.message || "The action could not be saved.", "error");
    } finally {
      setBusy(false);
    }
  }
  const actions = [
    ["balance_add", "Add Balance"],
    ["balance_sub", "Subtract Balance"],
    ["flower_add", "Add Flower Earnings"],
    ["flower_sub", "Subtract Flower Earnings"],
    ["password", "Change Password"],
  ];
  return (
      <section className="info-sheet action-sheet">
      <h2 className="sheet-title">Profile actions</h2>
      <div className="action-row">
        {actions.map(([key, label]) => (
          <button key={key} type="button" className="btn small" onClick={() => setBox(key)}>{label}</button>
        ))}
        {banned ? (
          <button type="button" className="btn small" disabled={busy} onClick={() => send(`/api/admin/users/${id}/ban`, { action: "unban" }, messages.unban())}>Unban User</button>
        ) : (
          <button type="button" className="btn small" onClick={() => setBox("ban")}>Ban User</button>
        )}
        <button type="button" className="btn small" onClick={async () => {
          try {
            const data = await api(`/api/admin/users/${id}/impersonate`, { method: "POST", body: {} });
            window.open(`/impersonate?code=${encodeURIComponent(data.code)}`, "_blank", "noopener");
          } catch (err) {
            toast(err.message || "Could not open this user.", "error");
          }
        }}>Login as User</button>
      </div>
      {box && box !== "ban" && box !== "password" && (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); send(`/api/admin/users/${id}/adjust`, { kind: box, amount, reason, request_key: `${id}-${box}-${Date.now()}` }, messages[box](amount)); }}>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" inputMode="decimal" required />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" required />
          <button className="btn" disabled={busy} type="submit">Save</button>
        </form>
      )}
      {box === "ban" && !banned && (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); send(`/api/admin/users/${id}/ban`, { action: "ban", reason }, messages.ban()); }}>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ban reason" required />
          <button className="btn" disabled={busy} type="submit">Ban this user</button>
        </form>
      )}
      {box === "password" && (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); send(`/api/admin/users/${id}/password`, { password }, messages.password()); }}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" required />
          <button className="btn" disabled={busy} type="submit">Update password</button>
        </form>
      )}
    </section>
  );
}

function TeamRows({ rows, start = 0 }) {
  const [shot, setShot] = useState(null);
  return (
    <>
      <div className="table-wrap team-scroll"><table className="team-table"><thead><tr><th>#</th><th>User</th><th>Plan</th><th>Date & Time</th><th></th></tr></thead><tbody>
        {rows.map((m, i) => <tr key={m.id}><td>{start + i + 1}</td><td><b>{m.full_name}</b><div className="team-mail"><EmailLink email={m.email} userId={m.id} /></div></td><td><PlanBadge name={m.plan} color={m.plan_color} text={m.plan_text} /></td><td>{whenText(m.date)}</td><td><button className="view-btn" type="button" onClick={() => setShot(m.screenshot || "")}>View Details</button></td></tr>)}
      </tbody></table></div>
      {shot !== null && (
        <div className="modal-back" onClick={() => setShot(null)}>
          <div className="modal-card shot-only" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="modal-x" type="button" onClick={() => setShot(null)} aria-label="Close">×</button>
            <SlipImage src={shot} />
          </div>
        </div>
      )}
    </>
  );
}

function ProfileTeam({ id, paidCount, unpaidCount }) {
  const [paid, setPaid] = useState("1");
  const data = useLoad(`/api/admin/users/${id}/team?paid=${paid}&page=1`);
  const rows = rowsOf(data);
  return (
    <section className="info-sheet team-sheet">
      <h2 className="sheet-title">Team information</h2>
      <div className="team-split">
        <button type="button" className={paid === "1" ? "on" : ""} onClick={() => setPaid("1")}>
          <span>Paid Users</span>
          <b>{paidCount ?? data?.paid ?? 0}</b>
        </button>
        <button type="button" className={paid === "0" ? "on" : ""} onClick={() => setPaid("0")}>
          <span>Unpaid Users</span>
          <b>{unpaidCount ?? data?.unpaid ?? 0}</b>
        </button>
      </div>
      <TeamRows rows={rows} />
      {data && rows.length === 0 && <p>No {paid === "1" ? "paid" : "unpaid"} team members.</p>}
      <Link className="btn small view-all" to={`/admin/users/${id}/team?paid=${paid}`}>View all team</Link>
    </section>
  );
}

export function UserDetail() {
  const { id } = useParams();
  const data = useLoad(`/api/admin/users/${id}`);
  const [detail, setDetail] = useState(null);
  const [slipsOpen, setSlipsOpen] = useState(false);
  if (!data) return <p>Loading...</p>;
  const openDeposit = (d) => setDetail({ ...paymentDetail({ ...d, full_name: data.user.full_name, email: data.user.email, username: data.user.username, phone: data.user.phone, upliner: data.upliner }, "deposit"), userId: data.user.id, pending: false });
  const profile = data.profile || {};
  const banned = profile.banned || profile.status === "banned";
  const slips = data.deposits || [];
  return (
    <>
      <AdminBack fallback="/admin/users?status=all" label="Back" />
      <h1>User profile</h1>
      <p className="sub">{profile.full_name || data.user.full_name}</p>
      {banned && <div className="ban-banner">Banned account{profile.ban_reason ? ` — ${profile.ban_reason}` : ""}</div>}
      <div className="profile-board">
        <div className="profile-card balance"><span>Current Balance</span><b>Rs {rs(profile.balance || data.user.balance)}</b><em>Wallet</em></div>
        <button type="button" className="profile-card deposits" onClick={() => setSlipsOpen(true)}><span>Current Plan</span><b>Rs {rs(profile.plan_amount || 0)}</b><em>{profile.plan || "No plan"}</em></button>
        <Link className="profile-card withdrawals" to={`/admin/users/${id}/withdrawals`}><span>Total Withdraw</span><b>Rs {rs(profile.withdrawals || 0)}</b><em>History</em></Link>
        <Link className="profile-card tx" to={`/admin/users/${id}/transactions`}><span>Transactions</span><b>{Number(profile.transactions || 0).toLocaleString("en-US")}</b><em>Full history</em></Link>
      </div>
      <ProfileTools id={id} banned={banned} />
      <section className="info-sheet user-sheet">
        <h2 className="sheet-title">User information</h2>
        <div><span>Name</span><b>{profile.full_name || data.user.full_name || "—"}</b></div>
        <div><span>Email</span><b className="break">{profile.email || data.user.email}</b></div>
        <div><span>Mobile number</span><b>{profile.phone || data.user.phone || "—"}</b></div>
        <div><span>Current level</span><b>Level {profile.level ?? data.user.level}</b></div>
        <div><span>Approved team</span><b>{profile.approved_team ?? profile.paid_team ?? 0}</b></div>
        <div><span>Current plan</span><b>{profile.plan || data.user.plan || "No plan"} · Rs {rs(profile.plan_amount || 0)}</b></div>
        <div><span>Account Approved Date</span><b>{profile.approved_at ? whenText(profile.approved_at) : "Approval Date Not Available"}</b></div>
      </section>
      <section className="info-sheet payslip">
        <h2 className="sheet-title">Payment screenshot</h2>
        <div className="profile-slip"><SlipImage src={profile.payment_screenshot || slips[0]?.screenshot} /></div>
      </section>
      <section className="info-sheet upline-sheet">
        <h2 className="sheet-title">Upline information</h2>
        {data.upliner ? (
          <>
            <div><span>Name</span><b>{data.upliner.full_name}</b></div>
            <div><span>Email</span><b><EmailLink email={data.upliner.email} userId={data.upliner.id} /></b></div>
            <div><span>Plan</span><b>{data.upliner.plan || "No plan"} · Level {data.upliner.level}</b></div>
          </>
        ) : <p>This account joined directly.</p>}
      </section>
      <section className="info-sheet slip-sheet" id="user-slips">
        <h2 className="sheet-title">Deposit slip</h2>
        {slips.length === 0 && <p>No deposit yet.</p>}
        {slips.map((d) => (
          <div key={d.id}>
            <span>{d.plan || "Plan"} · Rs {d.amount}</span>
            <b>{d.status} · {d.method || "—"} <button type="button" className="view-btn" onClick={() => openDeposit(d)}>Open slip</button></b>
          </div>
        ))}
      </section>
      <ProfileTeam id={id} paidCount={profile.paid_team} unpaidCount={profile.unpaid_team} />
      {slipsOpen && (
        <div className="modal-back" onClick={() => setSlipsOpen(false)}>
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div><h2>Payment records</h2><p className="sub">Current plan Rs {rs(profile.plan_amount || 0)}</p></div>
              <button className="modal-x" type="button" onClick={() => setSlipsOpen(false)} aria-label="Close">×</button>
            </div>
            {slips.length === 0 && <p>No deposit slip yet.</p>}
            <div className="same-list">
              {slips.map((d) => <button type="button" key={d.id} onClick={() => openDeposit(d)}><b>Rs {d.amount}</b><span>{d.plan || "Plan"} · {d.method || "—"} · {d.sender || "No sender"} · {d.status}</span></button>)}
            </div>
          </div>
        </div>
      )}
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} onAction={() => setDetail(null)} />}
    </>
  );
}

export function UserTransactions() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const day = params.get("date") || "";
  const start = params.get("start") || "";
  const end = params.get("end") || "";
  const q = params.get("q") || "";
  const page = params.get("page") || "1";
  const data = useLoad(`/api/admin/users/${id}/transactions?category=${encodeURIComponent(category)}&date=${encodeURIComponent(day)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&q=${encodeURIComponent(q)}&page=${page}`);
  const rows = rowsOf(data);
  const setQuery = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  };
  const filters = [
    ["", "All"],
    ["overall", "Overall Earnings"],
    ["ads_earn", "Ads Earnings"],
    ["task", "Task Earnings"],
    ["flower", "Flower Earnings"],
    ["bonus", "Bonus Add"],
    ["balance_sub", "Balance Subtract"],
    ["direct", "Direct Referral Commission"],
    ["upgrade_referral", "Referral Commission from Plan Upgrade"],
    ["indirect_1", "Indirect Traffic Commission — Level 1"],
    ["indirect_2", "Indirect Traffic Commission — Level 2"],
  ];
  return (
    <>
      <Link className="back-link" to={`/admin/users/${id}`}>← Profile</Link>
      <h1>Transactions</h1>
      {!data && <p>Loading...</p>}
      <div className="stat"><div className="sub">Filtered total</div><h2>Rs {rs(data?.total || 0)}</h2><span>{Number(data?.count || 0).toLocaleString("en-US")} records</span></div>
      <div className="filters">{filters.map(([value, label]) => <button key={label} type="button" className={category === value ? "chip on" : "chip"} onClick={() => setQuery({ category: value })}>{label}</button>)}</div>
      <SearchBox value={q} placeholder="Search title or related email" onSearch={(value) => setQuery({ q: value })} />
      <div className="filters">
        <input type="date" value={start} aria-label="From date" onChange={(e) => setQuery({ start: e.target.value, date: "" })} />
        <input type="date" value={end} aria-label="To date" onChange={(e) => setQuery({ end: e.target.value, date: "" })} />
        <input type="date" value={day} aria-label="One date" onChange={(e) => setQuery({ date: e.target.value, start: "", end: "" })} />
      </div>
      <div className="table-wrap desktop-table"><table><thead><tr><th>Detail</th><th>Amount</th><th>When</th></tr></thead><tbody>
        {rows.map((t) => <tr key={t.id}><td><b>{t.title}</b><div className="sub">{t.trx_type === "-" ? "Debit" : "Credit"} · {t.remark || "entry"}{t.plan_name && t.remark !== "balance_add" && t.remark !== "signup_bonus" ? ` · ${t.plan_name}` : ""}</div>{t.purpose ? <div className="purpose-tag">Purpose: {t.purpose}</div> : null}<div className="sub">User <EmailLink email={t.user_email} userId={t.user_id} /></div>{t.source_email && <div className="sub">Related <EmailLink email={t.source_email} userId={t.source_user_id} /></div>}</td><td>Rs {t.amount}</td><td>{whenText(t.created_at)}</td></tr>)}
      </tbody></table></div>
      <div className="cards">{rows.map((t) => <div className="lb-card" key={t.id}><b>{t.title}</b><div>Rs {t.amount} · {t.trx_type === "-" ? "Debit" : "Credit"}</div>{t.purpose ? <div className="purpose-tag">Purpose: {t.purpose}</div> : null}<div className="sub">{whenText(t.created_at)}</div><div className="sub"><EmailLink email={t.user_email} userId={t.user_id} /></div>{t.source_email && <div className="sub">Related <EmailLink email={t.source_email} userId={t.source_user_id} /></div>}</div>)}</div>
      {data && rows.length === 0 && <p>No records for this filter.</p>}
      <Pager page={data?.page} pages={data?.pages} onPage={(nextPage) => setQuery({ page: String(nextPage), q, category, date: day, start, end })} />
    </>
  );
}

export function UserWithdrawals() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const start = params.get("start") || "";
  const end = params.get("end") || "";
  const day = params.get("date") || "";
  const page = params.get("page") || "1";
  const data = useLoad(`/api/admin/users/${id}/withdrawals?q=${encodeURIComponent(q)}&start=${start}&end=${end}&date=${day}&page=${page}`);
  const rows = rowsOf(data);
  const setQuery = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  };
  return (
    <>
      <Link className="back-link" to={`/admin/users/${id}`}>← Profile</Link>
      <h1>Withdrawal history</h1>
      <SearchBox value={q} placeholder="Search account number" onSearch={(value) => setQuery({ q: value })} />
      <div className="filters">
        <input type="date" value={start} aria-label="From date" onChange={(e) => setQuery({ start: e.target.value, date: "" })} />
        <input type="date" value={end} aria-label="To date" onChange={(e) => setQuery({ end: e.target.value, date: "" })} />
        <input type="date" value={day} aria-label="One date" onChange={(e) => setQuery({ date: e.target.value, start: "", end: "" })} />
      </div>
      {!data && <p>Loading...</p>}
      <div className="table-wrap desktop-table"><table><thead><tr><th>Amount</th><th>Account</th><th>Status</th><th>Date</th></tr></thead><tbody>
        {rows.map((row) => <tr key={row.id}><td>Rs {row.amount}</td><td>{row.method}<div className="sub">{row.account_name || "—"} · {row.account || "—"}</div></td><td>{row.status}</td><td>{whenText(row.created_at)}</td></tr>)}
      </tbody></table></div>
      <div className="cards">{rows.map((row) => <div className="lb-card" key={row.id}><b>Rs {row.amount}</b><div className="sub">{row.method} · {row.account || "—"}</div><div className="sub">{row.account_name || "No name"} · {row.status}</div><div className="sub">{whenText(row.created_at)}</div></div>)}</div>
      {data && rows.length === 0 && <p>{q ? "No account found" : "No withdrawal for this filter."}</p>}
      <Pager page={data?.page} pages={data?.pages} onPage={(nextPage) => setQuery({ page: String(nextPage), q, start, end, date: day })} />
    </>
  );
}

export function UserTeam() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const paid = params.get("paid") || "";
  const plan = params.get("plan") || "";
  const approved = params.get("approved") || "";
  const rejected = params.get("rejected") || "";
  const page = params.get("page") || "1";
  const data = useLoad(`/api/admin/users/${id}/team?q=${encodeURIComponent(q)}&paid=${paid}&plan=${encodeURIComponent(plan)}&approved=${approved}&rejected=${rejected}&page=${page}`);
  const rows = rowsOf(data);
  const setQuery = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  };
  return (
    <>
      <Link className="back-link" to={`/admin/users/${id}`}>← Profile</Link>
      <h1>Team</h1>
      <div className="team-counts">
        <button type="button" className={paid === "" ? "chip on" : "chip"} onClick={() => setQuery({ paid: "" })}>All {data?.total ?? ""}</button>
        <button type="button" className={paid === "1" ? "chip on" : "chip"} onClick={() => setQuery({ paid: "1" })}>Paid {data?.paid ?? 0}</button>
        <button type="button" className={paid === "0" ? "chip on" : "chip"} onClick={() => setQuery({ paid: "0" })}>Unpaid {data?.unpaid ?? 0}</button>
        {(data?.plans || []).map((item) => <button type="button" key={item.name} className={plan === (item.name === "No plan" ? "none" : item.name) ? "chip on" : "chip"} onClick={() => setQuery({ plan: item.name === "No plan" ? "none" : item.name })}>{item.name} {item.count}</button>)}
      </div>
      <SearchBox value={q} placeholder="Search team email" suggestPath={`/api/admin/users/${id}/team`} onSearch={(value) => setQuery({ q: value })} onPick={(row) => setQuery({ q: row.email })} />
      <div className="filters">
        <label>Approval date <input type="date" value={approved} onChange={(e) => setQuery({ approved: e.target.value })} /></label>
        <label>Rejection date <input type="date" value={rejected} onChange={(e) => setQuery({ rejected: e.target.value })} /></label>
      </div>
      {!data && <p>Loading...</p>}
      <TeamRows rows={rows} start={(Number(data?.page || page) - 1) * 40} />
      {data && rows.length === 0 && <p>{q ? "No account found" : "No team members for this filter."}</p>}
      <Pager page={data?.page} pages={data?.pages} onPage={(nextPage) => setQuery({ page: String(nextPage), q, paid, plan, approved, rejected })} />
    </>
  );
}

export function Leaderboard() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const level = params.get("level") || "";
  const sort = params.get("sort") || "earnings";
  const day = params.get("date") || "";
  const page = params.get("page") || "1";
  const data = useLoad(`/api/admin/leaderboard?q=${encodeURIComponent(q)}&level=${encodeURIComponent(level)}&sort=${encodeURIComponent(sort)}&date=${encodeURIComponent(day)}&page=${page}`);
  const patch = (values) => {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    if (!("page" in values)) next.delete("page");
    setParams(next);
  };
  const rows = data?.rows || [];
  const levels = data?.levels || [];
  return (
    <>
      <h1>Leaderboard</h1>
      <div className="level-board">
        {levels.map((item) => (
          <button type="button" key={item.level} className={String(level) === String(item.level) ? "on" : ""} onClick={() => patch({ level: String(level) === String(item.level) ? "" : item.level })}>
            <span>Level {item.level}</span>
            <b>{item.count}</b>
          </button>
        ))}
      </div>
      <SearchBox value={q} placeholder="Search name or email" onSearch={(value) => patch({ q: value })} />
      <div className="filters leaderboard-filters">
        <select value={level} onChange={(e) => patch({ level: e.target.value })}><option value="">All levels</option>{levels.map((item) => <option key={item.level} value={item.level}>Level {item.level}</option>)}</select>
        <select value={sort} onChange={(e) => patch({ sort: e.target.value })}>
          <option value="earnings">Earning high to low</option>
          <option value="earnings_low">Earning low to high</option>
          <option value="level">Level high to low</option>
          <option value="level_low">Level low to high</option>
        </select>
        <input type="date" value={day} aria-label="Joining date" onChange={(e) => patch({ date: e.target.value })} />
      </div>
      {!data && <p>Loading...</p>}
      <div className="table-wrap leaderboard-table-wrap"><table className="team-table leaderboard-table"><thead><tr><th>#</th><th>User Name & Email</th><th>Approved Team</th><th>Level</th><th>Earnings</th></tr></thead><tbody>
        {rows.map((u) => <tr key={u.id}><td data-label="#"> {u.serial}</td><td data-label="User"><b>{u.full_name}</b><div className="team-mail"><EmailLink email={u.email} userId={u.id} /></div></td><td data-label="Approved Team">{u.active_team}</td><td data-label="Level">Level {u.level}</td><td data-label="Earnings">Rs {u.earnings}</td></tr>)}
      </tbody></table></div>
      {data && rows.length === 0 && <p>No users for this filter.</p>}
      <Pager page={data?.page} pages={data?.pages} onPage={(nextPage) => patch({ page: String(nextPage), q, level, sort, date: day })} />
    </>
  );
}

export function Referrals() {
  const data = useLoad("/api/admin/levels");
  const [form, setForm] = useState(null);
  const [note, setNote] = useState("");
  const toast = useContext(toastContext);
  useEffect(() => { if (data && !form) setForm({ direct_label: data.direct_label || "", level2_label: data.level2_label || "", level3_label: data.level3_label || "", direct_percent: data.direct || "", level2_percent: data.level2 || "", level3_percent: data.level3 || "" }); }, [data]);
  if (!form) return <p>Loading...</p>;
  const save = (e) => { e.preventDefault(); api("/api/admin/levels/save", { method: "POST", body: form }).then(() => { setNote("Saved for future commissions. Older commission records stay unchanged."); toast("Referral rates saved successfully"); }).catch((err) => { setNote(err.message); toast(err.message, "error"); }); };
  return <><h1>Referral Commissions</h1><p className="sub">Current direct {data.direct}% · Level 2 {data.level2}% · Level 3 {data.level3}%. Saving changes future calculations only.</p><form className="stack stat" onSubmit={save}><input value={form.direct_label} onChange={(e) => setForm({ ...form, direct_label: e.target.value })} placeholder="Direct label" /><input value={form.direct_percent} onChange={(e) => setForm({ ...form, direct_percent: e.target.value })} placeholder="Direct percent" /><input value={form.level2_label} onChange={(e) => setForm({ ...form, level2_label: e.target.value })} placeholder="Level 2 label" /><input value={form.level2_percent} onChange={(e) => setForm({ ...form, level2_percent: e.target.value })} placeholder="Level 2 percent" /><input value={form.level3_label} onChange={(e) => setForm({ ...form, level3_label: e.target.value })} placeholder="Level 3 label" /><input value={form.level3_percent} onChange={(e) => setForm({ ...form, level3_percent: e.target.value })} placeholder="Level 3 percent" /><button className="btn">Save future rates</button>{note && <p>{note}</p>}</form></>;
}

function actionMessage(kind, action) {
  if (kind === "withdraw" && action === "approve") return "Withdrawal approved successfully";
  if (kind === "withdraw" && action === "reject") return "Withdrawal rejected successfully";
  if (kind === "upgrade" && action === "approve") return "Upgrade approved successfully";
  if (kind === "upgrade" && action === "reject") return "Upgrade rejected";
  if (action === "approve") return "Account approved successfully";
  if (action === "reject") return "Account rejected";
  return "Saved successfully";
}

function MoneyList({ path, actionPath, kind = "deposit", brief = false }) {
  const [rows, setRows] = useState([]);
  const [ready, setReady] = useState(false);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [plans, setPlans] = useState([]);
  const [detail, setDetail] = useState(null);
  const [params, setParams] = useSearchParams();
  const toast = useContext(toastContext);
  const q = params.get("q") || "";
  const fullPath = path.includes("q=") ? path : `${path}${path.includes("?") ? "&" : "?"}q=${encodeURIComponent(q)}`;
  const refreshCounts = useContext(refreshCountsContext);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((value) => value + 1);
    window.addEventListener("admin-data-refresh", bump);
    return () => window.removeEventListener("admin-data-refresh", bump);
  }, []);
  useEffect(() => {
    let live = true;
    const ctrl = new AbortController();
    setRows([]);
    setReady(false);
    api(fullPath, { signal: ctrl.signal }).then((payload) => {
      if (!live) return;
      const next = rowsOf(payload);
      setRows(next);
      setPlans(payload.plans || []);
      setMeta({ page: payload.page || 1, pages: payload.pages || 1 });
      setReady(true);
    }).catch((err) => {
      if (!live || err.name === "AbortError") return;
      setRows([]);
      setReady(true);
    });
    return () => { live = false; ctrl.abort(); };
  }, [fullPath, tick]);
  const act = (id, action, extra = {}) => {
    let body;
    if (action === "edit") {
      body = new FormData();
      body.append("action", "edit");
      Object.entries(extra).forEach(([key, value]) => {
        if (value !== null && value !== undefined) body.append(key, value);
      });
    } else {
      body = { action, reason: extra.reason || "", pay_commission: extra.pay_commission ? "yes" : "no" };
    }
    return api(`${actionPath}/${id}`, { method: "POST", body }).then(() => {
    if (action === "edit") {
      setDetail(null);
      window.dispatchEvent(new Event("admin-data-refresh"));
      refreshCounts();
      refreshAdmin();
      toast("Payment details updated. The saved plan will be used for approval.");
      return;
    }
    const stay = kind === "deposit" && action === "approve" && detail?.reapprove;
    if (stay) {
      setRows((current) => current.map((row) => row.id === id ? { ...row, status: "approved" } : row));
      setDetail((current) => current && current.id === id ? { ...current, pending: false, reapprove: false, status: "approved", settled: true } : current);
    } else {
      setDetail(null);
    }
    refreshCounts();
    refreshAdmin();
    toast(actionMessage(kind, action));
  }).catch((err) => toast(err.message || "The action could not be saved.", "error"));
  };
  const actions = (row) => row.status === "approved"
    ? <span className="badge" style={{ background: "#d1fae5", color: "#065f46" }}>approved</span>
    : row.status === "rejected"
      ? (kind === "deposit" ? <button className="btn small" onClick={() => act(row.id, "approve")}>Re-Approve</button> : <span className="badge" style={{ background: "#fee2e2", color: "#991b1b" }}>rejected</span>)
      : <div className="row-actions"><button className="btn small" onClick={() => act(row.id, "approve", { pay_commission: kind === "upgrade" && window.confirm("Credit 20% of the additional payment to the direct upliner?") })}>Approve</button><button className="btn ghost small" onClick={() => { const reason = window.prompt("Rejection reason"); if (reason) act(row.id, "reject", { reason }); }}>Reject</button></div>;
  const priorLine = (row) => (kind === "deposit" && row.status === "rejected" ? <div className="sub prior-reason">Previous Rejection Reason: {String(row.reject_reason || "").trim() || "No previous rejection reason available"}</div> : null);
  const who = (row) => <td><Link to={row.user_id ? `/admin/users/${row.user_id}` : "/admin/users"}><b>{row.full_name}</b></Link><div className="sub"><EmailLink email={row.email} userId={row.user_id} /></div>{row.upliner && <div className="sub">Upliner: <EmailLink email={row.upliner.email} userId={row.upliner.id} /></div>}{priorLine(row)}</td>;
  const showRowActions = (row) => !(kind === "deposit" && (row.status === "pending" || row.status === "rejected"));
  const openRow = (row) => {
    if (kind === "withdraw") {
      const base = {
        id: row.id,
        title: "Withdraw request",
        compact: true,
        kind: "withdraw",
        pending: row.status === "pending",
        reapprove: false,
        status: row.status,
        userId: row.user_id,
        date: row.created_at ? new Date(row.created_at).toLocaleString() : "—",
        teamCount: "…",
        team: null,
        plan: "…",
        joined: "…",
        loading: true,
        name: row.full_name || "—",
        email: row.email,
        phone: row.phone || "—",
        referral: null,
        method: row.method || "—",
        accountName: row.account_name || "—",
        accountNumber: row.account || "—",
        amount: `Rs ${rs(row.amount)}`,
        rejectReason: row.admin_remark || "",
      };
      setDetail(base);
      api(`/api/admin/withdrawals/${row.id}`).then((extra) => {
        setDetail((current) => (current && current.id === row.id ? {
          ...base,
          loading: false,
          teamCount: String(extra.team?.approved ?? extra.team?.total ?? 0),
          team: extra.team || null,
          plan: extra.plan || extra.account?.plan || "No plan",
          joined: extra.joined ? whenText(extra.joined) : "—",
          phone: extra.account?.phone || base.phone,
          referral: extra.upliner ? { id: extra.upliner.id, name: extra.upliner.full_name, email: extra.upliner.email } : null,
        } : current));
      }).catch(() => setDetail((current) => (current && current.id === row.id ? { ...base, loading: false, teamCount: "—" } : current)));
      return;
    }
    const base = paymentDetail(row, kind, { brief });
    setDetail({
      ...base,
      plans: kind === "deposit" ? plans : [],
      userId: row.user_id,
      review: kind !== "upgrade",
      upliner: row.upliner || null,
      loading: Boolean(row.user_id),
    });
    const extraJob = Promise.resolve(null);
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
      setDetail((current) => (current && current.id === row.id ? { ...current, fields, review: kind !== "upgrade", loading: false, account, upliner, team, userPack } : current));
    }).catch(() => setDetail((current) => (current && current.id === row.id ? { ...current, review: kind !== "upgrade", loading: false } : current)));
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
          <tr key={row.id}>{who(row)}<td>{row.plan || "—"}</td><td>Rs {row.amount}</td><td>{row.method || "—"}</td><td>{row.sender || "—"}</td><td><button className="view-btn" type="button" onClick={() => openRow(row)}>{row.status === "rejected" ? "Open Details" : "View Details"}</button></td><td>{showRowActions(row) ? actions(row) : null}</td></tr>
        ))}</tbody>
      </table></div>
      <div className="cards">{rows.map((row) => (
        <div className="lb-card" key={row.id}>
          <b>{row.full_name}</b>
          <div className="sub"><EmailLink email={row.email} userId={row.user_id} /></div>
          {row.upliner && <div className="sub">Upliner: {row.upliner.full_name}</div>}
          <div className="sub">{kind === "upgrade" ? `${row.from_plan} → ${row.to_plan}` : (row.plan || row.method)} · Rs {row.amount}{row.sender ? ` · ${row.sender}` : ""}{row.account_name ? ` · ${row.account_name}` : ""}{row.account ? ` · ${row.account}` : ""}</div>
          {priorLine(row)}
          <button className="view-btn" type="button" onClick={() => openRow(row)}>{kind === "deposit" && row.status === "rejected" ? "Open Details" : "View Details"}</button>
          {showRowActions(row) ? actions(row) : null}
        </div>
      ))}</div>
      {!ready && <p>Loading...</p>}
      {ready && rows.length === 0 && <p className="empty">{q ? "No account found" : "Nothing waiting in this list."}</p>}
      <Pager page={meta.page} pages={meta.pages} onPage={(nextPage) => { const next = new URLSearchParams(params); next.set("page", String(nextPage)); setParams(next); }} />
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} onAction={act} />}
    </>
  );
}

function QueueFilters({ param = "slip", suggest, afterSearch }) {
  const [params, setParams] = useSearchParams();
  const status = params.get(param) || "pending";
  const q = params.get("q") || "";
  const commit = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("q", value); else next.delete("q");
    next.delete("page");
    setParams(next);
  };
  return (
    <>
      <SearchBox value={q} placeholder="Search by full email" suggestPath={suggest} onSearch={commit} onPick={(row) => commit(row.email)} />
      {afterSearch}
      <div className="filters">
        {[["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["all", "All"]].map(([value, label]) => (
          <button key={value} type="button" className={status === value ? "chip on" : "chip"} onClick={() => { const next = new URLSearchParams(params); next.set(param, value); next.delete("page"); setParams(next); }}>{label}</button>
        ))}
      </div>
    </>
  );
}

export function Deposits() {
  const [params] = useSearchParams();
  const status = params.get("slip") || "pending";
  const page = params.get("page") || "1";
  const today = params.get("today") === "1" ? "&today=1" : "";
  return <><h1>{today ? "Today Received Balance" : "New user Request"}</h1><QueueFilters suggest={`/api/admin/deposits?status=${status}${today}`} /><MoneyList brief={status === "pending" || status === "rejected"} path={`/api/admin/deposits?status=${status}${today}&page=${page}`} actionPath="/api/admin/deposits" /></>;
}
export function TodayUsers() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const day = params.get("date") || "";
  const plan = params.get("plan") || "";
  const patch = (values) => {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    setParams(next);
  };
  const [data, setData] = useState(null);
  const [detail, setDetail] = useState(null);
  useEffect(() => {
    let live = true;
    const ctrl = new AbortController();
    api(`/api/admin/today-approved?q=${encodeURIComponent(q)}&date=${day}&plan=${encodeURIComponent(plan)}`, { signal: ctrl.signal }).then((next) => { if (live) setData(next); }).catch(() => { if (live) setData(null); });
    return () => { live = false; ctrl.abort(); };
  }, [q, day, plan]);
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
      <SearchBox value={q} placeholder="Search by full email" suggestPath="/api/admin/users?status=approved" onSearch={(value) => patch({ q: value })} onPick={(row) => patch({ q: row.email })} />
      <div className="filters">
        <input type="date" value={day || data.date || ""} onChange={(e) => patch({ date: e.target.value })} />
        <select value={plan} onChange={(e) => patch({ plan: e.target.value })}><option value="">All plans</option>{["Basic", "Gold", "Standard", "Premium", "Super Premium"].map((name) => <option key={name}>{name}</option>)}</select>
      </div>
      <div className="table-wrap"><table><tbody>{(data.rows || []).map((row) => <tr key={row.id}><td><Link to={`/admin/users/${row.user_id}`}><b>{row.full_name}</b></Link><div className="sub"><EmailLink email={row.email} userId={row.user_id} /></div></td><td>{row.plan}<div className="sub">Rs {row.amount}</div><div className="sub">Submitted {String(row.created_at || "").slice(0, 10)}</div></td><td><button className="view-btn" type="button" onClick={() => setDetail({ ...paymentDetail({ ...row, status: "approved" }, "deposit"), userId: row.user_id, pending: false })}>View detail</button></td></tr>)}</tbody></table></div>
      {(data.rows || []).length === 0 && <p>{q ? "No account found" : "0 users for this filter."}</p>}
      {detail && <DetailModal detail={{ ...detail, pending: false }} onClose={() => setDetail(null)} onAction={() => setDetail(null)} />}
    </>
  );
}
export function Withdrawals() {
  const [params] = useSearchParams();
  const status = params.get("wstatus") || "pending";
  const page = params.get("page") || "1";
  const totals = useLoad("/api/admin/withdrawals/summary");
  const titles = { pending: "Withdrawal Request", approved: "All Approved Withdraw", rejected: "Rejected Withdrawals", all: "All Withdrawals" };
  return <><h1>{titles[status] || "Withdrawal Request"}</h1><div className="stats withdraw-summary"><div className="stat tone-amber"><div className="sub">Pending Withdraw</div><h2>Rs {rs(totals?.pending || 0)}</h2><span>Waiting for approval</span></div><div className="stat tone-rose"><div className="sub">Rejected Withdraw</div><h2>Rs {rs(totals?.rejected || 0)}</h2><span>Rejected requests only</span></div></div><QueueFilters param="wstatus" suggest={`/api/admin/withdrawals?status=${status}`} /><MoneyList kind="withdraw" path={`/api/admin/withdrawals?status=${status}&page=${page}`} actionPath="/api/admin/withdrawals" /></>;
}
export function TodayWithdrawals() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const day = params.get("date") || "";
  const page = params.get("page") || "1";
  const commit = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("q", value); else next.delete("q");
    next.delete("page");
    setParams(next);
  };
  return <><h1>Today approved Withdrawal</h1><SearchBox value={q} placeholder="Search by full email or account number" suggestPath="/api/admin/withdrawals?status=approved" onSearch={commit} onPick={(row) => commit(row.email)} /><div className="filters"><input type="date" value={day} onChange={(e) => { const next = new URLSearchParams(params); if (e.target.value) next.set("date", e.target.value); else next.delete("date"); setParams(next); }} /></div><MoneyList kind="withdraw" path={`/api/admin/withdrawals?status=approved&today=1&date=${day}&page=${page}`} actionPath="/api/admin/withdrawals" /></>;
}
export function Rejected() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const day = params.get("date") || "";
  const plan = params.get("plan") || "";
  const page = params.get("page") || "1";
  const patch = (values) => {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    if (!("page" in values)) next.delete("page");
    setParams(next);
  };
  return <><h1>Rejected User</h1><SearchBox value={q} placeholder="Search by full email" suggestPath="/api/admin/deposits?status=rejected" onSearch={(value) => patch({ q: value })} onPick={(row) => patch({ q: row.email })} /><div className="filters"><input type="date" value={day} aria-label="Rejection date" onChange={(e) => patch({ date: e.target.value })} /><select value={plan} onChange={(e) => patch({ plan: e.target.value })}><option value="">All plans</option>{["Basic", "Gold", "Standard", "Premium", "Super Premium"].map((name) => <option key={name}>{name}</option>)}</select></div><MoneyList brief kind="deposit" path={`/api/admin/deposits?status=rejected&date=${day}&plan=${encodeURIComponent(plan)}&page=${page}`} actionPath="/api/admin/deposits" /></>;
}
export function Upgrades() {
  const [params, setParams] = useSearchParams();
  const day = params.get("date") || "";
  const board = useLoad(`/api/admin/upgrade-board?date=${encodeURIComponent(day || "today")}`);
  const status = params.get("ustatus") || "pending";
  const page = params.get("page") || "1";
  const label = board?.date || day || "today";
  const setDay = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("date", value); else next.delete("date");
    next.delete("page");
    setParams(next);
  };
  return <>
    <h1>Plan Upgrade</h1>
    <div className="stats">
      <div className="stat"><div className="sub">Receive Balance · {label}</div><h2>Rs {board?.today_receive || "0.00"}</h2></div>
      <div className="stat"><div className="sub">Pending · {label}</div><h2>{board?.pending || 0}</h2></div>
      <div className="stat"><div className="sub">Approved · {label}</div><h2>{board?.approved || 0}</h2></div>
      <div className="stat"><div className="sub">Rejected · {label}</div><h2>{board?.rejected || 0}</h2></div>
      <div className="stat"><div className="sub">Pending · All Records</div><h2>{board?.all_pending || 0}</h2></div>
      <div className="stat"><div className="sub">Approved · All Records</div><h2>{board?.all_approved || 0}</h2></div>
      <div className="stat"><div className="sub">Rejected · All Records</div><h2>{board?.all_rejected || 0}</h2></div>
    </div>
    <p className="sub">Receive balance includes approved upgrade payments only. {board?.commission_base}</p>
    <QueueFilters
      param="ustatus"
      suggest={`/api/admin/upgrades?status=${status}&date=${encodeURIComponent(day || board?.date || "")}`}
      afterSearch={<div className="filters upgrade-date-filter"><label>Date Filter <input type="date" value={day || board?.date || ""} onChange={(e) => setDay(e.target.value)} /></label><button className="btn small" type="button" onClick={() => setDay("")}>Today</button></div>}
    />
    <MoneyList kind="upgrade" path={`/api/admin/upgrades?status=${status}&date=${encodeURIComponent(day || board?.date || "")}&page=${page}`} actionPath="/api/admin/upgrades" />
  </>;
}
export function Gateways() {
  const toast = useContext(toastContext);
  const [rows, setRows] = useState([]);
  const [note, setNote] = useState("");
  const load = () => api("/api/admin/gateways").then((data) => {
    setRows((data || []).map((row) => ({ ...row, key: String(row.id) })));
  });
  useEffect(() => { load(); }, []);
  const update = (key, field, value) => setRows((current) => current.map((row) => row.key === key ? { ...row, [field]: value } : row));
  const add = (name) => setRows((current) => [...current, { key: `new-${name || "method"}-${Date.now()}`, name, account_name: "", account_number: "", active: true }]);
  const save = async (row) => {
    setNote("");
    try {
      const body = new FormData();
      if (row.id) body.append("id", row.id);
      body.append("name", row.name);
      body.append("account_name", row.account_name || "");
      body.append("account_number", row.account_number || "");
      body.append("instructions", row.instructions || "");
      body.append("active", row.active === false ? "0" : "1");
      if (row.imageFile) body.append("image", row.imageFile);
      await api("/api/admin/gateways", { method: "POST", body });
      setNote(`${row.name} saved. Every enabled account is shown on the user payment page.`);
      toast(`${row.name} saved successfully`);
      load();
    } catch (err) {
      setNote(err.message);
      toast(err.message, "error");
    }
  };
  const remove = async (row) => {
    if (!row.id) {
      setRows((current) => current.filter((item) => item.key !== row.key));
      return;
    }
    if (!window.confirm(`Remove this ${row.name} account from the user payment page?`)) return;
    const body = new FormData();
    body.append("id", row.id);
    body.append("delete", "1");
    await api("/api/admin/gateways", { method: "POST", body });
    setNote(`${row.name} removed.`);
    load();
  };
  return (
    <>
      <h1>Payment methods</h1>
      <p className="sub">Every enabled method name is a choice on the user withdrawal page. Add JazzCash, Easypaisa, and any other method. An account number also shows that account on the deposit page.</p>
      <div className="row-actions">
        <button className="btn small" type="button" onClick={() => add("JazzCash")}>Add JazzCash</button>
        <button className="btn small" type="button" onClick={() => add("Easypaisa")}>Add Easypaisa</button>
        <button className="btn small" type="button" onClick={() => add("")}>Add method</button>
      </div>
      <div className="stats">{rows.map((row) => (
        <form className="stat" key={row.key} onSubmit={(e) => { e.preventDefault(); save(row); }}>
          <b>{row.name}{row.account_number ? ` · ${row.account_number}` : ""}</b>
          <input placeholder="Method name" value={row.name || ""} onChange={(e) => update(row.key, "name", e.target.value)} />
          <input placeholder="Account title" value={row.account_name || ""} onChange={(e) => update(row.key, "account_name", e.target.value)} />
          <input placeholder="Account number" value={row.account_number || ""} onChange={(e) => update(row.key, "account_number", e.target.value)} />
          <textarea rows="4" placeholder="Instructions shown on the user deposit page" value={row.instructions || ""} onChange={(e) => update(row.key, "instructions", e.target.value)} />
          <label><input type="checkbox" checked={row.active !== false} onChange={(e) => update(row.key, "active", e.target.checked)} /> Show in withdrawal options</label>
          <input type="file" accept="image/*" onChange={(e) => update(row.key, "imageFile", e.target.files[0])} />
          {row.image && <img src={row.image} alt="" width="42" height="42" />}
          <div className="row-actions">
            <button className="btn" type="submit">Save</button>
            <button className="btn ghost" type="button" onClick={() => remove(row)}>Remove</button>
          </div>
        </form>
      ))}</div>
      {rows.length === 0 && <p>No payment account yet. Add JazzCash or Easypaisa above.</p>}
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
    userId: t.user_id,
    sourceUserId: t.source_user_id,
    fields: [["User", t.user_name], ["Email", t.user_email], ["From", t.source_email || "—"], ["Plan", t.plan_name || "—"], ["Purpose", t.purpose || "—"], ["Amount", `Rs ${t.amount}`], ["Date", whenText(t.created_at)]],
  });
  if (!data) return <p>Loading...</p>;
  const picked = day === "today" ? (data.date || "") : day;
  return (
    <>
      <h1>{titles[category] || "Transactions"}</h1>
      <p className="sub">{picked ? `Showing ${picked}. This total uses the same records as the dashboard for that date.` : "All dates. This total matches the dashboard overall figure for this source."}</p>
      <div className="stat"><div className="sub">{picked ? "Selected date total" : "Overall total"}</div><h2>Rs {rs(data.total || 0)}</h2><span>{Number(data.count || rows.length).toLocaleString("en-US")} records</span></div>
      <SearchBox value={q} placeholder="Search by full email" suggestPath="/api/admin/users?status=all" onSearch={(value) => setQuery({ q: value })} onPick={(row) => setQuery({ q: row.email })} />
      <div className="filters">
        <select value={category} onChange={(e) => setQuery({ category: e.target.value })}>
          <option value="">All</option>
          <option value="overall">Overall Earnings</option>
          <option value="ads">Task Earnings</option>
          <option value="ads_earn">Ads Earnings</option>
          <option value="flower">Flower Earnings</option>
          <option value="manual_add">Balance Add</option>
          <option value="manual_sub">Balance Subtract</option>
          <option value="direct_traffic">Direct Referral Commission</option>
          <option value="upgrade_referral">Referral Commission from Plan Upgrade</option>
          <option value="indirect_1">Indirect Traffic Commission — Level 1</option>
          <option value="indirect_2">Indirect Traffic Commission — Level 2</option>
          <option value="referral">Referral Commissions</option>
          <option value="withdraw">Withdraw</option>
        </select>
        <input type="date" value={picked} onChange={(e) => setQuery({ date: e.target.value })} />
        <button className="btn small" type="button" onClick={() => setQuery({ date: "" })}>All dates</button>
      </div>
      <div className="table-wrap desktop-table"><table><tbody>{rows.map((t) => <tr key={t.id}><td><Link to={t.user_id ? `/admin/users/${t.user_id}` : "/admin/users"}><b>{t.user_name}</b></Link><div className="sub"><EmailLink email={t.user_email} userId={t.user_id} /></div><div className="sub">{t.title}</div>{category === "manual_add" || t.purpose ? <div className="purpose-tag">Purpose: {t.purpose || "No purpose entered"}</div> : null}{t.source_email && <div className="sub">Related <EmailLink email={t.source_email} userId={t.source_user_id} /></div>}<div className="sub">{whenText(t.created_at)}</div></td><td><b className="money-hot">Rs {t.amount}</b></td><td><button className="view-btn" type="button" onClick={() => open(t)}>View</button></td></tr>)}</tbody></table></div>
      <div className="cards">{rows.map((t) => <div className="lb-card" key={t.id}><Link to={t.user_id ? `/admin/users/${t.user_id}` : "/admin/users"}><b>{t.user_name}</b></Link><div className="sub"><EmailLink email={t.user_email} userId={t.user_id} /></div><div className="sub">{t.title}</div>{category === "manual_add" || t.purpose ? <div className="purpose-tag">Purpose: {t.purpose || "No purpose entered"}</div> : null}{t.source_email && <div className="sub">Related <EmailLink email={t.source_email} userId={t.source_user_id} /></div>}<div className="sub">{whenText(t.created_at)}</div><b className="money-hot">Rs {t.amount}</b><button className="view-btn" type="button" onClick={() => open(t)}>View</button></div>)}</div>
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
  const toast = useContext(toastContext);
  const [notice, setNotice] = useState("");
  useEffect(() => { api("/api/admin/settings").then((d) => setNotice(d.notice)); }, []);
  return <><h1>General Setting</h1><textarea rows="5" value={notice} onChange={(e) => setNotice(e.target.value)} /><button className="btn" style={{ marginTop: 10, maxWidth: 220 }} onClick={() => api("/api/admin/settings", { method: "POST", body: { notice } }).then(() => toast("Notice saved successfully")).catch((err) => toast(err.message, "error"))}>Save notice</button></>;
}
export function Channels() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ title: "", purpose: "", link: "https://flowerblom.com", description: "" });
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
    const description = window.prompt("Channel description", channel.description || "") || "";
    const link = window.prompt("Channel link", channel.link) || channel.link;
    const body = new FormData();
    body.append("title", title);
    body.append("purpose", purpose);
    body.append("description", description);
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
  return <>
    <h1>Official Channels</h1>
    <form onSubmit={submit} className="stat channel-admin-form">
      <input placeholder="Channel title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      <input placeholder="Channel purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
      <textarea placeholder="Channel description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input placeholder="Channel link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} required />
      <label>Channel icon<input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label>
      <button className="btn" style={{ marginTop: 8 }}>Add channel</button>
    </form>
    <div className="stats channel-admin-cards" style={{ marginTop: 16 }}>{rows.map((c) => <div className="stat" key={c.id}>
      {c.image && <img src={c.image} alt={`${c.title} icon`} width="48" height="48" className="channel-admin-icon" onClick={() => setShot(c.image)} />}
      <b>{c.title}</b><div className="sub">{c.purpose}</div><p>{c.description}</p>
      <a href={c.link} target="_blank" rel="noreferrer">{c.link}</a>
      <label>Replace icon<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const body = new FormData();
        body.append("image", file);
        try { await api(`/api/admin/channels/${c.id}`, { method: "POST", body }); toast("Channel icon updated"); load(); }
        catch (err) { toast(err.message, "error"); }
        finally { event.target.value = ""; }
      }} /></label>
      <div className="row-actions"><button className="btn small" type="button" onClick={() => edit(c)}>Edit</button><button className="btn ghost small" type="button" onClick={() => remove(c)}>Delete</button></div>
    </div>)}</div>
    {shot && <DetailModal detail={{ title: "Channel picture", image: shot, fields: [] }} onClose={() => setShot("")} onAction={() => setShot("")} />}
  </>;
}
export function Contacts() {
  const toast = useContext(toastContext);
  const empty = { name: "", instructions: "", purpose: "", whatsapp: "", botim: "" };
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [icons, setIcons] = useState({ whatsapp_icon: null, botim_icon: null });
  const load = () => api("/api/admin/contacts").then(setRows);
  useEffect(() => { load(); }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      Object.entries(icons).forEach(([key, file]) => { if (file) body.append(key, file); });
      await api("/api/admin/contacts/save", { method: "POST", body });
      toast(form.id ? "Leader updated successfully" : "Leader added successfully");
      setForm(empty);
      setIcons({ whatsapp_icon: null, botim_icon: null });
      load();
    } catch (err) {
      toast(err.message || "Could not save this leader.", "error");
    }
  };
  const edit = (row) => {
    setForm({
      id: row.id,
      name: row.name || "",
      instructions: row.note || "",
      purpose: row.purpose || row.role || "",
      whatsapp: row.whatsapp || "",
      botim: row.botim || "",
    });
    setIcons({ whatsapp_icon: null, botim_icon: null });
  };
  return <>
    <h1>Contact Us</h1>
    <form className="stack stat contact-admin-form" onSubmit={save}>
      <input placeholder="Admin name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <input placeholder="Admin purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
      <input placeholder="Instructions" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
      <label>WhatsApp number<input placeholder="WhatsApp number" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></label>
      <label>WhatsApp icon<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setIcons({ ...icons, whatsapp_icon: e.target.files[0] || null })} /></label>
      <label>Botim number<input placeholder="Botim number" value={form.botim} onChange={(e) => setForm({ ...form, botim: e.target.value })} /></label>
      <label>Botim icon<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setIcons({ ...icons, botim_icon: e.target.files[0] || null })} /></label>
      <div className="row-actions">
        <button className="btn">{form.id ? "Update admin" : "Add admin"}</button>
        {form.id && <button className="btn ghost" type="button" onClick={() => { setForm(empty); setIcons({ whatsapp_icon: null, botim_icon: null }); }}>Cancel</button>}
      </div>
    </form>
    <div className="stats contact-admin-cards">{rows.map((c) => <div className="stat" key={c.id}>
      <b>{c.name}</b>
      {c.whatsapp && <div className="contact-admin-method">{c.whatsapp_icon && <img src={c.whatsapp_icon} alt="" />}WhatsApp · {c.whatsapp}</div>}
      {c.botim && <div className="contact-admin-method">{c.botim_icon && <img src={c.botim_icon} alt="" />}Botim · {c.botim}</div>}
      <div className="sub">{c.purpose || c.role}</div><div className="sub">{c.note}</div>
      <div className="row-actions">
        <button className="btn small" type="button" onClick={() => edit(c)}>Edit</button>
        <button className="btn ghost small" type="button" onClick={async () => { if (window.confirm(`Delete ${c.name}?`)) { try { await api("/api/admin/contacts/save", { method: "POST", body: { id: c.id, delete: "1" } }); toast("Leader removed successfully"); load(); } catch (err) { toast(err.message, "error"); } } }}>Delete</button>
      </div>
    </div>)}</div>
  </>;
}
export function Levels() {
  const data = useLoad("/api/admin/levels");
  const [form, setForm] = useState(null);
  const [note, setNote] = useState("");
  const toast = useContext(toastContext);
  useEffect(() => { if (data && !form) setForm({ direct_percent: data.direct || "", level2_percent: data.level2 || "", level3_percent: data.level3 || "" }); }, [data]);
  if (!form) return <p>Loading...</p>;
  return <><h1>Levels Setting</h1><p className="sub">Current direct {data.direct}% · Level 2 {data.level2}% · Level 3 {data.level3}%. New percentages apply to future eligible calculations.</p><form className="stack stat" onSubmit={(e) => { e.preventDefault(); api("/api/admin/levels/save", { method: "POST", body: form }).then(() => { setNote("Saved."); toast("Level percentages saved successfully"); }).catch((err) => { setNote(err.message); toast(err.message, "error"); }); }}><label>Direct traffic commission <input value={form.direct_percent} onChange={(e) => setForm({ ...form, direct_percent: e.target.value })} /></label><label>Indirect commission – Level 2 <input value={form.level2_percent} onChange={(e) => setForm({ ...form, level2_percent: e.target.value })} /></label><label>Indirect commission – Level 3 <input value={form.level3_percent} onChange={(e) => setForm({ ...form, level3_percent: e.target.value })} /></label><button className="btn">Save future percentages</button>{note && <p>{note}</p>}</form></>;
}
export function AdminAccount() {
  const toast = useContext(toastContext);
  const [email, setEmail] = useState("");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [sessions, setSessions] = useState([]);
  const [note, setNote] = useState("");
  const load = () => { api("/api/admin/account").then((d) => setEmail(d.email)); api("/api/admin/sessions").then(setSessions); };
  useEffect(() => { load(); }, []);
  return <><h1>Admin account</h1><form className="stack stat" onSubmit={async (e) => { e.preventDefault(); try { await api("/api/admin/account", { method: "POST", body: { email, current_password: current, new_password: next } }); setNote("Saved."); setCurrent(""); setNext(""); toast("Admin account saved successfully"); } catch (err) { setNote(err.message); toast(err.message, "error"); } }}><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" /><input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" required /><input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password, optional" /><button className="btn">Save account</button>{note && <p>{note}</p>}</form><h2>Active sessions</h2>{sessions.map((row) => <div className="stat" key={row.key}><b>{row.email}</b><div>{row.device} · {row.browser}</div><div className="sub">Login {new Date(row.login_time).toLocaleString()}</div><div className="sub">Last activity {row.last_seen ? new Date(row.last_seen).toLocaleString() : "—"}</div>{row.revoked ? <span>Revoked</span> : <button className="btn ghost small" type="button" onClick={async () => { await api("/api/admin/sessions", { method: "POST", body: { key: row.key } }); load(); }}>Revoke</button>}</div>)}</>;
}
export function Rewards() {
  const data = useLoad("/api/admin/rewards");
  return <><h1>Rewards</h1>{(data || []).map((r) => <div className="stat" key={r.id}><b>{r.title}</b><div>{r.required_team} team · {r.prize}</div></div>)}</>;
}
