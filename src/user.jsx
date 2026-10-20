import { useEffect, useRef, useState } from "react";
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
    ["/app/wallet", "My Wallet", "My Wallet"],
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
          Dashboard
        </NavLink>
        <NavLink to="/app/work">
          <span className="dock-ico"><DashIcon name="task" /></span>
          Work
        </NavLink>
        <NavLink to="/app/wallet" className={({ isActive }) => (isActive ? "dock-main active" : "dock-main")}>
          <span className="dock-ico"><DashIcon name="wallet" /></span>
          Wallet
        </NavLink>
        <NavLink to="/app/rewards">
          <span className="dock-ico"><DashIcon name="level" /></span>
          Levels
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

function FlowerMark() {
  const petals = [[44, 18], [70, 36], [60, 64], [28, 64], [18, 36]];
  return (
    <svg className="flower-mark" viewBox="0 0 88 88" aria-hidden="true">
      {petals.map(([cx, cy], index) => (
        <circle key={cx + cy} className="petal" cx={cx} cy={cy} r="14" fill="#ffd6ea" style={{ animationDelay: `${index * 0.12}s` }} />
      ))}
      <circle className="flower-core" cx="44" cy="40" r="13" fill="#ffb703" />
      <circle className="flower-heart" cx="44" cy="40" r="6" fill="#f59e0b" />
    </svg>
  );
}

