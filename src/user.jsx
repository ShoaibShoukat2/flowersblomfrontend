import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { api, clearSession, LOGO, savedUser } from "./api";

function useLoad(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const reload = () => api(path).then(setData).catch((e) => setError(e.message));
  useEffect(() => { reload(); }, [path]);
  return { data, error, reload };
}

const userNav = [
  ["/app", "home", "Dashboard"],
  ["/app/work", "task", "Work"],
  ["/app/wallet", "wallet", "Wallet"],
  ["/app/contact", "direct", "Contact Tasks"],
  ["/app/channels", "ads", "Official Channels"],
  ["/app/withdraw", "withdraw", "Withdraw"],
  ["/app/team", "team", "My Team"],
  ["/app/rewards", "level", "Levels"],
  ["/app/plans", "plan", "Plan Upgrade"],
  ["/app/transactions", "task", "Transactions"],
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
    layers: "M12 4l8 4-8 4-8-4 8-4zM4 12l8 4 8-4M4 16l8 4 8-4",
    link: "M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function pageInfo(pathname) {
  const pages = [
    ["/app/plans", "Plan Upgrade", "Plan Upgrade"],
    ["/app/deposit", "Deposit", "Deposit"],
    ["/app/work", "Task Room", "Work"],
    ["/app/wallet", "Wallet", "Wallet"],
    ["/app/transactions", "Transaction History", "Transactions"],
    ["/app/team", "My Team", "My Team"],
    ["/app/rewards", "Levels", "Levels"],
    ["/app/channels", "Official Channels", "Channels"],
    ["/app/withdraw", "Withdraw", "Withdraw"],
    ["/app/contact", "Contact Tasks", "Contact"],
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
  const brandBar = location.pathname === "/app" || ["/app/wallet", "/app/team", "/app/rewards", "/app/deposit", "/app/plans", "/app/work"].includes(location.pathname);
  return (
    <div className="phone">
      {popOpen && <button className="pop-back" aria-label="Close" onClick={() => { setBell(false); setProfile(false); }} />}
      <header className={brandBar ? "user-bar brand-bar" : "user-bar"}>
        <button className="burger" aria-label="Open menu" onClick={() => setOpen(true)}>
          <span /><span /><span />
        </button>
        {brandBar ? (
          <div className="brand-lockup">
            <FlowerMark />
            <b>Flowers</b>
            <FlowerMark />
          </div>
        ) : (
        <div className="bar-title">
          <b>{meta.title}</b>
          <div className="crumb">
            <Link to="/app" aria-label="Home"><WalletGlyph name="home" /></Link>
            <span>/</span>
            <em>{meta.crumb}</em>
          </div>
        </div>
        )}
        <div className="bar-actions">
          {brandBar ? (
            <button className="brand-flower" aria-label="Account menu" aria-expanded={profile} onClick={() => { setProfile((v) => !v); setBell(false); }}>
              <FlowerMark />
            </button>
          ) : (
          <button className="icon-btn" aria-label="Notices" aria-expanded={bell} onClick={() => { setBell((v) => !v); setProfile(false); }}>
            <WalletGlyph name="bell" />
            {notice ? <i className="dot" /> : null}
          </button>
          )}
          {bell && (
            <div className="pop notice-pop">
              <b>Notices</b>
              <p>{notice || "You're all caught up."}</p>
            </div>
          )}
          {!brandBar && (
          <button className="profile-btn" aria-label="Account menu" aria-expanded={profile} onClick={() => { setProfile((v) => !v); setBell(false); }}>
            <WalletGlyph name="user" />
            <WalletGlyph name="caret" />
          </button>
          )}
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
          <NavLink key={to} to={to} end={to === "/app"} style={{ animationDelay: `${index * 40}ms` }}>
            <span className="icon"><DashIcon name={icon} /></span>
            {label}
          </NavLink>
        ))}
        <button className="btn ghost" onClick={() => { clearSession(); window.location.href = "/login"; }}>Logout</button>
      </aside>
      <div className="user-body">{children}</div>
      <nav className="dock" aria-label="Main">
        <NavLink to="/app" end>
          <span className="dock-ico"><DashIcon name="home" /></span>
          Home
        </NavLink>
        <NavLink to="/app/wallet">
          <span className="dock-ico"><DashIcon name="wallet" /></span>
          Wallet
        </NavLink>
        <NavLink to="/app/work" className={({ isActive }) => isActive ? "dock-main active" : "dock-main"}>
          <span className="dock-ico"><SakuraIcon /></span>
          Task Room
        </NavLink>
        <NavLink to="/app/rewards">
          <span className="dock-ico"><DashIcon name="level" /></span>
          Rewards
        </NavLink>
        <button type="button" className={open ? "on" : ""} onClick={() => setOpen(true)}>
          <span className="dock-ico"><DashIcon name="menu" /></span>
          Menu
        </button>
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
    home: "M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z",
    menu: "M5 7h14M5 12h14M5 17h14",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SakuraIcon({ tone = "#ff4f9a", className = "sakura-icon" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="32" cy="15" rx="9.5" ry="16" fill={tone} transform={`rotate(${deg} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="8" fill="#ffe08a" />
      <circle cx="32" cy="32" r="3.4" fill="#f5a623" />
    </svg>
  );
}

function sakuraAt(x, y, scale, tone) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={`${x}-${deg}`} cx="0" cy="-16" rx="8" ry="14" fill={tone} transform={`rotate(${deg})`} />
      ))}
      <circle r="6.5" fill="#ffe7a3" />
      <circle r="2.8" fill="#f5a623" />
    </g>
  );
}

function BlossomScene() {
  return (
    <div className="blossom-scene" aria-hidden="true">
      <svg className="sprig sprig-a" viewBox="0 0 200 160">
        <path d="M18 150 C50 110 80 90 130 48" fill="none" stroke="#f7c5dc" strokeWidth="3" strokeLinecap="round" />
        {sakuraAt(128, 42, 0.85, "#ff8fbf")}
        {sakuraAt(86, 78, 0.55, "#ffd0e6")}
        {sakuraAt(48, 112, 0.42, "#fff")}
        <circle cx="156" cy="28" r="5" fill="#ffd6ea" />
      </svg>
      <svg className="sprig sprig-b" viewBox="0 0 200 160">
        <path d="M180 20 C140 50 120 70 70 120" fill="none" stroke="#f7c5dc" strokeWidth="3" strokeLinecap="round" />
        {sakuraAt(64, 118, 0.8, "#ff7eb3")}
        {sakuraAt(112, 78, 0.5, "#fff")}
        {sakuraAt(150, 42, 0.4, "#ffd0e6")}
      </svg>
      <svg className="sprig sprig-c" viewBox="0 0 220 150">
        <path d="M10 40 C50 70 90 80 150 120" fill="none" stroke="#f7c5dc" strokeWidth="3" strokeLinecap="round" />
        {sakuraAt(36, 52, 0.7, "#ffb3d1")}
        {sakuraAt(96, 84, 0.9, "#ff6fa8")}
        {sakuraAt(154, 118, 0.48, "#fff")}
      </svg>
      <svg className="sprig sprig-d" viewBox="0 0 220 150">
        <path d="M200 130 C150 100 120 80 60 30" fill="none" stroke="#f7c5dc" strokeWidth="3" strokeLinecap="round" />
        {sakuraAt(58, 36, 0.75, "#ff8fbf")}
        {sakuraAt(118, 78, 0.5, "#ffe4f2")}
        {sakuraAt(168, 112, 0.62, "#ff7eb3")}
      </svg>
    </div>
  );
}

function FlowerMark() {
  return <SakuraIcon className="flower-mark sakura-icon" />;
}

const LEVEL_LOOK = {
  1: ["🌷", "Tulip Level"],
  2: ["🌸", "Cherry Blossom Level"],
  3: ["🌸", "Bloom Level"],
  4: ["🪷", "Lotus Level"],
  5: ["🌼", "Daisy Level"],
  6: ["🌹", "Rose Level"],
  7: ["🌺", "Orchid Level"],
  8: ["🌻", "Sunflower Level"],
};

function memberFlower(level) {
  return (LEVEL_LOOK[level] || ["🌸", "Level"])[0];
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
  const user = data.user;
  const menus = [
    ["/app/work", "flower", "Garden"],
    ["/app/wallet", "wallet", "Wallet"],
    ["/app/team", "team", "Team"],
    ["/app/rewards", "level", "Level & Rewards"],
    ["/app/channels", "ads", "Official Channels"],
    ["/app/withdraw", "withdraw", "Withdraw"],
  ];
  return (
    <div className="bloom-wallet home-dash">
      <div className="dash-title">
        <h1><SakuraIcon className="title-flower" /> Main Dashboard</h1>
        <div className="crumb"><Link to="/app" aria-label="Home"><WalletGlyph name="home" /></Link><span>Home</span><span>/</span><em>Main Dashboard</em></div>
      </div>
      <section className="profile-bloom">
        <SakuraIcon className="profile-sprig left" />
        <SakuraIcon className="profile-sprig right" />
        <span className="welcome-bloom" aria-hidden="true"><SakuraIcon /></span>
        <h2>{user.full_name}</h2>
        <p>{user.email}</p>
        <Link className="plan-pill" to="/app/plans">{user.plan || "Choose a plan"}</Link>
      </section>
      <h3 className="menu-kicker">Quick Menu</h3>
      <div className="home-menu">
        {menus.map(([href, icon, label]) => (
          <Link key={href} to={href}>
            <i>{icon === "flower" ? <SakuraIcon /> : <DashIcon name={icon} />}</i>
            <b>{label}</b>
            <em>›</em>
          </Link>
        ))}
      </div>
      <Link className="contact-strip" to="/app/contact">
        <i aria-hidden="true"><DashIcon name="direct" /></i>
        <div><b>Contact Us</b><span>We're here to help you!</span></div>
        <em>›</em>
      </Link>
      <section className="ref-card">
        <i aria-hidden="true"><WalletGlyph name="link" /></i>
        <div>
          <b>Your Referral Link</b>
          <input readOnly value={data.referral_link} />
        </div>
        <button type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
      </section>
    </div>
  );
}

function remain(seconds) {
  const left = Math.max(0, Number(seconds) || 0);
  const days = Math.floor(left / 86400);
  const hours = Math.floor((left % 86400) / 3600);
  const minutes = Math.floor((left % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function LevelStatus({ data }) {
  const progress = data.progress || {};
  const remaining = Math.max(0, Number(progress.next_required || 0) - Number(progress.joinings || 0));
  const next = progress.next_level ? `${progress.joinings} approved · ${remaining} remaining for Level ${progress.next_level}` : "Level 8 complete";
  return (
    <section className="level-status">
      <article><span>Current Level</span><b>Level {progress.level || 0}</b></article>
      <article><span>Next level joinings</span><b>{next}</b></article>
      <article><span>Current Balance</span><b>Rs {moneyText(data.user.balance)}</b><small>Task earnings</small></article>
      <article><span>Flower Earnings</span><b>Rs {moneyText(progress.flower_balance)}</b></article>
      <article className={progress.locked ? "is-locked" : "is-open"}><span>Task Status</span><b>{progress.task_status || "Unlocked"}</b></article>
      <article><span>Joining cycle</span><b>{progress.locked ? "Due now" : remain(progress.remaining_seconds)}</b><small>{progress.cycle_days}-day cycle</small></article>
      <article><span>Per task</span><b>Rs {moneyText(progress.task_rate, 0)}</b><small>{Number(progress.level) === 8 ? "Level 8 rate is Rs 100" : "Level 8 rate is Rs 100"}</small></article>
      <p>{progress.message}</p>
    </section>
  );
}

const FLOWER_TONES = ["#ff5aa5", "#ff7a8a", "#e23b92", "#f5b942", "#ff4d6d", "#c084fc", "#fb7185", "#f472b6", "#fda4af", "#f9a8d4"];
const PETAL_SPINS = [0, 72, 144, 216, 288];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function flowerKind(title) {
  const key = String(title || "").toLowerCase();
  if (key.includes("sun")) return "sun";
  if (key.includes("tulip") || key.includes("rose")) return "tulip";
  if (key.includes("daisy") || key.includes("lotus") || key.includes("lily")) return "white";
  return "hibiscus";
}

function MiniFlower({ kind = "hibiscus" }) {
  if (kind === "sun") {
    return (
      <svg className="mini-flower" viewBox="0 0 80 80" aria-hidden="true">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <ellipse key={deg} cx="40" cy="18" rx="7" ry="14" fill="#f5b301" transform={`rotate(${deg} 40 40)`} />
        ))}
        <circle cx="40" cy="40" r="11" fill="#9a3412" />
        <circle cx="40" cy="40" r="5" fill="#fde68a" />
      </svg>
    );
  }
  if (kind === "tulip") {
    return (
      <svg className="mini-flower" viewBox="0 0 80 80" aria-hidden="true">
        <path d="M40 74V42" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" />
        <path d="M40 58c-10 2-16 8-16 8" stroke="#4ade80" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M26 34c0-16 14-22 14-22s14 6 14 22c0 10-6 16-14 18-8-2-14-8-14-18z" fill="#ff4f9a" />
        <ellipse cx="40" cy="36" rx="7" ry="12" fill="#ff8ec3" />
      </svg>
    );
  }
  if (kind === "white") return <SakuraIcon tone="#fff5fb" className="mini-flower" />;
  return <SakuraIcon tone="#ff4f9a" className="mini-flower" />;
}

function GiftReveal({ phase, kind }) {
  return (
    <div className={`gift-stage is-${phase}`} role="dialog" aria-label="Flower opening">
      <div className="gift-glow" />
      <span className="gift-petal p1" /><span className="gift-petal p2" /><span className="gift-petal p3" />
      <span className="gift-petal p4" /><span className="gift-petal p5" /><span className="gift-petal p6" />
      <div className="gift">
        <div className="gift-flower">
          <MiniFlower kind={kind} />
          {phase === "bloom" && (
            <span className="gift-bouquet" aria-hidden="true">
              <MiniFlower kind="hibiscus" />
              <MiniFlower kind="sun" />
              <MiniFlower kind="tulip" />
              <MiniFlower kind="white" />
            </span>
          )}
        </div>
        <div className="gift-lid"><i /></div>
        <div className="gift-box"><i /></div>
      </div>
    </div>
  );
}

function TaskBloom({ mode, tone }) {
  return (
    <span className={`task-bloom is-${mode}`} style={{ "--petal": tone }} aria-hidden="true">
      {PETAL_SPINS.map((deg) => <i key={deg} className="bloom-petal" style={{ "--spin": `${deg}deg` }} />)}
      <i className="bud-cup" />
      <i className="bloom-core" />
      {mode === "done" && <i className="bloom-check" />}
    </span>
  );
}

function LockAlert({ message, shake }) {
  return (
    <div className={`lock-alert${shake ? " is-shake" : ""}`} role="alert">
      <div className="lock-stage" aria-hidden="true">
        <span className="lock-spark s1" />
        <span className="lock-spark s2" />
        <span className="lock-spark s3" />
        <i className="lock-leaf l1" />
        <i className="lock-leaf l2" />
        <i className="lock-leaf l3" />
        <span className="lock-bud"><b /></span>
      </div>
      <p>{message}</p>
    </div>
  );
}

export function Work() {
  const { data, error, reload } = useLoad("/api/user/tasks");
  const [note, setNote] = useState("");
  const [openingSlot, setOpeningSlot] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [rewardPop, setRewardPop] = useState(null);
  const [shake, setShake] = useState(false);
  const busy = useRef(false);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  if (error) return <p className="pad">{error}</p>;
  if (!data) return <p className="pad">Loading...</p>;
  const progress = data.progress || {};
  const tasks = data.tasks || [];
  const limit = Number(progress.daily_limit) || tasks.length || 0;
  const doneCount = tasks.filter((task) => task.done).length;
  const nextTask = tasks.find((task) => !task.done);
  const meter = limit ? Math.min(100, Math.round((doneCount / limit) * 100)) : 0;
  const finish = async (task) => {
    if (busy.current || task.done) return;
    if (progress.locked) {
      setShake(false);
      window.setTimeout(() => setShake(true), 30);
      return;
    }
    if (!nextTask || task.slot !== nextTask.slot) {
      setNote("Open the glowing flower first.");
      return;
    }
    busy.current = true;
    setNote("");
    setOpeningSlot(task.slot);
    setReveal("shut");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      if (!reduce) await wait(260);
      if (!alive.current) return;
      setReveal("open");
      if (!reduce) await wait(1100);
      if (!alive.current) return;
      const result = await api(`/api/user/tasks/${task.id}/complete`, { method: "POST" });
      if (!alive.current) return;
      setRewardPop({ slot: task.slot, amount: result.reward });
      setReveal("bloom");
      if (!reduce) await wait(1200);
      await reload();
    } catch (err) {
      if (alive.current) setNote(err.message);
      if (alive.current && /already open|not open today|limit is complete/i.test(err.message || "")) await reload();
    } finally {
      busy.current = false;
      if (alive.current) {
        setOpeningSlot(null);
        setReveal(null);
        setTimeout(() => { if (alive.current) setRewardPop(null); }, 500);
      }
    }
  };
  const modeFor = (task) => {
    if (task.done) return "done";
    if (openingSlot === task.slot) return "opening";
    if (progress.locked) return "locked";
    if (nextTask && task.slot === nextTask.slot) return "ready";
    return "wait";
  };
  const readyLeft = Math.max(0, limit - doneCount);
  const ring = 2 * Math.PI * 54;
  const ringOffset = ring - (meter / 100) * ring;
  const openingTask = tasks.find((task) => task.slot === openingSlot);
  const actionLabel = (mode) => {
    if (mode === "done") return "Opened";
    if (mode === "opening") return "Opening";
    if (mode === "locked") return "Locked";
    if (mode === "ready") return "Bloom now";
    return "Wait";
  };
  return (
    <div className="task-room">
      <p className="room-crumb"><Link to="/app">Home</Link><span>/</span>Task Room</p>
      <section className="garden">
        <SakuraIcon className="garden-sprig s1" />
        <SakuraIcon className="garden-sprig s2" />
        <SakuraIcon className="garden-sprig s3" />
        <SakuraIcon className="garden-sprig s4" />
        <div className="live-pill"><i />Live Garden</div>
        <h2><span>Bloom</span> <span>Tasks</span></h2>
        <p>Pick a flower, watch it bloom, earn rewards</p>
        <div className="garden-ring" aria-label={`${doneCount} of ${limit} flowers open`}>
          <svg viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="54" />
            <circle cx="70" cy="70" r="54" style={{ strokeDasharray: ring, strokeDashoffset: ringOffset }} />
          </svg>
          <i className="ring-dot" />
          <div>
            <b>{doneCount}</b>
            <span>of</span>
            <strong>{limit}</strong>
          </div>
        </div>
        <div className="garden-row">
          <span className="garden-ico" aria-hidden="true"><i /><i /><b /></span>
          <b>Garden Blooms</b>
          <em>{readyLeft} ready</em>
        </div>
        {progress.locked && progress.message ? <LockAlert message={progress.message} shake={shake} /> : progress.message ? <p className="task-note">{progress.message}</p> : null}
        {note && note !== progress.message && <p className="task-note locked">{note}</p>}
        <div className="garden-grid">
          {tasks.map((task) => {
            const mode = modeFor(task);
            return (
              <button
                key={task.slot}
                type="button"
                className={`garden-card is-${mode}`}
                disabled={mode === "done" || mode === "opening"}
                onClick={() => finish(task)}
              >
                <span>{task.title}</span>
                <span className="bloom-wrap">
                  <MiniFlower kind={flowerKind(task.title)} />
                  {rewardPop && rewardPop.slot === task.slot && <b className="reward-float">+ Rs {moneyText(rewardPop.amount, 0)}</b>}
                </span>
                <em>{actionLabel(mode)}</em>
              </button>
            );
          })}
        </div>
        {tasks.length === 0 && <p className="task-note">No task is available right now.</p>}
      </section>
      {reveal && <GiftReveal phase={reveal} kind={flowerKind(openingTask?.title)} />}
    </div>
  );
}

function withdrawalLabel(status) {
  if (status === "pending") return "Pending";
  if (status === "approved") return "Approved";
  if (status === "success") return "Success";
  if (status === "rejected") return "Rejected";
  return status || "Pending";
}

function withdrawalRows(data) {
  if (Array.isArray(data)) return data;
  return data?.rows || [];
}

function whenText(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

function slipWhen(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  let hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${date.getFullYear()}-${month}-${day} ${String(hour).padStart(2, "0")}:${minute} ${suffix}`;
}

function WalletArt() {
  return (
    <svg className="wallet-art" viewBox="0 0 170 150" aria-hidden="true">
      <ellipse cx="88" cy="136" rx="54" ry="8" fill="rgba(255,255,255,.25)" />
      <circle cx="30" cy="40" r="14" fill="#ffe08a" stroke="#f5b942" strokeWidth="3" />
      <text x="30" y="45" textAnchor="middle" fontSize="13" fill="#c47b00" fontWeight="700">$</text>
      <circle cx="146" cy="32" r="11" fill="#ffd56a" />
      <text x="146" y="36" textAnchor="middle" fontSize="10" fill="#c47b00" fontWeight="700">$</text>
      <circle cx="156" cy="68" r="8" fill="#ffe7a8" />
      <path d="M48 62h84c8 0 14 6 12 14H38c0-8 2-14 10-14z" fill="#ff8ec4" />
      <rect x="32" y="74" width="112" height="54" rx="16" fill="#ff2f86" />
      <rect x="44" y="86" width="88" height="28" rx="10" fill="#fff" />
      <circle cx="114" cy="100" r="6" fill="#ff4f9a" />
      <circle cx="62" cy="24" r="5" fill="#ffd0e6" />
      <circle cx="98" cy="16" r="3.5" fill="#ffe4f2" />
    </svg>
  );
}

function WithdrawalHistory({ rows }) {
  return (
    <div className="list withdraw-history" id="history">
      {(rows || []).map((row) => (
        <article className="withdraw-card" key={row.id}>
          <div>
            <b>Rs {moneyText(row.amount)}</b>
            <div className="sub">Requested {whenText(row.created_at) || "—"}</div>
            {row.approved_at && <div className="sub">Approved {whenText(row.approved_at)}</div>}
            <div className="sub">{[row.method, row.account_mask].filter(Boolean).join(" · ")}</div>
          </div>
          <span className={`status-badge ${row.status}`}>{withdrawalLabel(row.status)}</span>
        </article>
      ))}
      {(rows || []).length === 0 && <p className="empty-note">No withdrawal yet.</p>}
    </div>
  );
}

export function Wallet() {
  const home = useLoad("/api/user/home");
  const history = useLoad("/api/user/withdrawals");
  const [flowerNote, setFlowerNote] = useState("");
  const [showAll, setShowAll] = useState(false);
  const location = useLocation();
  useEffect(() => {
    if (location.hash !== "#history") return;
    document.getElementById("history")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash, history.data]);
  if (home.error) return <p className="pad">{home.error}</p>;
  if (!home.data) return <p className="pad wallet-loading">Loading wallet...</p>;
  const wallet = home.data.wallet || {};
  const rows = withdrawalRows(history.data);
  const pendingCount = rows.filter((row) => row.status === "pending").length;
  const rejectedCount = rows.filter((row) => row.status === "rejected").length;
  const recent = showAll ? rows : rows.slice(0, 4);
  const showFlower = () => {
    const text = wallet.flower_locked ? "Flower Earnings unlock at Level 8 and stay separate from Current Balance." : "Flower Earnings are separate from Current Balance.";
    setFlowerNote(text);
    window.setTimeout(() => setFlowerNote(""), 4000);
  };
  return (
    <div className="wallet-page bloom-wallet">
      <div className="wallet-head">
        <h1>Wallet</h1>
        <div className="crumb">
          <Link to="/app" aria-label="Home"><WalletGlyph name="home" /></Link>
          <span>Home</span>
          <span>/</span>
          <em>Wallet</em>
        </div>
      </div>
      <section className="bloom-balance">
        <div>
          <span className="bloom-ico"><DashIcon name="wallet" /></span>
          <p>Wallet Balance</p>
          <h1>Rs {moneyText(home.data.user.balance)}</h1>
          <Link className="avail-pill" to="/app/withdraw"><DashIcon name="wallet" /> Available Balance</Link>
        </div>
        <WalletArt />
      </section>
      <div className="bloom-pair">
        <Link className="bloom-stat tone-pending" to="/app/withdraw#withdraw-page-history">
          <span className="bloom-ico"><WalletGlyph name="clock" /></span>
          <div><b>Pending Withdraw</b><strong>{history.data ? pendingCount : "—"}</strong></div>
          <em aria-hidden="true">›</em>
        </Link>
        <Link className="bloom-stat tone-rejected" to="/app/withdraw#withdraw-page-history">
          <span className="bloom-ico"><WalletGlyph name="x" /></span>
          <div><b>Withdraw Rejected</b><strong>{history.data ? rejectedCount : "—"}</strong></div>
          <em aria-hidden="true">›</em>
        </Link>
      </div>
      <section className="bloom-card">
        <h2><span aria-hidden="true">🌸</span> My Earnings</h2>
        <div className="earn-grid-4">
          <Link className="tone-staff" to="/app/transactions?filter=direct">
            <span>⭐</span>
            <b>Staff Earning</b>
            <strong>Rs {moneyText(wallet.staff)}</strong>
            <em>›</em>
          </Link>
          <button className="tone-flower" type="button" onClick={showFlower}>
            <span>🌸</span>
            <b>Flower Earning</b>
            <strong>Rs {moneyText(wallet.flowers)}</strong>
            <em>›</em>
            {flowerNote && <small>{flowerNote}</small>}
          </button>
          <Link className="tone-withdraw" to="/app/wallet#history">
            <span>👛</span>
            <b>Approved Withdraw</b>
            <strong>Rs {moneyText(wallet.withdrawn)}</strong>
            <small>Total Withdraw Amount</small>
            <em>›</em>
          </Link>
          <Link className="tone-indirect" to="/app/transactions">
            <span>🪙</span>
            <b>Indirect Earnings</b>
            <strong>Rs {moneyText(wallet.indirect)}</strong>
            <small>From Indirect Team</small>
            <em>›</em>
          </Link>
        </div>
      </section>
      <section className="bloom-card">
        <h2><span aria-hidden="true">⚡</span> Quick Action <Link to="/app/plans">›</Link></h2>
        <div className="quick-four">
          <Link to="/app/plans"><i><DashIcon name="plan" /></i>Deposit</Link>
          <Link to="/app/withdraw"><i><DashIcon name="withdraw" /></i>Withdraw</Link>
          <Link to="/app/withdraw#withdraw-page-history"><i><WalletGlyph name="clock" /></i>Withdraw History</Link>
          <Link to="/app/transactions"><i><DashIcon name="task" /></i>Transaction History</Link>
        </div>
      </section>
      <section className="bloom-card" id="history">
        <h2><span aria-hidden="true">🕒</span> Recent Withdrawals <button type="button" onClick={() => setShowAll((open) => !open)}>{showAll ? "Show less" : "View All"} ›</button></h2>
        <div className="recent-list">
          {recent.map((row) => (
            <Link key={row.id} to="/app/withdraw#withdraw-page-history">
              <i><DashIcon name="wallet" /></i>
              <div>
                <b>Rs {moneyText(row.amount)}</b>
                <span>{slipWhen(row.created_at) || "—"}</span>
              </div>
              <em className={row.status === "approved" ? "ok" : row.status}>{row.status === "approved" ? "Success" : withdrawalLabel(row.status)}</em>
            </Link>
          ))}
          {history.data && rows.length === 0 && <p>No withdrawal yet.</p>}
        </div>
      </section>
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
  const [params] = useSearchParams();
  const [filter, setFilter] = useState(params.get("filter") || "");
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
  const home = useLoad("/api/user/home");
  const { data } = useLoad("/api/user/team");
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const copy = async () => {
    if (!home.data?.referral_link) return;
    await navigator.clipboard.writeText(home.data.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  if (home.error) return <p className="pad">{home.error}</p>;
  if (!home.data) return <p className="pad">Loading...</p>;
  const progress = home.data.progress || {};
  const user = home.data.user || {};
  const members = data || [];
  const shown = showAll ? members : members.slice(0, 5);
  const done = Number(home.data.tasks_today || 0);
  const limit = Number(home.data.daily_limit || 0);
  return (
    <div className="bloom-wallet team-page">
      <div className="wallet-head">
        <h1><span aria-hidden="true">🌸</span> My Team</h1>
        <div className="crumb">
          <Link to="/app" aria-label="Home"><WalletGlyph name="home" /></Link>
          <span>Home</span>
          <span>/</span>
          <em>My Team</em>
        </div>
      </div>
      <section className="team-banner">
        <span className="team-bloom" aria-hidden="true">🌸</span>
        <div>
          <h2>My Team</h2>
          <span className="client-pill"><DashIcon name="team" /> {user.plan || "Member"}</span>
          <p>Grow your team and earn more rewards.</p>
        </div>
        <span className="team-people" aria-hidden="true"><DashIcon name="team" /></span>
      </section>
      <section className="team-metrics">
        <span className="level-chip">Level {progress.level || user.level || 0}</span>
        <article><i>👥</i><b>Total Referral</b><strong>{home.data.team_total || 0}</strong></article>
        <article><i className="ok">✓</i><b>Active</b><strong>{home.data.active_team || 0}</strong></article>
        <article>
          <i>📋</i>
          <b>Task Limit</b>
          <strong>{done} / {limit}</strong>
          <small>Earning per Task <em>Rs {moneyText(progress.task_rate || 0)}</em></small>
        </article>
      </section>
      <section className="ref-bar">
        <span aria-hidden="true">🔗</span>
        <div>
          <b>Your Referral Link</b>
          <input readOnly value={home.data.referral_link || ""} aria-label="Referral link" />
        </div>
        <button type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
      </section>
      <section className="bloom-card">
        <h2><span aria-hidden="true">🌸</span> Team Members <button type="button" onClick={() => setShowAll((open) => !open)}>{showAll ? "Show less" : "View All"} ›</button></h2>
        <div className="member-list">
          {shown.map((member) => (
            <article key={member.id}>
              <i>{memberFlower(member.level)}</i>
              <div>
                <b>{member.full_name}</b>
                <span>{member.email}</span>
              </div>
              <em className={Number(member.level) <= 1 ? "gold" : "pink"}>Level {member.level || 0}</em>
            </article>
          ))}
          {data && members.length === 0 && <p>No approved members yet.</p>}
        </div>
      </section>
    </div>
  );
}

export function Rewards() {
  const rewards = useLoad("/api/user/rewards");
  const home = useLoad("/api/user/home");
  if (!rewards.data || !home.data) return <p className="pad">Loading...</p>;
  const data = rewards.data;
  const done = Number(home.data.tasks_today || 0);
  const limit = Number(home.data.daily_limit || 0);
  return (
    <div className="bloom-wallet levels-page">
      <div className="wallet-head">
        <h1><span aria-hidden="true">🌸</span> Levels</h1>
        <div className="crumb">
          <Link to="/app" aria-label="Home"><WalletGlyph name="home" /></Link>
          <span>Home</span>
          <span>/</span>
          <em>Levels</em>
        </div>
      </div>
      <section className="level-banner">
        <span className="team-bloom crown" aria-hidden="true">🌸</span>
        <div>
          <span className="client-pill">Current Level</span>
          <h2>Bloom Level {data.level || 0}</h2>
          <p>{data.next_level ? "You're growing beautifully!" : "Level 8 complete."}</p>
        </div>
        <aside>
          <p><i>👥</i> Total Referral <b>{home.data.team_total || 0}</b></p>
          <p><i>✓</i> Active <b>{data.active_team || 0}</b></p>
          <p><i>📋</i> Task Limit <b>{done} / {limit}</b></p>
        </aside>
      </section>
      <section className="bloom-card">
        <h2><span aria-hidden="true">🌸</span> Level Progress</h2>
        <p className="level-note">Approved members move the level. Each level keeps its own task rate.</p>
        <div className="level-list">
          {data.items.map((item) => {
            const look = LEVEL_LOOK[item.level] || ["🌸", item.title];
            return (
              <article key={item.id}>
                <i>{look[0]}</i>
                <div>
                  <b>{look[1]}</b>
                  <span>{item.required_team} approved members · {item.prize}</span>
                </div>
                <em className={item.reached ? "reached" : "locked"}>{item.reached ? "Reached" : "Locked"}</em>
              </article>
            );
          })}
        </div>
      </section>
    </div>
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
  const { data, reload } = useLoad("/api/user/withdrawals");
  const [form, setForm] = useState({ amount: "", method: "JazzCash", account_name: "", account: "" });
  const [error, setError] = useState("");
  const pack = Array.isArray(data) || !data ? { rows: withdrawalRows(data), minimum: "50.00", minimum_message: "Your first withdrawal must be at least Rs 50.", withdrawable: null } : data;
  const submit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    const minimum = Number(pack.minimum || 50);
    const withdrawable = pack.withdrawable == null ? null : Number(pack.withdrawable);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount above zero.");
      return;
    }
    if (amount < minimum) {
      setError(pack.minimum_message || `The minimum withdrawal is Rs ${pack.minimum}.`);
      return;
    }
    if (withdrawable != null && amount > withdrawable) {
      setError("That amount is higher than the balance you can withdraw.");
      return;
    }
    try { await api("/api/user/withdrawals", { method: "POST", body: form }); setForm({ ...form, amount: "", account_name: "", account: "" }); setError(""); reload(); } catch (err) { setError(err.message); }
  };
  return (
    <>
      <Back to="/app/wallet" label="Wallet" />
      <h2 className="page-title">Withdraw</h2>
      <form className="pad" onSubmit={submit}>
        {data && <p className="sub">{pack.minimum_message} You can withdraw Rs {moneyText(pack.withdrawable)}.</p>}
        <label htmlFor="withdraw-amount">Amount</label>
        <input id="withdraw-amount" inputMode="decimal" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <label htmlFor="withdraw-method">Method</label>
        <select id="withdraw-method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>{(pack.methods || ["JazzCash", "Easypaisa"]).map((name) => <option key={name}>{name}</option>)}</select>
        <label htmlFor="account-name">Account name</label>
        <input id="account-name" placeholder="Account name" value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} />
        <label htmlFor="account-number">Account number</label>
        <input id="account-number" placeholder="03xxxxxxxxx" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} />
        <button className="btn" style={{ marginTop: 10 }}>Submit</button>
        {error && <div className="error">{error}</div>}
      </form>
      <h2 className="sec-title" id="withdraw-page-history"><i /> Withdrawal History</h2>
      <WithdrawalHistory rows={withdrawalRows(data)} />
    </>
  );
}

export function Contact() {
  const { data } = useLoad("/api/user/contacts");
  return <><Back /><h2 className="page-title">Contact Us</h2><div className="list">{(data || []).map((c) => {
    const digits = String(c.whatsapp || "").replace(/\D/g, "");
    const href = c.number_type === "botim" ? `https://botim.me/${digits}` : `https://wa.me/${digits}`;
    return <a className="list-card" key={c.id} href={href} target="_blank" rel="noreferrer"><div><b>{c.name}</b><div className="sub">{c.number_type === "botim" ? "Botim" : "WhatsApp"} · {c.purpose || c.role}</div><div className="sub">{c.note}</div></div></a>;
  })}</div></>;
}

function fitScreenshot(file) {
  return new Promise((resolve) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const maxSide = 1600;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const pen = canvas.getContext("2d");
      pen.fillStyle = "#ffffff";
      pen.fillRect(0, 0, width, height);
      pen.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        resolve(blob ? new File([blob], "payment.jpg", { type: "image/jpeg" }) : file);
      }, "image/jpeg", 0.72);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    image.src = url;
  });
}

