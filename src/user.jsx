import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { api, clearSession, LOGO, savedUser } from "./api";

function useLoad(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const reload = () => api(path).then(setData).catch((e) => setError(e.message));
  useEffect(() => { reload(); }, [path]);
  return { data, error, reload };
}

const userNav = [
  ["/app", "earnings", "Dashboard"],
  ["/app/plans", "plan", "Buy a plan"],
  ["/app/work", "task", "Work"],
  ["/app/wallet", "wallet", "Wallet"],
  ["/app/transactions", "ads", "Transactions"],
  ["/app/team", "team", "Team"],
  ["/app/rewards", "level", "Levels & Rewards"],
  ["/app/channels", "ads", "Official Channels"],
  ["/app/withdraw", "withdraw", "Withdraw"],
  ["/app/contact", "direct", "Contact Us"],
];

function WalletGlyph({ name }) {
  const paths = {
    home: "M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z",
    bell: "M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 19a2 2 0 0 0 4 0",
    user: "M12 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 12 12zM6.2 19.2a5.8 5.8 0 0 1 11.6 0",
    caret: "M7 10l5 5 5-5",
    check: "M6.5 12.5 10 16l7.5-8",
    clock: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
    x: "M8 8l8 8M16 8l-8 8",
    people: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 11.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8zM3.5 19a5.5 5.5 0 0 1 11 0M14.2 19a4.2 4.2 0 0 1 6.3-3.6",
    sprout: "M12 21V11M12 11c0-4 3.2-6.2 6.5-6.2C17.2 9 14.8 11 12 11zM12 14c0-3-2.6-5.2-5.4-5.2C7.6 12 9.6 14 12 14z",
    plus: "M12 6v12M6 12h12",
    up: "M12 19V6M7 11l5-5 5 5",
    list: "M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function pageInfo(pathname) {
  const pages = [
    ["/app/plans", "Buy a plan", "Plans"],
    ["/app/deposit", "Deposit", "Deposit"],
    ["/app/work", "Work", "Work"],
    ["/app/wallet", "My Wallet", "My Wallet"],
    ["/app/transactions", "History", "Transactions"],
    ["/app/team", "Team", "Team"],
    ["/app/rewards", "Levels & Rewards", "Rewards"],
    ["/app/channels", "Official Channels", "Channels"],
    ["/app/withdraw", "Withdraw", "Withdraw"],
    ["/app/contact", "Contact Us", "Contact"],
  ];
  const hit = pages.find(([path]) => pathname === path);
  return hit ? { title: hit[1], crumb: hit[2] } : { title: "Dashboard", crumb: "Dashboard" };
}

function moneyText(value, digits = 2) {
  const n = Number(String(value ?? "0").replace(/,/g, ""));
  if (!Number.isFinite(n)) return digits ? "0.00" : "0";
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function moneyCompact(value) {
  const n = Number(String(value ?? "0").replace(/,/g, ""));
  if (!Number.isFinite(n)) return "0";
  if (Math.abs(n - Math.round(n)) < 0.001) return Math.round(n).toLocaleString("en-US");
  return moneyText(n);
}

export function UserShell({ children }) {
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const [profile, setProfile] = useState(false);
  const [notice, setNotice] = useState("");
  const location = useLocation();
  const meta = pageInfo(location.pathname);
  const session = savedUser();
  useEffect(() => { setOpen(false); setBell(false); setProfile(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    api("/api/user/home").then((data) => setNotice(data.notice || "")).catch(() => {});
  }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setOpen(false); setBell(false); setProfile(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const popOpen = bell || profile;
  return (
    <div className="phone">
      {popOpen && <button className="pop-back" aria-label="Close" onClick={() => { setBell(false); setProfile(false); }} />}
      <header className="user-bar">
        <button className="burger" aria-label="Open menu" onClick={() => setOpen(true)}>
          <span /><span /><span />
        </button>
        <div className="bar-title">
          <b>{meta.title}</b>
          <div className="crumb">
            <Link to="/app" aria-label="Home"><WalletGlyph name="home" /></Link>
            <span>/</span>
            <em>{meta.crumb}</em>
          </div>
        </div>
        <div className="bar-actions">
          <button className="icon-btn" aria-label="Notices" aria-expanded={bell} onClick={() => { setBell((v) => !v); setProfile(false); }}>
            <WalletGlyph name="bell" />
            {notice ? <i className="dot" /> : null}
          </button>
          {bell && (
            <div className="pop notice-pop">
              <b>Notices</b>
              <p>{notice || "You're all caught up."}</p>
            </div>
          )}
          <button className="profile-btn" aria-label="Account menu" aria-expanded={profile} onClick={() => { setProfile((v) => !v); setBell(false); }}>
            <WalletGlyph name="user" />
            <WalletGlyph name="caret" />
          </button>
          {profile && (
            <div className="pop profile-pop">
              <b>{session?.full_name || "Your account"}</b>
              <p>{session?.email || ""}</p>
              <Link to="/app/wallet">My Wallet</Link>
              <Link to="/app">Dashboard</Link>
              <button type="button" onClick={() => { clearSession(); window.location.href = "/login"; }}>Logout</button>
            </div>
          )}
        </div>
      </header>
      <button className={open ? "drawer-backdrop on" : "drawer-backdrop"} aria-label="Close menu" onClick={() => setOpen(false)} />
      <aside className={open ? "drawer on" : "drawer"}>
        <div className="drawer-head">
          <img src={LOGO} alt="" />
          <div><b>Flower</b><div className="sub">Your menu</div></div>
          <button className="burger" aria-label="Close menu" onClick={() => setOpen(false)}><span /><span /></button>
        </div>
        {userNav.map(([to, icon, label], index) => (
          <NavLink key={to} to={to} end={to === "/app"} className={to === "/app/plans" ? "plan-link" : undefined} style={{ animationDelay: `${index * 40}ms` }}>
            <span className="icon"><DashIcon name={icon} /></span>
            {label}
          </NavLink>
        ))}
        <button className="btn ghost" onClick={() => { clearSession(); window.location.href = "/login"; }}>Logout</button>
      </aside>
      <div className="user-body">{children}</div>
      <nav className="dock">
        <NavLink to="/app" end>Home</NavLink>
        <NavLink to="/app/plans">Plans</NavLink>
        <NavLink to="/app/wallet">Wallet</NavLink>
        <button type="button" onClick={() => setOpen(true)}>Menu</button>
      </nav>
    </div>
  );
}

export function Back({ to = "/app", label = "Dashboard" }) {
  return <div className="topbar"><Link to={to}>← {label}</Link></div>;
}

function DashIcon({ name }) {
  const paths = {
    wallet: "M4 8h16v10H4zM4 8l2-3h12l2 3M8 13h4",
    earnings: "M4 16l5-5 3 3 8-8M14 6h6v6",
    direct: "M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0",
    indirect: "M8 11a3 3 0 100-6 3 3 0 000 6zM16 11a3 3 0 100-6 3 3 0 000 6zM3 19a5 5 0 015-4M16 15a5 5 0 015 4M9 19a4 4 0 016 0",
    ads: "M5 8h9v8H5zM14 10l5-2v8l-5-2",
    team: "M8 11a3 3 0 100-6 3 3 0 000 6zM16 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3 19a5 5 0 0110 0M14 19a4 4 0 017 0",
    level: "M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16l-4.9 2.2.9-5.5-4-3.9 5.5-.8z",
    plan: "M6 4h12v16H6zM9 8h6M9 12h6M9 16h3",
    task: "M8 6h11M8 12h11M8 18h11M4 6h.01M4 12h.01M4 18h.01",
    withdraw: "M12 4v12M7 11l5 5 5-5M5 20h14",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Dashboard() {
  const { data, error } = useLoad("/api/user/home");
  const [copied, setCopied] = useState(false);
  if (error) return <p className="pad">{error}</p>;
  if (!data) return <p className="pad">Loading...</p>;
  const copy = async () => {
    await navigator.clipboard.writeText(data.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const earn = data.earnings || {};
  const user = data.user;
  const stats = [
    ["earnings", "#fff0f6", "#e91e8c", "Total earnings", `Rs ${earn.total}`],
    ["direct", "#eefbf3", "#15803d", "Direct referral", `Rs ${earn.direct}`],
    ["indirect", "#f3e8ff", "#7c3aed", "Indirect referral", `Rs ${earn.indirect}`],
    ["ads", "#fff7ed", "#c2410c", "Ads earning", `Rs ${earn.ads}`],
    ["team", "#fce7f3", "#be185d", "Active team", `${data.active_team} / ${data.team_total}`],
    ["level", "#fef3c7", "#b45309", "Level", `Level ${user.level}`],
    ["plan", "#e0f2fe", "#0369a1", "Plan", user.plan || "No plan"],
    ["task", "#ecfdf5", "#047857", "Today's work", `${data.tasks_today} / ${data.daily_limit}`],
  ];
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const menus = [
    ["/app/work", "task", "#ecfdf5", "#047857", "Work"],
    ["/app/plans", "plan", "#e0f2fe", "#0369a1", "Plans"],
    ["/app/wallet", "wallet", "#fff0f6", "#e91e8c", "Wallet"],
    ["/app/team", "team", "#fce7f3", "#be185d", "Team"],
    ["/app/rewards", "level", "#fef3c7", "#b45309", "Levels & Rewards"],
    ["/app/channels", "ads", "#fff7ed", "#c2410c", "Official Channels"],
    ["/app/withdraw", "withdraw", "#f3e8ff", "#7c3aed", "Withdraw"],
  ];
  return (
    <div className="dash">
      <div className="hero dash-hero">
        <span className="petal p1" />
        <span className="petal p2" />
        <span className="petal p3" />
        <div className="avatar"><img src={LOGO} alt="Flower" /></div>
        <p className="hello">{hello}</p>
        <h1>{user.full_name}</h1>
        <p className="hero-mail">{user.email}</p>
        <div className="hero-pills">
          <span>{user.plan || "No plan"}</span>
          <span>{user.account_status}</span>
          <span>Level {user.level}</span>
        </div>
        <button className="copy" onClick={copy}>{copied ? "Copied" : "Copy Refer Link"}</button>
      </div>
      <div className="balance-card">
        <span className="big-icon pink-icon"><DashIcon name="wallet" /></span>
        <div>
          <div className="sub">Wallet balance</div>
          <strong>Rs {user.balance}</strong>
          <div className="sub">Withdrawn Rs {earn.withdrawn}</div>
        </div>
      </div>
      <Link className="buy-banner" to="/app/plans">
        <span className="big-icon pink-icon"><DashIcon name="plan" /></span>
        <div>
          <b>Buy a plan</b>
          <div className="sub">JazzCash or Easypaisa. Your plan starts after approval.</div>
        </div>
      </Link>
      <div className="sec">Your earnings</div>
      <div className="earn-grid">
        {stats.map(([icon, bg, color, label, value], index) => (
          <div className="earn-card" key={label} style={{ animationDelay: `${index * 70}ms` }}>
            <span className="big-icon" style={{ background: bg, color }}><DashIcon name={icon} /></span>
            <div>
              <div className="sub">{label}</div>
              <b>{value}</b>
            </div>
          </div>
        ))}
      </div>
      <div className="detail-card">
        <div><span>Phone</span><b>{user.phone || "—"}</b></div>
        <div><span>Referral code</span><b>{user.referral_code}</b></div>
        <div><span>Account</span><b>{user.account_status}</b></div>
      </div>
      <div className="notice"><i>📣</i><div><b>Your Notice</b><div className="marquee"><span>{data.notice}</span></div></div></div>
      <div className="sec">Quick Menu</div>
      <div className="grid">
        {menus.map(([href, icon, bg, color, label], index) => (
          <Link key={href} to={href} className="menu" style={{ animationDelay: `${index * 60}ms` }}>
            <span className="icon big-menu" style={{ background: bg, color }}><DashIcon name={icon} /></span>
            <b>{label}</b>
          </Link>
        ))}
      </div>
      <Link className="btn contact" to="/app/contact">Contact Us</Link>
      <div className="sec">Referral</div>
      <div className="refbox">
        <b>Your Referral Link</b>
        <input readOnly value={data.referral_link} />
        <button className="btn" style={{ marginTop: 10 }} onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
      </div>
    </div>
  );
}

export function Work() {
  const { data, reload } = useLoad("/api/user/tasks");
  return (
    <>
      <Back />
      <h2 className="page-title">Work</h2>
      <div className="list">{(data || []).map((task) => (
        <div className="list-card" key={task.id}>
          <div><b>{task.title}</b><div className="sub">{task.detail}</div></div>
          {task.done ? <span className="green">Done</span> : <button className="btn small" onClick={() => api(`/api/user/tasks/${task.id}/complete`, { method: "POST" }).then(reload)}>Rs {task.reward}</button>}
        </div>
      ))}</div>
    </>
  );
}

export function Wallet() {
  const { data, error } = useLoad("/api/user/home");
  if (error) return <p className="pad">{error}</p>;
  if (!data) return <p className="pad wallet-loading">Loading wallet...</p>;
  const earn = data.earnings || {};
  const wallet = data.wallet || {};
  const staff = wallet.staff ?? earn.direct ?? "0";
  const flowers = wallet.flowers ?? earn.ads ?? "0";
  const stats = [
    ["check", "ok", "Withdrawn", moneyCompact(wallet.withdrawn ?? earn.withdrawn)],
    ["clock", "wait", "Pending", moneyCompact(wallet.pending)],
    ["x", "no", "Rejected", moneyCompact(wallet.rejected)],
  ];
  const actions = [
    ["/app/plans", "plus", "go", "Deposit"],
    ["/app/withdraw", "up", "out", "Withdraw"],
    ["/app/transactions", "list", "hist", "History"],
    ["/app/withdraw#history", "clock", "whist", "W. History"],
  ];
  return (
    <div className="wallet-page">
      <section className="bal-hero">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <p>Current balance</p>
        <h1>Rs {moneyText(data.user.balance)}</h1>
        <p className="bal-note">Referral & approved earnings only · Withdraw anytime</p>
        <div className="bal-actions">
          <Link className="pill solid" to="/app/withdraw"><WalletGlyph name="up" /> Withdraw</Link>
          <Link className="pill line" to="/app/plans"><WalletGlyph name="plus" /> Deposit</Link>
        </div>
      </section>
      <div className="stat-row">
        {stats.map(([icon, tone, label, value]) => (
          <article className="wstat" key={label}>
            <span className={`tone ${tone}`}><WalletGlyph name={icon} /></span>
            <b>Rs {value}</b>
            <span>{label}</span>
          </article>
        ))}
      </div>
      <h2 className="sec-title"><i /> My Earnings</h2>
      <div className="earn-pair">
        <article className="earn-tile">
          <span className="soft-ico people"><WalletGlyph name="people" /></span>
          <div>
            <b>Rs {moneyText(staff)}</b>
            <span>Staff Earning</span>
          </div>
        </article>
        <article className="earn-tile">
          <span className="soft-ico bloom"><WalletGlyph name="sprout" /></span>
          <div>
            <b>Rs {moneyText(flowers)}</b>
            <span>Flowers Earn <span aria-hidden="true">🌸</span></span>
          </div>
        </article>
      </div>
      <h2 className="sec-title"><i /> Quick Actions</h2>
      <div className="quick-row">
        {actions.map(([to, icon, tone, label]) => (
          <Link key={label} to={to}>
            <span className={`qa ${tone}`}><WalletGlyph name={icon} /></span>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Tx({ row }) {
  const indirect = row.level === 2 || row.level === 3;
  return (
    <div className="list-card">
      <div>
        <b>{row.title}</b>
        {indirect && <div className="sub">Plan: {row.plan_name || "—"}</div>}
        {row.level === 1 && row.source_email && <div className="sub">From {row.source_email}</div>}
        <div className="sub">{new Date(row.created_at).toLocaleString()}</div>
      </div>
      <div className={row.trx_type === "+" ? "green" : "pink"}>{row.trx_type}Rs {row.amount}</div>
    </div>
  );
}

export function Transactions() {
  const [filter, setFilter] = useState("");
  const { data } = useLoad(`/api/user/transactions${filter ? `?filter=${filter}` : ""}`);
  const options = [["", "All Transactions"], ["ads", "Ads Earning"], ["direct", "Direct Referral Commission"], ["level2", "Level 2 Indirect Referral Commission"], ["level3", "Level 3 Indirect Referral Commission"], ["withdraw", "Withdraw"]];
  return (
    <>
      <Back to="/app/wallet" label="Wallet" />
      <div className="hero"><h1>Transaction History</h1></div>
      <div className="pad"><select value={filter} onChange={(e) => setFilter(e.target.value)}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="list">{(data || []).map((row) => <Tx key={row.id} row={row} />)}</div>
    </>
  );
}

export function Team() {
  const { data } = useLoad("/api/user/team");
  return (
    <>
      <Back />
      <h2 className="page-title">Team</h2>
      <div className="list">{(data || []).map((m) => (
        <div className="list-card" key={m.id}><div><b>{m.full_name}</b><div className="sub">{m.email}</div><div className="sub">{m.plan || "No plan"}</div></div><span className="badge" style={{ background: m.status === "Paid" ? "#d1fae5" : "#fff3cd", color: m.status === "Paid" ? "#065f46" : "#856404" }}>{m.status}</span></div>
      ))}</div>
    </>
  );
}

export function Rewards() {
  const { data } = useLoad("/api/user/rewards");
  if (!data) return <p className="pad">Loading...</p>;
  return (
    <>
      <Back />
      <div className="hero"><div className="sub">Active team {data.active_team}</div><h1>Level {data.level}</h1></div>
      <div className="list">{data.items.map((item) => <div className="list-card" key={item.id}><div><b>{item.title}</b><div className="sub">{item.required_team} approved members · {item.prize}</div></div><span className={item.reached ? "green" : "sub"}>{item.reached ? "Reached" : "Locked"}</span></div>)}</div>
    </>
  );
}

export function Channels() {
  const { data } = useLoad("/api/user/channels");
  return (
    <>
      <Back />
      <div className="hero"><div style={{ fontSize: 36 }}>📢</div><h1>Official Channels</h1></div>
      <div className="list">{(data || []).map((c) => (
        <div className="list-card" key={c.id} style={{ display: "block", textAlign: "center" }}>
          {c.image ? <img src={c.image} alt="" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover" }} /> : <div className="avatar">🌸</div>}
          <h3>{c.title}</h3><div className="pink">{c.purpose}</div><p className="sub">{c.description}</p>
          <a className="btn" href={c.link} target="_blank" rel="noreferrer">Join</a>
        </div>
      ))}</div>
    </>
  );
}

export function Withdraw() {
  const location = useLocation();
  const { data, reload } = useLoad("/api/user/withdrawals");
  useEffect(() => {
    if (location.hash !== "#history") return;
    document.getElementById("history")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash, data]);
  const [form, setForm] = useState({ amount: "", method: "JazzCash", account: "" });
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try { await api("/api/user/withdrawals", { method: "POST", body: form }); setError(""); reload(); } catch (err) { setError(err.message); }
  };
  return (
    <>
      <Back />
      <h2 className="page-title">Withdraw</h2>
      <form className="pad" onSubmit={submit}>
        <input placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}><option>JazzCash</option><option>Easypaisa</option></select>
        <input placeholder="Account number" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} />
        <button className="btn" style={{ marginTop: 10 }}>Submit</button>
        {error && <div className="error">{error}</div>}
      </form>
      <div className="sec" id="history">Withdrawal History</div>
      <div className="list">{(data || []).map((w) => <div className="list-card" key={w.id}><div><b>Rs {w.amount}</b><div className="sub">{w.method} · {w.account}</div></div><span>{w.status}</span></div>)}</div>
    </>
  );
}

export function Contact() {
  const { data } = useLoad("/api/user/contacts");
  return <><Back /><h2 className="page-title">Contact Us</h2><div className="list">{(data || []).map((c) => <a className="list-card" key={c.id} href={`https://wa.me/${c.whatsapp}`}><div><b>{c.name}</b><div className="sub">{c.role}</div><div className="sub">{c.note}</div></div></a>)}</div></>;
}

export function Deposit() {
  const { data, error, reload } = useLoad("/api/user/plans");
  const [planId, setPlanId] = useState("");
  const [method, setMethod] = useState("JazzCash");
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  if (error) return <p className="pad">{error}</p>;
  if (!data) return <p className="pad">Loading...</p>;
  const chosen = (data.plans || []).find((plan) => String(plan.id) === String(planId));
  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    setMessage("");
    try {
      const body = new FormData();
      body.append("plan_id", planId);
      body.append("sender", sender);
      body.append("method", method);
      const file = e.target.screenshot.files[0];
      if (file) body.append("screenshot", file);
      const res = await api("/api/user/deposits", { method: "POST", body });
      setMessage(res.kind === "upgrade" ? "Upgrade request sent. Admin will approve it." : "Payment sent. Admin will approve your plan.");
      setPlanId("");
      setSender("");
      reload();
    } catch (err) { setFormError(err.message); }
  };
  return (
    <>
      <Back />
      <div className="hero"><h1>Plans</h1><p>Pay with JazzCash or Easypaisa. The plan starts after admin approval.</p></div>
      {data.current_plan && <p className="pad">Current plan: <b>{data.current_plan}</b></p>}
      {data.pending_deposit && <p className="pad">Waiting approval: {data.pending_deposit.plan} · Rs {data.pending_deposit.amount}</p>}
      {data.pending_upgrade && <p className="pad">Upgrade waiting: {data.pending_upgrade.plan} · Rs {data.pending_upgrade.amount}</p>}
      <div className="plan-grid">
        {(data.plans || []).map((plan) => {
          const currentPrice = Number((data.plans || []).find((item) => item.id === data.current_plan_id)?.price || 0);
          const label = plan.id === data.current_plan_id ? "Your plan" : !data.current_plan ? "Buy" : Number(plan.price) > currentPrice ? "Upgrade" : "Lower plan";
          return (
          <button type="button" key={plan.id} className={String(planId) === String(plan.id) ? "plan-card on" : "plan-card"} onClick={() => setPlanId(plan.id)}>
            <span className="badge" style={{ background: plan.color, color: plan.text_color }}>{plan.name}</span>
            <strong>Rs {plan.price}</strong>
            <span className="sub">{plan.daily_tasks} tasks every day</span>
            <span className="sub">{label}</span>
          </button>
          );
        })}
      </div>
      <div className="sec">Send payment to</div>
      <div className="list">{(data.gateways || []).map((g) => <div className="list-card" key={g.id}><div><b>{g.name}</b><div className="sub">{g.account_name}</div></div><b>{g.account_number}</b></div>)}</div>
      <form className="pad plan-form" onSubmit={submit}>
        <label>Selected plan</label>
        <input readOnly value={chosen ? `${chosen.name} · Rs ${chosen.price}` : "Tap a plan above"} />
        <label>Method</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)}><option>JazzCash</option><option>Easypaisa</option></select>
        <label>Sender number</label>
        <input placeholder="03xxxxxxxxx" value={sender} onChange={(e) => setSender(e.target.value)} />
        <label>Payment screenshot</label>
        <input name="screenshot" type="file" accept="image/*" />
        <button className="btn" style={{ marginTop: 14 }}>{data.current_plan ? "Request upgrade" : "Submit payment"}</button>
        {formError && <div className="error">{formError}</div>}
        {message && <p>{message}</p>}
      </form>
    </>
  );
}

function AuthShell({ children }) {
  return (
    <div className="auth-split">
      <section className="auth-brand">
        <div className="brand-orb orb-a" />
        <div className="brand-orb orb-b" />
        <img src={LOGO} alt="Flower" />
        <h1>Flower</h1>
        <p>Your trusted earning platform. Grow your income every day.</p>
        <div className="auth-pills">
          <span><b>100%</b> Secure & trusted</span>
          <span><b>Fast</b> withdrawals</span>
          <span><b>Daily</b> referral rewards</span>
          <span><b>24/7</b> support</span>
        </div>
      </section>
      <section className="auth-panel">{children}</section>
    </div>
  );
}

function PasswordField({ id, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pass-wrap">
      <input id={id} type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} />
      <button type="button" className="pass-toggle" onClick={() => setShow((open) => !open)} aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button>
    </div>
  );
}

export function Login({ role = "user" }) {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api("/api/auth/login", { method: "POST", body: { identity, password, role } });
      localStorage.setItem("flower_token", res.token);
      localStorage.setItem("flower_user", JSON.stringify(res.user));
      navigate(role === "admin" ? "/admin" : "/app");
    } catch (err) { setError(err.message); }
  };
  return (
    <AuthShell>
      <form className="card" onSubmit={submit}>
        <div className="card-logo"><img src={LOGO} alt="" /></div>
        <h2>{role === "admin" ? "Admin login" : "Welcome back"}</h2>
        <p className="muted">{role === "admin" ? "Open the Flower admin dashboard" : "Sign in and continue your daily earning"}</p>
        <label htmlFor="identity">Email, username, or phone</label>
        <input id="identity" value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="name@email.com" autoComplete="username" inputMode="email" />
        <label htmlFor="password">Password</label>
        <PasswordField id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
        <button className="btn" style={{ marginTop: 18 }}>Sign in</button>
        {error && <div className="error">{error}</div>}
        {role === "user" && <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>}
      </form>
    </AuthShell>
  );
}

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", referral: new URLSearchParams(window.location.search).get("ref") || "" });
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api("/api/auth/register", { method: "POST", body: form });
      localStorage.setItem("flower_token", res.token);
      localStorage.setItem("flower_user", JSON.stringify(res.user));
      navigate("/app/deposit");
    } catch (err) { setError(err.message); }
  };
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  return (
    <AuthShell>
      <form className="card" onSubmit={submit}>
        <div className="card-logo"><img src={LOGO} alt="" /></div>
        <h2>Create your account</h2>
        <p className="muted">Join Flower and start with your referral link</p>
        <div className="form-grid">
          <div>
            <label htmlFor="full_name">Full name</label>
            <input id="full_name" placeholder="Aisha Khan" value={form.full_name} onChange={set("full_name")} autoComplete="name" />
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <input id="phone" placeholder="03xxxxxxxxx" value={form.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" />
          </div>
        </div>
        <label htmlFor="email">Email</label>
        <input id="email" placeholder="you@email.com" value={form.email} onChange={set("email")} autoComplete="email" inputMode="email" />
        <label htmlFor="new-password">Password</label>
        <PasswordField id="new-password" value={form.password} onChange={set("password")} placeholder="At least 6 characters" autoComplete="new-password" />
        <label htmlFor="referral">Referral code</label>
        <input id="referral" placeholder="Optional" value={form.referral} onChange={set("referral")} />
        <button className="btn" style={{ marginTop: 18 }}>Create account</button>
        {error && <div className="error">{error}</div>}
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </AuthShell>
  );
}