function TeamBoard({ home, copied, onCopy }) {
  const user = home.user || {};
  return (
    <div className="team-board">
      <section className="team-hero">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <FlowerMark />
        <h1>My Team</h1>
        <p>Grow your team and earn more rewards</p>
        <div className="team-pills">
          <span><WalletGlyph name="people" /> {home.team_total || 0} Total</span>
          <span><WalletGlyph name="check" /> {home.active_team || 0} Active</span>
          <span><WalletGlyph name="clock" /> {Math.max(0, (home.team_total || 0) - (home.active_team || 0))} Pending</span>
        </div>
        <div className="level-pill"><WalletGlyph name="layers" /> Level {user.level || 0}</div>
      </section>
      <div className="stat-row team-stats">
        <article className="wstat"><b>{home.team_total || 0}</b><span>Referred</span></article>
        <article className="wstat"><b>{home.active_team || 0}</b><span>Active</span></article>
        <article className="wstat"><b>{home.daily_limit || 0}</b><span>Task limit</span></article>
      </div>
      <section className="ref-card">
        <div className="ref-kicker"><WalletGlyph name="link" /> Your referral link</div>
        <div className="ref-row">
          <input readOnly value={home.referral_link || ""} aria-label="Referral link" />
          <button type="button" onClick={onCopy}>{copied ? "Copied" : "Copy"}</button>
        </div>
      </section>
    </div>
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
  const user = data.user;
  const menus = [
    ["/app/work", "task", "#ecfdf5", "#047857", "Work"],
    ["/app/wallet", "wallet", "#fff0f6", "#e91e8c", "Wallet"],
    ["/app/rewards", "level", "#fef3c7", "#b45309", "Levels & Rewards"],
    ["/app/team", "team", "#fce7f3", "#be185d", "My Team"],
    ["/app/channels", "ads", "#fff7ed", "#c2410c", "Official Channels"],
    ["/app/withdraw", "withdraw", "#f3e8ff", "#7c3aed", "Withdraw"],
  ];
  return (
    <div className="dash">
      <section className="home-id">
        <h1>{user.full_name}</h1>
        <p>{user.email}</p>
        <button type="button" onClick={copy}>{copied ? "Copied" : "Copy Referral Link"}</button>
      </section>
      <LevelStatus data={data} />
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
      <Link className="btn contact" to="/app/contact">Contact Task</Link>
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
  const next = progress.next_level ? `${progress.joinings} / ${progress.next_required} for Level ${progress.next_level}` : "Level 8 complete";
  return (
    <section className="level-status">
      <article><span>Current Level</span><b>Level {progress.level || 0}</b></article>
      <article><span>Next level joinings</span><b>{next}</b></article>
      <article><span>Current Balance</span><b>Rs {moneyText(data.user.balance)}</b><small>Task earnings</small></article>
      <article><span>Flower Earnings</span><b>Rs {moneyText(progress.flower_balance)}</b><small>{progress.flower_locked ? "Locked until Level 8" : "Unlocked"}</small></article>
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
      setNote("Open the flower above this one first.");
      return;
    }
    busy.current = true;
    setNote("");
    setOpeningSlot(task.slot);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      if (!reduce) await wait(920);
      if (!alive.current) return;
      const result = await api(`/api/user/tasks/${task.id}/complete`, { method: "POST" });
      if (!alive.current) return;
      setRewardPop({ slot: task.slot, amount: result.reward });
      if (!reduce) await wait(680);
      await reload();
    } catch (err) {
      if (alive.current) setNote(err.message);
    } finally {
      busy.current = false;
      if (alive.current) {
        setOpeningSlot(null);
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
  return (
    <div className="task-room">
      <Back />
      <section className="task-hero">
        <span className="drift d1" />
        <span className="drift d2" />
        <span className="drift d3" />
        <p>Task Room</p>
        <h2>{doneCount >= limit && limit > 0 ? "Today's flowers are open" : "Open today's flowers"}</h2>
        <div className="task-pills">
          <span>Level {progress.level || 0}</span>
          <span>Rs {progress.task_rate} each</span>
          <span>{doneCount}/{limit} open</span>
        </div>
        <div className="task-meter" aria-hidden="true"><i style={{ width: `${meter}%` }} /></div>
      </section>
      {progress.locked && progress.message ? <LockAlert message={progress.message} shake={shake} /> : progress.message ? <p className="task-note">{progress.message}</p> : null}
      {note && note !== progress.message && <p className="task-note locked">{note}</p>}
      <ol className="task-vine">
        {tasks.map((task, index) => {
          const mode = modeFor(task);
          return (
            <li key={task.slot} className={`task-node is-${mode}`} style={{ animationDelay: `${index * 80}ms` }}>
              <button
                type="button"
                className="task-hit"
                disabled={mode === "done" || mode === "opening"}
                onClick={() => finish(task)}
              >
                <span className="bloom-wrap">
                  <TaskBloom mode={mode} tone={FLOWER_TONES[index % FLOWER_TONES.length]} />
                  {rewardPop && rewardPop.slot === task.slot && <b className="reward-float">+ Rs {rewardPop.amount}</b>}
                </span>
                <span className="task-copy">
                  <b>{task.title}</b>
                  <span>{task.detail}</span>
                  <em>{mode === "done" ? "Opened" : mode === "opening" ? "Opening..." : `Rs ${task.reward}`}</em>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {tasks.length === 0 && <p className="task-note">No task is available right now.</p>}
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

function WithdrawalHistory({ rows }) {
  return (
    <div className="list withdraw-history" id="history">
      {(rows || []).map((row) => (
        <article className="withdraw-card" key={row.id}>
          <div>
            <b>Rs {moneyText(row.amount)}</b>
            <div className="sub">{new Date(row.created_at).toLocaleString()}</div>
            <div className="sub">{[row.method, row.account_name, row.account].filter(Boolean).join(" · ")}</div>
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
  const location = useLocation();
  useEffect(() => {
    if (location.hash !== "#history") return;
    document.getElementById("history")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash, history.data]);
  if (home.error) return <p className="pad">{home.error}</p>;
  if (!home.data) return <p className="pad wallet-loading">Loading wallet...</p>;
  const wallet = home.data.wallet || {};
  const stats = [
    ["clock", "wait", "Pending Withdrawal", moneyCompact(wallet.pending)],
    ["x", "no", "Rejected Withdrawal", moneyCompact(wallet.rejected)],
  ];
  const actions = [
    ["/app/plans", "plus", "go", "Deposit"],
    ["/app/withdraw", "up", "out", "Withdraw"],
    ["/app/transactions", "list", "hist", "History"],
    ["/app/wallet#history", "clock", "whist", "W. History"],
  ];
  return (
    <div className="wallet-page">
      <section className="bal-hero">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <p>Current balance</p>
        <h1>Rs {moneyText(home.data.user.balance)}</h1>
        <p className="bal-note">{home.data.progress?.flower_locked ? "Flower Earnings stay locked until Level 8." : "Level 8 is open, so Flower Earnings can be withdrawn with Current Balance."}</p>
        <div className="bal-actions">
          <Link className="pill solid" to="/app/withdraw"><WalletGlyph name="up" /> Withdraw</Link>
          <Link className="pill line" to="/app/plans"><WalletGlyph name="plus" /> Deposit</Link>
        </div>
      </section>
      <div className="stat-row two">
        {stats.map(([icon, tone, label, value]) => (
          <article className="wstat" key={label}>
            <span className={`tone ${tone}`}><WalletGlyph name={icon} /></span>
            <b>Rs {value}</b>
            <span>{label}</span>
          </article>
        ))}
      </div>
      <h2 className="sec-title"><i /> My Earnings</h2>
      <div className="earn-pair three">
        <article className="earn-tile">
          <span className="soft-ico people"><WalletGlyph name="people" /></span>
          <div>
            <b>Rs {moneyText(wallet.staff)}</b>
            <span>Staff Earning</span>
          </div>
        </article>
        <article className="earn-tile">
          <span className="soft-ico people"><WalletGlyph name="layers" /></span>
          <div>
            <b>Rs {moneyText(wallet.indirect)}</b>
            <span>Indirect Referral Earning</span>
            <small>Level 2 Rs {moneyText(wallet.indirect_level2)} · Level 3 Rs {moneyText(wallet.indirect_level3)}</small>
          </div>
        </article>
        <article className="earn-tile">
          <span className="soft-ico bloom"><WalletGlyph name="sprout" /></span>
          <div>
            <b>Rs {moneyText(wallet.flowers)}</b>
            <span>Flower Earning <span aria-hidden="true">🌸</span></span>
            <small>{wallet.flower_locked ? "Locked until Level 8. Not part of Current Balance." : "Unlocked for withdrawal."}</small>
          </div>
        </article>
      </div>
      <article className="today-box">
        <span>Today Approved Withdrawal</span>
        <strong>Rs {moneyText(wallet.approved_today)}</strong>
        <p>Approved today only. Pending and rejected amounts stay out of this total.</p>
      </article>
      <h2 className="sec-title"><i /> Quick Actions</h2>
      <div className="quick-row">
        {actions.map(([to, icon, tone, label]) => (
          <Link key={label} to={to}>
            <span className={`qa ${tone}`}><WalletGlyph name={icon} /></span>
            {label}
          </Link>
        ))}
      </div>
      <h2 className="sec-title"><i /> Withdrawal History</h2>
      <WithdrawalHistory rows={history.data} />
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
  const home = useLoad("/api/user/home");
  const { data } = useLoad("/api/user/team");
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!home.data?.referral_link) return;
    await navigator.clipboard.writeText(home.data.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <>
      {home.error ? <p className="pad">{home.error}</p> : home.data ? <TeamBoard home={home.data} copied={copied} onCopy={copy} /> : <p className="pad">Loading...</p>}
      <h2 className="sec-title"><i /> Members</h2>
      {(data || []).length === 0 && <p className="pad">No active members yet.</p>}
      <div className="list">{(data || []).map((m) => (
        <div className="list-card" key={m.id}><div><b>{m.full_name}</b><div className="sub">Level {m.level || 0}</div></div><span className="badge" style={{ background: "#d1fae5", color: "#065f46" }}>Active</span></div>
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
  const { data, reload } = useLoad("/api/user/withdrawals");
  const [form, setForm] = useState({ amount: "", method: "JazzCash", account_name: "", account: "" });
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try { await api("/api/user/withdrawals", { method: "POST", body: form }); setForm({ ...form, amount: "", account_name: "", account: "" }); setError(""); reload(); } catch (err) { setError(err.message); }
  };
  return (
    <>
      <Back to="/app/wallet" label="Wallet" />
      <h2 className="page-title">Withdraw</h2>
      <form className="pad" onSubmit={submit}>
        <label htmlFor="withdraw-amount">Amount</label>
        <input id="withdraw-amount" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <label htmlFor="withdraw-method">Method</label>
        <select id="withdraw-method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}><option>JazzCash</option><option>Easypaisa</option></select>
        <label htmlFor="account-name">Account name</label>
        <input id="account-name" placeholder="Account name" value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} />
        <label htmlFor="account-number">Account number</label>
        <input id="account-number" placeholder="03xxxxxxxxx" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} />
        <button className="btn" style={{ marginTop: 10 }}>Submit</button>
        {error && <div className="error">{error}</div>}
      </form>
      <h2 className="sec-title" id="withdraw-page-history"><i /> Withdrawal History</h2>
      <WithdrawalHistory rows={data} />
    </>
  );
}

export function Contact() {
  const { data } = useLoad("/api/user/contacts");
  return <><Back /><h2 className="page-title">Contact Tasks</h2><div className="list">{(data || []).map((c) => <a className="list-card" key={c.id} href={`https://wa.me/${c.whatsapp}`}><div><b>{c.name}</b><div className="sub">{c.role}</div><div className="sub">{c.note}</div></div></a>)}</div></>;
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

export function Deposit() {
  const { data, error, reload } = useLoad("/api/user/plans");
  const [planId, setPlanId] = useState("");
  const [method, setMethod] = useState("JazzCash");
  const [sender, setSender] = useState("");
  const [shot, setShot] = useState(null);
  const [shotUrl, setShotUrl] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const pending = data?.pending_deposit;
  const pendingUpgrade = data?.pending_upgrade;
  useEffect(() => () => { if (shotUrl) URL.revokeObjectURL(shotUrl); }, [shotUrl]);
  useEffect(() => {
    const waiting = pending?.has_screenshot ? null : pending || (pendingUpgrade?.has_screenshot ? null : pendingUpgrade);
    if (!waiting) return;
    setPlanId((current) => current || String(waiting.plan_id || ""));
    if (waiting.method) setMethod(waiting.method);
    setSender((current) => current || waiting.sender || "");
  }, [pending, pendingUpgrade]);
  if (error) return <p className="pad">{error}</p>;
  if (!data) return <p className="pad">Loading...</p>;
  const chosen = (data.plans || []).find((plan) => String(plan.id) === String(planId));
  const chooseShot = (e) => {
    const file = e.target.files && e.target.files[0];
    if (shotUrl) URL.revokeObjectURL(shotUrl);
    setShot(file || null);
    setShotUrl(file ? URL.createObjectURL(file) : "");
  };
  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    setMessage("");
    if (!shot) {
      setFormError("Payment screenshot is required.");
      return;
    }
    setSending(true);
    try {
      const picture = await fitScreenshot(shot);
      const body = new FormData();
      body.append("plan_id", planId);
      body.append("sender", sender);
      body.append("method", method);
      body.append("screenshot", picture);
      const res = await api("/api/user/deposits", { method: "POST", body });
      setMessage(res.kind === "upgrade" ? "Upgrade request sent. Admin will approve it." : "Payment sent. Admin will approve your plan.");
      setPlanId("");
      setSender("");
      setShot(null);
      if (shotUrl) URL.revokeObjectURL(shotUrl);
      setShotUrl("");
      e.target.reset();
      reload();
    } catch (err) { setFormError(err.message); }
    finally { setSending(false); }
  };
  return (
    <>
      <Back />
      <div className="hero"><h1>Plan Upgrade</h1><p>Pay with JazzCash or Easypaisa. The plan starts after admin approval.</p></div>
      {data.current_plan && <p className="pad">Current plan: <b>{data.current_plan}</b></p>}
      {data.pending_deposit && <p className="pad">Waiting approval: {data.pending_deposit.plan} · Rs {data.pending_deposit.amount}</p>}
      {data.pending_upgrade && <p className="pad">Upgrade waiting: {data.pending_upgrade.plan} · Rs {data.pending_upgrade.amount}</p>}
      {(data.pending_deposit && !data.pending_deposit.has_screenshot) || (data.pending_upgrade && !data.pending_upgrade.has_screenshot) ? <p className="pad lock-note">The payment is saved, but the screenshot did not upload. Choose the photo again. Wait until its preview appears, then submit.</p> : null}
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
      <form className="pad plan-form" onSubmit={submit}>
        <label>Selected plan</label>
        <input readOnly value={chosen ? `${chosen.name} · Rs ${chosen.price}` : "Tap a plan above"} />
        <label>Method</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)}><option>JazzCash</option><option>Easypaisa</option></select>
        <label>Sender number</label>
        <input placeholder="03xxxxxxxxx" value={sender} onChange={(e) => setSender(e.target.value)} />
        <label>Payment screenshot</label>
        <input name="screenshot" type="file" accept="image/*" onChange={chooseShot} />
        {shotUrl && <img className="shot-preview" src={shotUrl} alt="Selected payment screenshot" />}
        <button className="btn" style={{ marginTop: 14 }} disabled={sending}>{sending ? "Sending..." : data.current_plan ? "Request upgrade" : "Submit payment"}</button>
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