function planTone(name) {
  const key = String(name || "").toLowerCase();
  if (key.includes("gold")) return "#f5b301";
  if (key.includes("standard")) return "#a855f7";
  if (key.includes("super")) return "#ff4f9a";
  if (key.includes("premium")) return "#60a5fa";
  return "#ff4f9a";
}

function PlanBloom({ name, popular = false }) {
  return (
    <span className={popular ? "popular-bloom" : ""}>
      <SakuraIcon tone={planTone(name)} className="plan-sakura" />
    </span>
  );
}

function StepDots({ current }) {
  return <div className="step-dots" aria-label={`Step ${current} of 5`}>{[1, 2, 3, 4, 5].map((n) => <i key={n} className={n === current ? "on" : n < current ? "done" : ""}>{n}</i>)}</div>;
}

export function Deposit() {
  const { data, error, reload } = useLoad("/api/user/plans");
  const [planId, setPlanId] = useState("");
  const [sender, setSender] = useState("");
  const [payer, setPayer] = useState("");
  const [method, setMethod] = useState("");
  const [shot, setShot] = useState(null);
  const [shotUrl, setShotUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState("plan");
  const [opened, setOpened] = useState(false);
  useEffect(() => () => { if (shotUrl) URL.revokeObjectURL(shotUrl); }, [shotUrl]);
  useEffect(() => {
    if (!data || opened) return;
    const pending = data.pending_deposit;
    const upgrade = data.pending_upgrade;
    const waiting = (pending?.has_screenshot ? null : pending) || (upgrade?.has_screenshot ? null : upgrade);
    if (pending?.has_screenshot || upgrade?.has_screenshot) setStep("review");
    else if (waiting) {
      setPlanId(String(waiting.plan_id || ""));
      setSender(waiting.sender || "");
      setStep("pay");
    }
    const savedMethod = (waiting || pending || upgrade)?.method || "";
    const matched = (data.gateways || []).find((account) => savedMethod.toLowerCase().includes(account.name.toLowerCase()));
    setMethod((matched || data.gateways?.[0] || {}).name || "");
    setOpened(true);
  }, [data, opened]);
  if (error) return <p className="pad">{error}</p>;
  if (!data) return <p className="pad">Loading...</p>;
  const plans = (data.plans || []).filter((plan) => !data.current_plan || Number(plan.price) > Number(data.current_price || 0));
  const chosen = plans.find((plan) => String(plan.id) === String(planId)) || (data.plans || []).find((plan) => String(plan.id) === String(planId));
  const accounts = data.gateways || [];
  const selectedAccount = accounts.find((account) => account.name === method) || accounts[0];
  const priceOf = (plan) => data.current_plan ? (Number(plan.price) - Number(data.current_price || 0)).toFixed(2) : plan.price;
  const topPrice = Math.max(0, ...plans.map((plan) => Number(plan.price) || 0));
  const chooseShot = (e) => {
    const file = e.target.files && e.target.files[0];
    if (shotUrl) URL.revokeObjectURL(shotUrl);
    setShot(file || null);
    setShotUrl(file ? URL.createObjectURL(file) : "");
  };
  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!accounts.length || !selectedAccount) {
      setFormError("Payment account is not added yet.");
      return;
    }
    if (!sender.trim()) {
      setFormError("Enter the sender phone number.");
      return;
    }
    if (!shot) {
      setFormError("Payment screenshot is required.");
      return;
    }
    setSending(true);
    try {
      const picture = await fitScreenshot(shot);
      const body = new FormData();
      body.append("plan_id", planId);
      body.append("sender", payer.trim() ? `${payer.trim()} · ${sender.trim()}` : sender.trim());
      body.append("method", selectedAccount.name);
      body.append("screenshot", picture);
      await api("/api/user/deposits", { method: "POST", body });
      setStep("review");
      reload();
    } catch (err) { setFormError(err.message); }
    finally { setSending(false); }
  };
  const waitingPlan = data.pending_upgrade?.plan || data.pending_deposit?.plan || chosen?.name;
  const waitingAmount = data.pending_upgrade?.amount || data.pending_deposit?.amount || (chosen ? priceOf(chosen) : "");
  return (
    <div className="bloom-wallet pay-flow">
      <BlossomScene />
      {step === "review" ? (
        <section className="review-panel">
          <div className="review-bloom">
            <SakuraIcon className="wreath w1" />
            <SakuraIcon className="wreath w2" tone="#ffd0e6" />
            <SakuraIcon className="wreath w3" />
            <SakuraIcon className="wreath w4" tone="#fff" />
            <span className="review-shield" aria-hidden="true">✓</span>
          </div>
          <h1>Account Under Review</h1>
          <p>Step 5 of 5 · Your information is being verified by the team.</p>
          <StepDots current={5} />
          <article>
            <b>Transaction submitted successfully</b>
            <span>{waitingPlan ? `${waitingPlan} · Rs ${moneyText(waitingAmount)}` : "Payment received"}</span>
            <p>The new plan and task limit start only after admin approval.</p>
          </article>
          <Link className="btn" to="/app">Back to home</Link>
        </section>
      ) : step === "pay" && chosen ? (
        <form onSubmit={submit}>
          <h1>Deposit Confirmation</h1>
          <p className="muted">Step 3 of 5 · Complete your payment to activate the plan</p>
          <StepDots current={3} />
          <div className="selected-plan"><PlanBloom name={chosen.name} popular /><div><b>{chosen.name}</b><strong>Rs {moneyText(priceOf(chosen))}</strong><small>{chosen.daily_tasks} tasks per day</small></div></div>
          <h2>Payment instructions</h2>
          {selectedAccount ? (
            <div className="pay-account">
              {selectedAccount.image ? <img src={selectedAccount.image} alt="" /> : <PlanBloom name={selectedAccount.name} />}
              <div><b>{selectedAccount.name}</b><span>{selectedAccount.account_name || "Account name"}</span><strong>{selectedAccount.account_number}</strong></div>
              <button type="button" onClick={() => navigator.clipboard?.writeText(selectedAccount.account_number)}>Copy</button>
            </div>
          ) : <p>Payment account is not added yet.</p>}
          <label htmlFor="payer-name">Account name</label>
          <input id="payer-name" value={payer} onChange={(e) => setPayer(e.target.value)} placeholder="Your name" />
          <label htmlFor="sender-phone">Phone number</label>
          <input id="sender-phone" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="03xxxxxxxxx" inputMode="tel" />
          <h2>Upload payment proof</h2>
          <label className="file-pick">
            Choose file
            <input type="file" accept="image/*" onChange={chooseShot} />
          </label>
          {shotUrl && <img className="shot-preview" src={shotUrl} alt="Selected payment screenshot" />}
          {(data.pending_deposit && !data.pending_deposit.has_screenshot) || (data.pending_upgrade && !data.pending_upgrade.has_screenshot) ? <p className="lock-note">The payment is saved, but the screenshot did not upload. Choose the photo again, then submit.</p> : null}
          {formError && <div className="error">{formError}</div>}
          <div className="step-actions">
            <button type="button" className="btn ghost" onClick={() => setStep("plan")}>Back</button>
            <button className="btn" disabled={sending}>{sending ? "Sending..." : "Submit deposit"}</button>
          </div>
        </form>
      ) : (
        <div>
          <h1>{data.current_plan ? "Upgrade Your Plan" : "Choose Your Plan"}</h1>
          <p className="muted">{data.current_plan ? "Pay only the difference. The new plan starts after approval." : "Step 2 of 5 · Unlock more rewards with the right plan"}</p>
          <StepDots current={2} />
          <div className="plan-picks">
            {plans.map((plan) => (
              <button type="button" key={plan.id} className={String(planId) === String(plan.id) ? "on" : ""} onClick={() => setPlanId(plan.id)}>
                {Number(plan.price) === topPrice && plans.length > 1 && <em>Most popular</em>}
                <PlanBloom name={plan.name} popular={Number(plan.price) === topPrice && plans.length > 1} />
                <b>{plan.name}</b>
                <strong>Rs {moneyText(priceOf(plan))}</strong>
                <small>{plan.daily_tasks} tasks per day{data.current_plan ? " · additional payment" : ""}</small>
              </button>
            ))}
            {!plans.length && <p>You are already on the highest plan.</p>}
          </div>
          <h2>Select payment method</h2>
          <div className="method-picks">
            {accounts.map((account) => (
              <button type="button" key={account.id || account.name} className={method === account.name ? "on" : ""} onClick={() => setMethod(account.name)}>
                {account.image ? <img src={account.image} alt="" /> : <PlanBloom name={account.name} />}
                {account.name}
              </button>
            ))}
            {!accounts.length && <p>Payment account is not added yet.</p>}
          </div>
          {formError && <div className="error">{formError}</div>}
          {!!plans.length && <button className="btn" type="button" onClick={() => { if (!planId) { setFormError("Choose a plan."); return; } setFormError(""); setStep("pay"); }}>Continue to payment</button>}
        </div>
      )}
    </div>
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

export function Impersonate() {
  const navigate = useNavigate();
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code") || "";
    api("/api/auth/impersonate", { method: "POST", body: { code } }).then((res) => {
      sessionStorage.setItem("flower_token", res.token);
      sessionStorage.setItem("flower_user", JSON.stringify(res.user));
      navigate("/app");
    }).catch(() => navigate("/login"));
  }, [navigate]);
  return <p className="pad">Opening the user dashboard...</p>;
}

function BloomAuth({ children }) {
  return (
    <div className="bloom-stage">
      <BlossomScene />
      <div className="bloom-auth">
      <BlossomScene />
      <header className="user-bar brand-bar">
        <span className="burger" aria-hidden="true"><span /><span /><span /></span>
        <div className="brand-lockup"><FlowerMark /><b>Flowers</b><FlowerMark /></div>
        <span className="brand-flower"><FlowerMark /></span>
      </header>
      {children}
      </div>
    </div>
  );
}

export function Login({ role = "user" }) {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const expired = new URLSearchParams(window.location.search).get("expired");
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api("/api/auth/login", { method: "POST", body: { identity, password, role } });
      const store = remember ? localStorage : sessionStorage;
      sessionStorage.removeItem("flower_token");
      sessionStorage.removeItem("flower_user");
      localStorage.removeItem("flower_token");
      localStorage.removeItem("flower_user");
      store.setItem("flower_token", res.token);
      store.setItem("flower_user", JSON.stringify(res.user));
      if (res.session_key) localStorage.setItem("flower_admin_session", res.session_key);
      navigate(role === "admin" ? "/admin" : "/app");
    } catch (err) { setError(err.message); }
  };
  if (role === "admin") {
    return (
      <AuthShell>
        <form className="card" onSubmit={submit}>
          <h2>Admin login</h2>
          <p className="muted">Open the Flower admin dashboard</p>
          <label htmlFor="identity">Email, username, or phone</label>
          <input id="identity" value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="name@email.com" autoComplete="username" />
          <label htmlFor="password">Password</label>
          <PasswordField id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" />
          <button className="btn" style={{ marginTop: 18 }}>Sign in</button>
          {error && <div className="error">{error}</div>}
        </form>
      </AuthShell>
    );
  }
  return (
    <BloomAuth>
      <form className="bloom-auth-card" onSubmit={submit}>
        <span className="welcome-bloom" aria-hidden="true"><SakuraIcon /></span>
        <h1>Welcome Back!</h1>
        <p>Sign in to your Flowers account</p>
        <label htmlFor="identity">Username or email</label>
        <input id="identity" value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="Username or email" autoComplete="username" />
        <label htmlFor="password">Password</label>
        <PasswordField id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" />
        <label className="remember"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
        <button className="btn">Sign in</button>
        {error && <div className="error">{error}</div>}
        {!error && expired && <div className="error">Your session ended. Please sign in again.</div>}
        <p className="auth-switch">Don't have an account? <Link to="/register">Create an account</Link></p>
      </form>
    </BloomAuth>
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
    <BloomAuth>
      <form className="bloom-auth-card" onSubmit={submit}>
        <h1>Create Your Flowers Account</h1>
        <p>Step 1 of 5 · Basic information</p>
        <StepDots current={1} />
        <label htmlFor="full_name">Full name</label>
        <input id="full_name" placeholder="Enter your full name" value={form.full_name} onChange={set("full_name")} autoComplete="name" />
        <label htmlFor="phone">Phone number</label>
        <input id="phone" placeholder="03xxxxxxxxx" value={form.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" />
        <label htmlFor="email">Email address</label>
        <input id="email" placeholder="Enter your email address" value={form.email} onChange={set("email")} autoComplete="email" inputMode="email" />
        <label htmlFor="new-password">Password</label>
        <PasswordField id="new-password" value={form.password} onChange={set("password")} placeholder="At least 6 characters" autoComplete="new-password" />
        <label htmlFor="referral">Referral code</label>
        <input id="referral" placeholder="Optional" value={form.referral} onChange={set("referral")} />
        <button className="btn">Next</button>
        {error && <div className="error">{error}</div>}
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </BloomAuth>
  );
}
