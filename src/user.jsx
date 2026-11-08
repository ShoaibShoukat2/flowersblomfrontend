import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { api, clearSession, LOGO, savedUser, setSession } from "./api";

function useLoad(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const reload = useCallback(() => api(path).then(setData).catch((e) => setError(e.message)), [path]);
  useEffect(() => { reload(); }, [reload]);
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
    copy: "M8 8h11v12H8zM5 16H4V4h12v2",
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

function clockParts(total) {
  const left = Math.max(0, Number(total) || 0);
  const hours = Math.floor(left / 3600);
  const minutes = Math.floor((left % 3600) / 60);
  const seconds = left % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0"));
}

function clockText(total) {
  return clockParts(total).join(":");
}

function ReviewBoard({ detail, countdown, children }) {
  const [hours, minutes, seconds] = countdown == null ? [] : clockParts(countdown);
  return (
    <section className="review-board">
      <img className="shop-bloom top" src="/dash/banner-blossom.jpg" alt="" />
      <img className="shop-bloom bottom" src="/dash/banner-blossom.jpg" alt="" />
      <div className="review-badge" aria-hidden="true"><span>✓</span></div>
      <h1>Account Under Review</h1>
      <p>Your information is being verified by our team</p>
      <ol className="review-track">
        <li className="done"><i>✓</i><span>Payment Submitted</span></li>
        <li className="on"><i /><span>Under Review</span></li>
        <li><i /><span>Verification Complete</span></li>
      </ol>
      <article className="review-note">
        <b>Transaction Submitted Successfully!</b>
        <p>{detail || "We are reviewing your information. If your details are correct, your account will be approved. Otherwise, it will be rejected with a notification."}</p>
      </article>
      {countdown != null && (
        <article className="count-card">
          <b><i /> Approval Countdown</b>
          <small>Estimated approval time:</small>
          <div>
            <span><strong>{hours}</strong>Hours</span>
            <span><strong>{minutes}</strong>Minutes</span>
            <span><strong>{seconds}</strong>Seconds</span>
          </div>
        </article>
      )}
      <p className="safe-note"><i>✓</i> Keep your payment details safe and do not share with anyone.</p>
      {children}
    </section>
  );
}

function BanBoard({ reason }) {
  return (
    <section className="review-board rejected-board ban-board">
      <div className="review-badge bad" aria-hidden="true"><span>!</span></div>
      <h1>Your Account Has Been Banned</h1>
      <p>This account cannot open the dashboard or tasks while the ban is active.</p>
      <article className="review-note reject-reason">
        <b>Ban reason</b>
        <p>{reason || "No ban reason was saved."}</p>
      </article>
      <button className="btn ghost" type="button" onClick={() => { clearSession(); window.location.href = "/login"; }}>Logout</button>
    </section>
  );
}

function ChannelCards({ channels, onDone, busy, error }) {
  const [joined, setJoined] = useState(false);
  return (
    <div className="channel-gate">
      {(channels || []).map((channel) => (
        <a className="channel-card" key={channel.id || channel.title} href={channel.link || "#"} target="_blank" rel="noopener noreferrer">
          {channel.image ? <img className="channel-ico" src={channel.image} alt="" /> : <span className="channel-ico channel-fallback" aria-hidden="true">📢</span>}
          <div className="channel-copy">
            <b>{channel.title}</b>
            <span>{channel.purpose || channel.description || "Official channel"}</span>
          </div>
          <em>Join</em>
        </a>
      ))}
      {(channels || []).length === 0 && <p>Official channel links are not added yet.</p>}
      <label className="remember channel-check">
        <input type="checkbox" checked={joined} onChange={(e) => setJoined(e.target.checked)} />
        I confirm I have joined both official channels.
      </label>
      {error && <div className="error">{error}</div>}
      <button className="pay-go" type="button" disabled={!joined || busy} onClick={onDone}>{busy ? "Saving..." : "I Have Joined Both Channels"}</button>
    </div>
  );
}

function JoinGate({ gate, onChange }) {
  const [closed, setClosed] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const confirm = async () => {
    setSending(true);
    setError("");
    try {
      await api("/api/user/channels/confirm", { method: "POST", body: { joined: true } });
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };
  if (closed) {
    return (
      <section className="review-board">
        <h1>Official channels are required</h1>
        <p>The dashboard stays closed until both official channels are joined.</p>
        <button className="pay-go" type="button" onClick={() => setClosed(false)}>Open channels</button>
      </section>
    );
  }
  return (
    <section className="review-board channel-pop">
      <button className="modal-x" type="button" aria-label="Close" onClick={() => setClosed(true)}>×</button>
      <h1>Official Channels</h1>
      <p>Join both channels, then confirm. This step opens after admin approval.</p>
      <ChannelCards channels={gate.channels} onDone={confirm} busy={sending} error={error} />
    </section>
  );
}

function RejectedBoard({ gate, onResubmit }) {
  return (
    <section className="review-board rejected-board">
      <div className="review-badge bad" aria-hidden="true"><span>!</span></div>
      <h1>Your Account Has Been Rejected</h1>
      <p>Your payment could not be approved. Read the reason below, then resubmit the correct plan and payment.</p>
      <article className="review-note reject-reason">
        <b>Rejection reason</b>
        <p>{gate?.reject_reason || "No rejection reason was saved."}</p>
      </article>
      <button className="pay-go" type="button" onClick={onResubmit}>Resubmit</button>
      <button className="btn ghost" type="button" onClick={() => { clearSession(); window.location.href = "/login"; }}>Logout</button>
    </section>
  );
}

function PendingHold({ gate }) {
  const [left, setLeft] = useState(gate.remaining_seconds || 0);
  useEffect(() => { setLeft(gate.remaining_seconds || 0); }, [gate.remaining_seconds, gate.phase]);
  useEffect(() => {
    const id = setInterval(() => setLeft((value) => (value > 0 ? value - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <ReviewBoard
      countdown={left}
      detail={left > 0
        ? "We are reviewing your information. If your details are correct, your account will be approved. Otherwise, it will be rejected with a notification."
        : "The 4 hours are complete. Your account stays pending until an admin approves it."}
    >
      <button className="btn ghost" type="button" onClick={() => { clearSession(); window.location.href = "/login"; }}>Logout</button>
    </ReviewBoard>
  );
}

export function UserShell({ children }) {
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const [profile, setProfile] = useState(false);
  const [notice, setNotice] = useState("");
  const location = useLocation();
  const gateLoad = useLoad("/api/user/gate");
  const gate = gateLoad.data;
  const phase = gate?.phase;
  const holding = phase === "timer";
  const joining = phase === "join_channels";
  const banned = phase === "banned";
  const planRoute = location.pathname === "/app/deposit" || location.pathname === "/app/plans";
  const [resubmit, setResubmit] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!holding) return undefined;
    const id = setInterval(() => gateLoad.reload(), 15000);
    return () => clearInterval(id);
  }, [holding, gateLoad.reload]);
  const meta = pageInfo(location.pathname);
  const session = savedUser();
  useEffect(() => { setOpen(false); setBell(false); setProfile(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    if (phase !== "rejected") setResubmit(false);
  }, [phase]);
  useEffect(() => {
    const refresh = () => gateLoad.reload();
    window.addEventListener("account-gate-refresh", refresh);
    return () => window.removeEventListener("account-gate-refresh", refresh);
  }, [gateLoad.reload]);
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
            <div className="brand-stack">
              <div className="brand-word">
                <FlowerMark emoji="🌸" className="flower-emoji brand-emoji" />
                <b>Flowers</b>
                <FlowerMark emoji="🌸" className="flower-emoji brand-emoji" />
              </div>
              <small>Grow Together • Earn Together</small>
            </div>
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
          {brandBar ? (
            <button className="avatar-btn" aria-label="Account menu" aria-expanded={profile} onClick={() => { setProfile((v) => !v); setBell(false); }}>
              <FlowerMark emoji="🌸" className="flower-emoji brand-emoji" />
            </button>
          ) : (
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
      <div className="user-body">
        {gateLoad.error ? <p className="pad">{gateLoad.error}</p> : null}
        {!gate && !gateLoad.error ? <p className="pad">Loading...</p> : null}
        {banned ? <BanBoard reason={gate.reason || gate.reject_reason} /> : null}
        {joining ? <JoinGate gate={gate} onChange={gateLoad.reload} /> : null}
        {holding ? <PendingHold gate={gate} /> : null}
        {gate && phase === "rejected" && !resubmit ? <RejectedBoard gate={gate} onResubmit={() => { setResubmit(true); navigate("/app/deposit"); }} /> : null}
        {gate && phase === "choose_plan" && !planRoute ? <Navigate to="/app/deposit" replace /> : null}
        {gate && phase === "rejected" && resubmit && !planRoute ? <Navigate to="/app/deposit" replace /> : null}
        {gate && !holding && !joining && !banned && (phase === "approved" || (phase === "choose_plan" && planRoute) || (phase === "rejected" && resubmit && planRoute)) ? children : null}
      </div>
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
          <span className="dock-ico"><SakuraIcon className="dock-flower" /></span>
          Garden
        </NavLink>
        <NavLink to="/app/rewards">
          <span className="dock-ico"><DashIcon name="gift" /></span>
          Rewards
        </NavLink>
        <button type="button" className={open ? "on" : ""} onClick={() => setOpen(true)}>
          <span className="dock-ico"><DashIcon name="grid" /></span>
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
  if (name === "bolt") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13 2 4.5 13.5H11L10 22l9.5-12.5H13.5L13 2z" fill="currentColor" />
      </svg>
    );
  }
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
    gift: "M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9zM3 7h18v4H3zM12 7v14M12 7c-1.6-3.2-5.2-3.4-5.2-.6C6.8 8.2 9.4 7 12 7zM12 7c1.6-3.2 5.2-3.4 5.2-.6C17.2 8.2 14.6 7 12 7z",
    grid: "M5 5h5.2v5.2H5zM13.8 5H19v5.2h-5.2zM5 13.8h5.2V19H5zM13.8 13.8H19V19h-5.2z",
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

function CrownMark() {
  return (
    <svg className="name-crown" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 16.5 5.2 8l4.2 3.4L12 5l2.6 6.4L19 8l2 8.5H3z" fill="#f6c445" stroke="#e09a12" strokeWidth="1" strokeLinejoin="round" />
      <path d="M4 18.2h16v1.8H4z" fill="#f6c445" />
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

const SHOP_ART = {
  blue: "/dash/flower-blue.png",
  gold: "/dash/flower-gold.png",
  magenta: "/dash/flower-magenta.png",
  pink: "/dash/flower-pink.png",
  crown: "/dash/crown.png",
  glow: "/dash/banner-glow.jpg",
  blossom: "/dash/banner-blossom.jpg",
};

function flowerTitle(name) {
  const text = String(name || "Plan").trim();
  return /flower/i.test(text) ? text : `Flower ${text}`;
}

function planRank(name) {
  const key = String(name || "").toLowerCase();
  if (key.includes("super")) return 5;
  if (key.includes("premium")) return 4;
  if (key.includes("standard")) return 3;
  if (key.includes("gold")) return 2;
  if (key.includes("basic")) return 1;
  return 6;
}

function shopTone(name) {
  const key = String(name || "").toLowerCase();
  if (key.includes("gold")) return "gold";
  if (key.includes("standard")) return "standard";
  if (key.includes("basic")) return "basic";
  return "premium";
}

const PLAN_FLOWERS = [
  [/super/i, "🌺", "Hibiscus"],
  [/premium/i, "🌹", "Rose"],
  [/gold/i, "🌻", "Sunflower"],
  [/standard/i, "🌷", "Tulip"],
  [/basic/i, "🌸", "Cherry Blossom"],
];
const SPARE_FLOWERS = [["🌼", "Daisy"], ["🪻", "Lavender"], ["🪷", "Lotus"], ["🏵️", "Marigold"], ["💐", "Bouquet"]];

function planFlower(name, index = 0) {
  const hit = PLAN_FLOWERS.find(([pattern]) => pattern.test(String(name || "")));
  if (hit) return { emoji: hit[1], flower: hit[2] };
  const spare = SPARE_FLOWERS[index % SPARE_FLOWERS.length];
  return { emoji: spare[0], flower: spare[1] };
}

function FlowerMark({ emoji = "🌸", className = "flower-emoji" }) {
  return <span className={`${className} sway`} aria-hidden="true">{emoji}</span>;
}

function taskLine(count) {
  const total = Number(count) || 0;
  return `${total} task${total === 1 ? "" : "s"} per day`;
}

function WalletBadge() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="6" y="14" width="36" height="24" rx="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M10 14v-2.5A4.5 4.5 0 0 1 14.5 7h19A4.5 4.5 0 0 1 38 11.5V14" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="33" cy="26" r="2.4" fill="currentColor" />
    </svg>
  );
}

function PackageShop({ data, onProceed, notice }) {
  const navigate = useNavigate();
  const [planId, setPlanId] = useState("");
  const [method, setMethod] = useState("");
  const [formError, setFormError] = useState("");
  useEffect(() => {
    if (!data) return;
    const rows = [...(data.plans || [])].sort((a, b) => planRank(a.name) - planRank(b.name) || Number(a.price) - Number(b.price));
    const featured = rows.find((plan) => /super/i.test(plan.name)) || [...rows].sort((a, b) => Number(b.price) - Number(a.price))[0];
    const accounts = data.gateways || [];
    const easy = accounts.find((account) => /easypaisa/i.test(account.name));
    setPlanId((current) => current || (featured ? String(featured.id) : ""));
    setMethod((current) => current || String((easy || accounts[0] || {}).id || ""));
  }, [data]);
  if (!data) return <p className="pad">Loading...</p>;
  const rows = [...(data.plans || [])]
    .sort((a, b) => planRank(a.name) - planRank(b.name) || Number(a.price) - Number(b.price));
  const featured = rows.find((plan) => String(plan.id) === String(planId) && /super/i.test(plan.name))
    || rows.find((plan) => /super/i.test(plan.name))
    || rows[rows.length - 1];
  const grid = rows.filter((plan) => !featured || String(plan.id) !== String(featured.id));
  const accounts = data.gateways || [];
  const reviewing = Boolean(data.pending_deposit?.has_screenshot || data.pending_upgrade?.has_screenshot);
  const proceed = () => {
    if (reviewing) {
      if (onProceed) onProceed({ step: "review" });
      else navigate("/app/deposit");
      return;
    }
    if (!planId) {
      setFormError("Choose a package.");
      return;
    }
    if (!accounts.length || !method) {
      setFormError("Select a payment method.");
      return;
    }
    const picked = rows.find((plan) => String(plan.id) === String(planId));
    if (data.current_plan && picked && Number(picked.price) <= Number(data.current_price || 0)) {
      setFormError("Choose a higher package than your current plan.");
      return;
    }
    setFormError("");
    if (onProceed) onProceed({ planId: String(planId), gateway: String(method), step: "pay" });
    else navigate(`/app/deposit?plan=${encodeURIComponent(planId)}&gateway=${encodeURIComponent(method)}`);
  };
  return (
    <div className="home-shop">
      <section className="deposit-intro">
        <i aria-hidden="true"><WalletBadge /></i>
        <div>
          <b>Deposit Funds</b>
          <span>Select a package to add funds to your account</span>
        </div>
      </section>
      <header className="pack-head">
        <h2>Choose Your Package</h2>
        <p>Select the best plan for your growth</p>
      </header>
      <div className="pack-grid">
        {grid.map((plan, index) => {
          const bloom = planFlower(plan.name, index);
          return (
          <button
            key={plan.id}
            type="button"
            className={`pack-card tone-${shopTone(plan.name)}${String(planId) === String(plan.id) ? " on" : ""}`}
            onClick={() => { setPlanId(String(plan.id)); setFormError(""); }}
          >
            <FlowerMark emoji={bloom.emoji} className="flower-emoji pack-emoji" />
            <b className="plan-card-name">{plan.name}</b>
            <strong>Rs {moneyCompact(plan.price)}</strong>
            <small>{taskLine(plan.daily_tasks)}</small>
            <em className="chev" aria-hidden="true">›</em>
          </button>
          );
        })}
      </div>
      {featured && (
        <button
          type="button"
          className={`pack-feature${String(planId) === String(featured.id) ? " on" : ""}`}
          onClick={() => { setPlanId(String(featured.id)); setFormError(""); }}
        >
          <FlowerMark emoji={planFlower(featured.name, rows.length).emoji} className="flower-emoji pack-emoji" />
          <span className="feature-copy">
            <b className="plan-card-name">{featured.name}</b>
            <strong>Rs {moneyCompact(featured.price)}</strong>
            <small>{taskLine(featured.daily_tasks)}</small>
          </span>
          <em>MOST POPULAR</em>
        </button>
      )}
      {!rows.length && <p className="pack-empty">Packages are not added yet.</p>}
      <header className="pack-head">
        <h2>Select Payment Method</h2>
      </header>
      <div className="method-list">
        {accounts.map((account) => {
          const easy = /easypaisa/i.test(account.name);
          const jazz = /jazz/i.test(account.name);
          return (
            <button
              key={account.id}
              type="button"
              className={String(method) === String(account.id) ? "on" : ""}
              onClick={() => { setMethod(String(account.id)); setFormError(""); }}
            >
              {account.image ? <img src={account.image} alt="" /> : <i className={easy ? "ep" : jazz ? "jz" : "gw"}>{easy ? "e" : jazz ? "J" : account.name.slice(0, 1)}</i>}
              <b>{account.name}</b>
            </button>
          );
        })}
        {!accounts.length && <p>Payment account is not added yet.</p>}
      </div>
      {reviewing && <p className="home-review-note">Your payment is already under review.</p>}
      {(formError || notice) && <div className="error">{formError || notice}</div>}
      {!!rows.length && (
        <button className="pay-go" type="button" onClick={proceed}>
          <span aria-hidden="true">★</span>
          {reviewing ? "View payment status" : "Proceed to Payment"}
          <span aria-hidden="true">→</span>
        </button>
      )}
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
    ["/app/work", "/dash/menu-garden.png", "Garden"],
    ["/app/wallet", "/dash/menu-wallet.png", "Wallet"],
    ["/app/team", "/dash/menu-team.png", "Team"],
    ["/app/rewards", "/dash/menu-rewards.png", "Level & Rewards"],
    ["/app/channels", "/dash/menu-channels.png", "Official Channels"],
    ["/app/withdraw", "/dash/menu-withdraw.png", "Withdraw"],
  ];
  return (
    <div className="bloom-wallet home-dash">
      <div className="dash-title">
        <h1><SakuraIcon className="title-flower" /> Main Dashboard</h1>
        <div className="crumb"><Link to="/app" aria-label="Home"><WalletGlyph name="home" /></Link><span>Home</span><span>/</span><em>Main Dashboard</em></div>
      </div>
      <section className="profile-bloom">
        <div className="profile-main">
          <span className="profile-avatar" aria-hidden="true"><FlowerMark emoji="🌸" className="flower-emoji" /></span>
          <div className="profile-copy">
            <h2>{user.full_name} <CrownMark /></h2>
            <p>{user.email}</p>
            <Link className="plan-pill" to="/app/plans"><CrownMark /> {user.plan || "Choose a plan"}{user.plan ? ` · Rs ${moneyText(user.plan_price)}` : ""}</Link>
          </div>
        </div>
        <div className="profile-actions">
          <button type="button" onClick={copy}>
            <WalletGlyph name="link" />
            {copied ? "Copied" : "Copy Referral Link"}
          </button>
          <button type="button" className="copy-sq" aria-label="Copy referral link" onClick={copy}>
            <WalletGlyph name="copy" />
          </button>
        </div>
      </section>
      <h3 className="menu-kicker">Quick Menu</h3>
      <div className="home-menu">
        {menus.map(([href, icon, label]) => (
          <Link key={href} to={href}>
            <i><img src={icon} alt="" /></i>
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

const FLOWER_EMOJI = {
  rose: "🌹", tulip: "🌷", sun: "🌻", daisy: "🌼", lily: "🌸", lotus: "🪷", lavender: "🪻", hibiscus: "🌺", white: "🌸", greens: "🌸",
};
const TITLE_EMOJI = [
  ["sunflower", "🌻"], ["marigold", "🏵️"], ["daisy", "🌼"], ["tulip", "🌷"],
  ["rose", "🌹"], ["hibiscus", "🌺"], ["lotus", "🪷"], ["lavender", "🪻"],
  ["jasmine", "💮"], ["orchid", "🌸"], ["lily", "🌸"], ["iris", "💮"],
  ["peony", "🌸"], ["blossom", "🌸"], ["cherry", "🌸"],
];

function emojiFor(title, kind) {
  const key = String(title || "").toLowerCase();
  const named = TITLE_EMOJI.find(([name]) => key.includes(name));
  if (named) return named[1];
  return FLOWER_EMOJI[kind] || "🌸";
}

const NAME_ART = [
  ["sunflower", "sun"], ["marigold", "sun"], ["daffodil", "sun"], ["zinnia", "sun"],
  ["dahlia", "sun"], ["mimosa", "sun"], ["jonquil", "sun"], ["ixora", "sun"],
  ["quince", "sun"], ["verbena", "sun"],
  ["primrose", "tulip"], ["tuberose", "tulip"], ["snapdragon", "tulip"], ["carnation", "tulip"],
  ["freesia", "tulip"], ["tulip", "tulip"],
  ["lotus", "lotus"],
  ["lavender", "lavender"], ["bluebell", "lavender"], ["wisteria", "lavender"], ["violet", "lavender"],
  ["lilac", "lavender"], ["heather", "lavender"],
  ["jasmine", "daisy"], ["gardenia", "daisy"], ["magnolia", "daisy"], ["narcissus", "daisy"],
  ["ranunculus", "daisy"], ["azalea", "daisy"], ["gerbera", "daisy"], ["daisy", "daisy"],
  ["orchid", "lily"], ["lily", "lily"], ["iris", "lily"],
  ["camellia", "rose"], ["hibiscus", "rose"], ["begonia", "rose"], ["peony", "rose"],
  ["kalmia", "rose"], ["oleander", "rose"], ["poppy", "rose"], ["rose", "rose"],
];

function artKind(title, kind) {
  const key = String(title || "").toLowerCase();
  const named = NAME_ART.find(([name]) => key.includes(name));
  if (named) return named[1];
  if (kind === "sun") return "sun";
  if (kind === "tulip") return "tulip";
  if (kind === "white") return "daisy";
  return "rose";
}

function FlowerPhoto({ kind = "rose", title = "", className }) {
  const photo = {
    daisy: "daisy",
    lavender: "lavender",
    lily: "lily",
    lotus: "lotus",
    rose: "rose",
    sunflower: "sunflower",
    tulip: "tulip",
  }[String(title || "").toLowerCase()];
  if (photo) return <img src={`/flowers/${photo}.png`} alt="" className={`flower-emoji ${className || ""}`} />;
  return <FlowerMark emoji={emojiFor(title, kind)} className={`flower-emoji ${className || ""}`} />;
}

function MiniFlower({ kind = "rose", title = "" }) {
  return <FlowerPhoto kind={kind} title={title} className="mini-flower" />;
}

const DRIFT_PHOTOS = [
  { kind: "rose", x: "50%", y: "62%", dx: "-118px", dy: "-176px", spin: "-28deg", delay: "0.04s", size: 54, keep: true },
  { kind: "daisy", x: "50%", y: "62%", dx: "108px", dy: "-168px", spin: "24deg", delay: "0.08s", size: 48, keep: true },
  { kind: "tulip", x: "50%", y: "62%", dx: "-36px", dy: "-204px", spin: "8deg", delay: "0.02s", size: 52, keep: false },
  { kind: "lily", x: "50%", y: "62%", dx: "42px", dy: "-188px", spin: "-12deg", delay: "0.1s", size: 58, keep: true },
  { kind: "lotus", x: "50%", y: "62%", dx: "-142px", dy: "-92px", spin: "18deg", delay: "0.14s", size: 46, keep: false },
  { kind: "sun", x: "50%", y: "62%", dx: "136px", dy: "-84px", spin: "-22deg", delay: "0.06s", size: 50, keep: true },
  { kind: "lavender", x: "50%", y: "62%", dx: "-68px", dy: "-148px", spin: "14deg", delay: "0.12s", size: 44, keep: false },
  { kind: "rose", x: "50%", y: "62%", dx: "72px", dy: "-214px", spin: "-8deg", delay: "0s", size: 40, keep: true },
  { kind: "daisy", x: "50%", y: "62%", dx: "-96px", dy: "-210px", spin: "30deg", delay: "0.16s", size: 42, keep: false },
  { kind: "tulip", x: "50%", y: "62%", dx: "18px", dy: "-118px", spin: "-16deg", delay: "0.18s", size: 36, keep: false },
];

const POLLEN = [
  ["48%", "56%", "0.05s"], ["40%", "48%", "0.12s"], ["58%", "46%", "0.08s"],
  ["32%", "60%", "0.18s"], ["66%", "58%", "0.14s"], ["50%", "38%", "0.2s"],
  ["26%", "44%", "0.16s"], ["72%", "42%", "0.1s"], ["54%", "32%", "0.22s"],
  ["38%", "34%", "0.24s"], ["62%", "36%", "0.11s"], ["44%", "52%", "0.19s"],
];

const BURST = [
  { kind: "greens", x: "50%", w: 268, h: 168, delay: "0s", lean: "0deg", sway: "4.2s", sink: 8, z: 1 },
  { kind: "sun", x: "50%", w: 138, h: 214, delay: ".05s", lean: "-2deg", sway: "3.4s", sink: 20, z: 2 },
  { kind: "daisy", x: "26%", w: 124, h: 204, delay: ".08s", lean: "-12deg", sway: "2.8s", sink: 12, z: 3 },
  { kind: "lavender", x: "74%", w: 104, h: 210, delay: ".07s", lean: "13deg", sway: "3.2s", sink: 10, z: 3 },
  { kind: "lotus", x: "36%", w: 142, h: 214, delay: ".04s", lean: "-7deg", sway: "2.9s", sink: 4, z: 4 },
  { kind: "tulip", x: "66%", w: 118, h: 220, delay: ".09s", lean: "8deg", sway: "3.1s", sink: 2, z: 4 },
  { kind: "lily", x: "50%", w: 168, h: 268, delay: "0s", lean: "1deg", sway: "3s", sink: 0, z: 5, hero: true },
];

function GiftReveal({ phase, kind = "rose", done, limit, ring, ringOffset, onOpen }) {
  const flowers = BURST.map((item) => (item.hero ? { ...item, kind } : item));
  const blooming = phase === "open" || phase === "bloom";
  const waiting = phase === "gift";
  return (
    <div className={`gift-stage is-${phase}${blooming ? " is-alive" : ""}${waiting ? " is-waiting" : ""}`}>
      <div className="bloom-mist" />
      <div className="bloom-haze" />
      {blooming && (
        <>
          <div className="rays">
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} className="ray" style={{ "--a": `${i * 30}deg`, animationDelay: `${i * 0.02}s` }} />
            ))}
          </div>
          {DRIFT_PHOTOS.map((item, i) => (
            <span
              key={i}
              className={`drift-photo${item.keep ? " keep" : ""}`}
              style={{
                left: item.x,
                top: item.y,
                width: item.size,
                height: item.size * 1.45,
                "--dx": item.dx,
                "--dy": item.dy,
                "--spin": item.spin,
                "--d": item.delay,
              }}
            >
              <FlowerPhoto kind={item.kind} className="drift-shot" />
            </span>
          ))}
          {POLLEN.map(([x, y, delay], i) => (
            <i key={i} className="pollen" style={{ left: x, top: y, animationDelay: delay }} />
          ))}
        </>
      )}
      <div className="gift-rig">
        <div className="hero-slot" aria-hidden="true">
          <div className="hero-glow" />
          <div className="bouquet">
            {flowers.map((item) => (
              <span
                key={`${item.kind}-${item.x}-${item.z}`}
                className={`burst-flower${item.kind === "greens" ? " is-greens" : ""}${item.hero ? " is-hero" : ""}`}
                style={{ "--x": item.x, "--w": `${item.w}px`, "--h": `${item.h}px`, "--delay": item.delay, "--lean": item.lean, "--sway": item.sway, "--sink": `${item.sink}px`, zIndex: item.z }}
              >
                <span className="burst-sway">
                  <span className="burst-unfurl">
                    <FlowerPhoto kind={item.kind} className="burst-photo" />
                  </span>
                </span>
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="gift-hit"
          disabled={!waiting}
          onClick={waiting ? onOpen : undefined}
          aria-label={waiting ? "Open gift box" : "Gift opened"}
        >
          <div className="lid-group" aria-hidden="true">
            <div className="bow">
              <span className="loop left" />
              <span className="loop right" />
              <span className="knot" />
              <span className="tail a" />
              <span className="tail b" />
            </div>
            <div className="lid-slab"><i /></div>
          </div>
          <div className="box-body" aria-hidden="true">
            <div className="box-mouth" />
            <div className="box-face">
              <i className="box-ribbon" />
              <SakuraIcon className="box-print a" tone="#ffe4f2" />
              <SakuraIcon className="box-print b" tone="#fff" />
              <SakuraIcon className="box-print c" tone="#ffd0ea" />
            </div>
          </div>
          <i className="mouth-flash" aria-hidden="true" />
          <i className="mouth-ring" aria-hidden="true" />
        </button>
        {waiting && <p className="gift-tap">Tap gift to bloom</p>}
        {blooming && (
          <div className="bloom-bed" aria-hidden="true">
            <i className="bed-glow" />
            <i className="bed-soil" />
            <i className="bed-flash" />
          </div>
        )}
      </div>
      {phase === "bloom" && (
        <div className="garden-ring gift-meter">
          <svg viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="54" />
            <circle cx="70" cy="70" r="54" style={{ strokeDasharray: ring, strokeDashoffset: ringOffset }} />
          </svg>
          <div>
            <b>{done}</b>
            <span>of</span>
            <strong>{limit}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export function BloomPreview() {
  const [phase, setPhase] = useState("gift");
  const [kind, setKind] = useState("rose");
  const ring = 2 * Math.PI * 54;
  const samples = ["Rose", "Tulip", "Sunflower", "Daisy", "Lily", "Lotus", "Lavender", "Jasmine"];
  const play = (title) => {
    setKind(artKind(title));
    setPhase("gift");
  };
  const openGift = async () => {
    if (phase !== "gift") return;
    setPhase("open");
    await wait(1750);
    setPhase("bloom");
  };
  return (
    <div className="phone" style={{ maxWidth: 420 }}>
      <div className="task-room">
        <section className="garden">
          <div className="live-pill"><i />Live Garden</div>
          <h2><span>Bloom</span> <span>Tasks</span></h2>
          <p>Pick a flower, tap the gift, watch it bloom</p>
          <GiftReveal phase={phase} kind={kind} done={2} limit={5} ring={ring} ringOffset={ring * 0.6} onOpen={openGift} />
          <div className="garden-grid">
            {samples.map((title) => (
              <button key={title} type="button" className="garden-card is-ready" onClick={() => play(title)}>
                <span>{title}</span>
                <span className="bloom-wrap"><MiniFlower kind={artKind(title)} /></span>
                <em>Bloom now</em>
              </button>
            ))}
          </div>
        </section>
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
  const [channelClosed, setChannelClosed] = useState(false);
  const [channelBusy, setChannelBusy] = useState(false);
  const [channelError, setChannelError] = useState("");
  const busy = useRef(false);
  const alive = useRef(true);
  const giftTap = useRef(null);
  useEffect(() => () => {
    alive.current = false;
    if (giftTap.current) {
      giftTap.current();
      giftTap.current = null;
    }
  }, []);
  if (error) return <p className="pad">{error}</p>;
  if (!data) return <p className="pad">Loading...</p>;
  const confirmDaily = async () => {
    setChannelBusy(true);
    setChannelError("");
    try {
      await api("/api/user/channels/daily", { method: "POST", body: { joined: true } });
      setChannelClosed(false);
      await reload();
    } catch (err) {
      setChannelError(err.message);
    } finally {
      setChannelBusy(false);
    }
  };
  if (data.channels_due) {
    return channelClosed ? (
      <section className="review-board">
        <h1>Official channels are required</h1>
        <p>Today's task room stays closed until both official channels are joined. This check returns after midnight.</p>
        <button className="pay-go" type="button" onClick={() => setChannelClosed(false)}>Open channels</button>
      </section>
    ) : (
      <section className="review-board channel-pop">
        <button className="modal-x" type="button" aria-label="Close" onClick={() => setChannelClosed(true)}>×</button>
        <h1>Official Channels</h1>
        <p>Join both channels, then confirm to open today's task room.</p>
        <ChannelCards channels={data.channels} onDone={confirmDaily} busy={channelBusy} error={channelError} />
      </section>
    );
  }
  const progress = data.progress || {};
  const tasks = data.tasks || [];
  const extras = data.extras || [];
  const limit = Number(progress.daily_limit) || tasks.length || 0;
  const doneCount = tasks.filter((task) => task.done).length;
  const nextTask = tasks.find((task) => !task.done);
  const meter = limit ? Math.min(100, Math.round((doneCount / limit) * 100)) : 0;
  const waitForGiftTap = () => new Promise((resolve) => {
    giftTap.current = resolve;
  });
  const openGift = () => {
    if (!giftTap.current) return;
    const done = giftTap.current;
    giftTap.current = null;
    done();
  };
  const finish = async (task) => {
    if (busy.current || task.done) return;
    if (!task.display_only && progress.locked) {
      setShake(false);
      window.setTimeout(() => setShake(true), 30);
      return;
    }
    if (!task.display_only && (!nextTask || task.slot !== nextTask.slot)) {
      setNote("Open the glowing flower first.");
      return;
    }
    busy.current = true;
    setNote("");
    setOpeningSlot(task.slot);
    setReveal("gift");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      if (!reduce) await wait(380);
      if (!alive.current) return;
      await waitForGiftTap();
      if (!alive.current) return;
      setReveal("open");
      if (!reduce) await wait(1750);
      if (!alive.current) return;
      const result = await api(`/api/user/tasks/${task.id}/complete`, { method: "POST" });
      if (!alive.current) return;
      if (!result.display_only && Number(result.reward) > 0) setRewardPop({ slot: task.slot, amount: result.reward });
      if (Number(result.bonus) > 0) setNote("Account bonus Rs 50 added to your balance.");
      setReveal("bloom");
      if (!reduce) await wait(1600);
      await reload();
    } catch (err) {
      if (alive.current) setNote(err.message);
      if (alive.current && /already open|not open today|limit is complete/i.test(err.message || "")) await reload();
    } finally {
      busy.current = false;
      giftTap.current = null;
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
    if (task.display_only) return "ready";
    if (progress.locked) return "locked";
    if (nextTask && task.slot === nextTask.slot) return "ready";
    return "wait";
  };
  const readyLeft = Math.max(0, limit - doneCount);
  const ring = 2 * Math.PI * 54;
  const ringOffset = ring - (meter / 100) * ring;
  const openingTask = [...tasks, ...extras].find((task) => task.slot === openingSlot);
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
        <p>Pick a flower, tap the gift, watch it bloom</p>
        {reveal ? (
          <GiftReveal
            phase={reveal}
            kind={artKind(openingTask?.title, openingTask?.kind)}
            done={doneCount}
            limit={limit}
            ring={ring}
            ringOffset={ringOffset}
            onOpen={openGift}
          />
        ) : (
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
        )}
        <div className="garden-row">
          <span className="garden-ico" aria-hidden="true"><i /><i /><b /></span>
          <b>Garden Blooms</b>
          <em>{readyLeft} ready</em>
        </div>
        {!reveal && progress.locked && progress.message ? <LockAlert message={progress.message} shake={shake} /> : null}
        {note && note !== progress.message && <p className="task-note locked">{note}</p>}
        {!reveal && <div className="garden-grid">
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
                  <MiniFlower title={task.title} kind={artKind(task.title, task.kind)} />
                  {rewardPop && rewardPop.slot === task.slot && <b className="reward-float">+ Rs {moneyText(rewardPop.amount, 0)}</b>}
                </span>
                <em>{actionLabel(mode)}</em>
              </button>
            );
          })}
        </div>}
        {tasks.length === 0 && <p className="task-note">No task is available right now.</p>}
        {!reveal && <h3 className="all-flowers">All Flowers</h3>}
        {!reveal && <div className="garden-grid extra-grid">
          {extras.map((task) => {
            const mode = modeFor(task);
            return (
              <button
                key={task.slot}
                type="button"
                className={`garden-card is-${mode} is-display`}
                disabled={mode === "done" || mode === "opening"}
                onClick={() => finish(task)}
              >
                <span>{task.title}</span>
                <span className="bloom-wrap">
                  <MiniFlower title={task.title} kind={artKind(task.title, task.kind)} />
                </span>
                <em>{task.done ? "Bloomed" : "Bloom Now"}</em>
              </button>
            );
          })}
        </div>}
      </section>
      {!reveal && !progress.locked && progress.message ? <p className="task-note room-foot garden-notice">{progress.message}</p> : null}
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

function AnimatedAmount({ value }) {
  const target = Number(value) || 0;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(target);
      return undefined;
    }
    let frame = 0;
    let start = 0;
    const duration = 700;
    const animate = (now) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setShown(target * eased);
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [target]);
  return <>{moneyText(shown)}</>;
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
        <h1><span className="wallet-title-ico"><DashIcon name="wallet" /></span> Wallet</h1>
        <div className="crumb">
          <Link to="/app" aria-label="Home"><WalletGlyph name="home" /></Link>
          <span>Home</span>
          <span>/</span>
          <em>Wallet</em>
        </div>
      </div>
      <section className="balance-banner">
        <div>
          <span className="bloom-ico"><DashIcon name="wallet" /></span>
          <p>Wallet Balance</p>
          <h1>Rs <AnimatedAmount value={home.data.user.balance} /></h1>
          <Link className="avail-pill" to="/app/withdraw"><DashIcon name="wallet" /> Available Balance <span aria-hidden="true">›</span></Link>
        </div>
        <p className="dream-note">Small Steps<br />Big Dreams</p>
      </section>
      <div className="earn-row">
        <Link to="/app/transactions?filter=direct">
          <i className="staff"><DashIcon name="team" /></i>
          <b>Staff Earnings</b>
          <strong>Rs <AnimatedAmount value={wallet.staff} /></strong>
          <em aria-hidden="true">›</em>
        </Link>
        <button type="button" onClick={showFlower}>
          <i className="flower"><FlowerMark emoji="🌸" className="flower-emoji brand-emoji" /></i>
          <b>Flower Earnings</b>
          <strong>Rs <AnimatedAmount value={wallet.flowers} /></strong>
          <em aria-hidden="true">›</em>
        </button>
        <Link to="/app/transactions">
          <i className="interact"><DashIcon name="indirect" /></i>
          <b>Interact Earnings</b>
          <strong>Rs <AnimatedAmount value={wallet.indirect} /></strong>
          <em aria-hidden="true">›</em>
        </Link>
      </div>
      {flowerNote && <p className="flower-note">{flowerNote}</p>}
      <Link className="withdraw-banner" to="/app/wallet#history">
        <span className="check-bubble" aria-hidden="true"><WalletGlyph name="check" /></span>
        <p>Approved Withdraw</p>
        <h2>Rs <AnimatedAmount value={wallet.withdrawn} /></h2>
        <span className="total-pill"><DashIcon name="wallet" /> Total Withdraw Amount <span aria-hidden="true">›</span></span>
        <span className="go" aria-hidden="true">›</span>
      </Link>
      {(pendingCount > 0 || rejectedCount > 0) && (
        <div className="bloom-pair">
          <Link className="bloom-stat tone-pending" to="/app/withdraw#withdraw-page-history">
            <span className="bloom-ico"><WalletGlyph name="clock" /></span>
            <div><b>Pending Withdraw</b><strong>{pendingCount}</strong></div>
            <em aria-hidden="true">›</em>
          </Link>
          <Link className="bloom-stat tone-rejected" to="/app/withdraw#withdraw-page-history">
            <span className="bloom-ico"><WalletGlyph name="x" /></span>
            <div><b>Withdraw Rejected</b><strong>{rejectedCount}</strong></div>
            <em aria-hidden="true">›</em>
          </Link>
        </div>
      )}
      <section className="bloom-card">
        <h2><span className="bolt" aria-hidden="true"><DashIcon name="bolt" /></span> Quick Action <Link to="/app/transactions">See All ›</Link></h2>
        <div className="quick-four">
          <Link to="/app/plans"><i><DashIcon name="plan" /></i>Deposit</Link>
          <Link to="/app/withdraw"><i><DashIcon name="withdraw" /></i>Withdraw</Link>
          <Link to="/app/withdraw#withdraw-page-history"><i><WalletGlyph name="clock" /></i>Withdraw History</Link>
          <Link to="/app/transactions"><i><DashIcon name="task" /></i>Transaction History</Link>
        </div>
      </section>
      <section className="bloom-card" id="history">
        <h2><span className="clock-ico" aria-hidden="true"><WalletGlyph name="clock" /></span> Recent Withdrawals <button type="button" onClick={() => setShowAll((open) => !open)}>{showAll ? "Show less" : "View All ›"}</button></h2>
        <div className="recent-list">
          {recent.map((row) => (
            <Link key={row.id} to="/app/withdraw#withdraw-page-history">
              <i><DashIcon name="wallet" /></i>
              <div>
                <b>Rs {moneyText(row.amount)}</b>
                <span>{slipWhen(row.created_at) || "—"}</span>
              </div>
              <em className={row.status === "approved" ? "ok" : row.status}>{row.status === "approved" ? "Success" : withdrawalLabel(row.status)}</em>
              <span className="chev" aria-hidden="true">›</span>
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
  const options = [["", "All Transactions"], ["ads", "Ads Earning"], ["bonus", "Bonus Add"], ["direct", "Direct Referral Commission"], ["upgrade_referral", "Referral Commission from Plan Upgrade"], ["level2", "Level 2 Indirect Referral Commission"], ["level3", "Level 3 Indirect Referral Commission"], ["withdraw", "Withdraw"]];
  const hidden = new Set(["balance_sub", "balance_subtract", "manual_sub"]);
  const rows = (data || []).filter((row) => !hidden.has(row.remark) && !/balance subtracted/i.test(row.title || ""));
  return (
    <>
      <Back to="/app/wallet" label="Wallet" />
      <div className="hero"><h1>Transaction History</h1></div>
      <div className="pad"><select value={filter} onChange={(e) => setFilter(e.target.value)}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="list">{rows.map((row) => <Tx key={row.id} row={row} />)}</div>
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
  const [form, setForm] = useState({ amount: "", method: "", account_name: "", account: "" });
  const [walletOpen, setWalletOpen] = useState(false);
  useEffect(() => {
    const methods = data && !Array.isArray(data) ? data.methods || [] : [];
    const wallets = data && !Array.isArray(data) ? data.other_wallets || [] : [];
    const allowed = [...methods, ...wallets];
    if (!allowed.length) return;
    setForm((current) => allowed.includes(current.method) ? current : { ...current, method: methods[0] || "" });
  }, [data]);
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
        <div className="method-picks" id="withdraw-method">
          {(pack.methods || []).map((name) => (
            <button type="button" key={name} className={form.method === name ? "on" : ""} onClick={() => setForm({ ...form, method: name })}>{name}</button>
          ))}
          <button type="button" className={(pack.other_wallets || []).includes(form.method) ? "on" : ""} onClick={() => setWalletOpen(true)}>Other Wallets</button>
        </div>
        {data && !(pack.methods || []).length && !(pack.other_wallets || []).length && <p className="lock-note">Withdrawal methods are not added yet.</p>}
        {(pack.other_wallets || []).includes(form.method) && <p className="sub">Selected wallet: {form.method}</p>}
        {walletOpen && (
          <div className="modal-back" onClick={() => setWalletOpen(false)}>
            <div className="modal-card wallet-picker" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h2>Other Wallets</h2>
                <button className="modal-x" type="button" onClick={() => setWalletOpen(false)} aria-label="Close">×</button>
              </div>
              <div className="method-picks">
                {(pack.other_wallets || ["UPaisa", "SadaPay", "NayaPay"]).map((name) => (
                  <button type="button" key={name} className={form.method === name ? "on" : ""} onClick={() => { setForm({ ...form, method: name }); setWalletOpen(false); }}>{name}</button>
                ))}
              </div>
            </div>
          </div>
        )}
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
  const chatNumber = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.startsWith("00")) return digits.slice(2);
    if (digits.startsWith("0")) return `92${digits.slice(1)}`;
    return digits;
  };
  return <>
    <Back />
    <h2 className="page-title">Contact Us</h2>
    <div className="contact-admin-list">
      {(data || []).map((c) => {
        const whatsapp = chatNumber(c.whatsapp);
        const botim = chatNumber(c.botim);
        const method = (label, number, href, icon, fallback) => number ? (
          <a className="contact-method-card" key={label} href={href} target="_blank" rel="noopener noreferrer">
            {icon ? <img src={icon} alt="" /> : <i aria-hidden="true">{fallback}</i>}
            <span><b>{label}</b><small>{number}</small><em>Open chat</em></span>
          </a>
        ) : null;
        return <article className="contact-admin-card" key={c.id}>
          <h3>{c.name}</h3>
          {(c.purpose || c.role) && <p className="contact-purpose">{c.purpose || c.role}</p>}
          {c.note && <section className="contact-instructions"><b>Instructions</b><p>{c.note}</p></section>}
          {(whatsapp || botim) && <div className="contact-methods">
            {method("WhatsApp", whatsapp, `https://wa.me/${whatsapp}`, c.whatsapp_icon, "W")}
            {method("Botim", botim, `https://botim.me/${botim}`, c.botim_icon, "B")}
          </div>}
          {!whatsapp && !botim && <p className="sub">Contact options are not available yet.</p>}
        </article>;
      })}
      {data && data.length === 0 && <p className="empty-note">Support contacts are not available yet.</p>}
    </div>
  </>;
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
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data, error, reload } = useLoad("/api/user/plans");
  const [planId, setPlanId] = useState("");
  const [sender, setSender] = useState("");
  const [payer, setPayer] = useState("");
  const [method, setMethod] = useState("");
  const [shot, setShot] = useState(null);
  const [shotUrl, setShotUrl] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);
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
    const queryPlan = params.get("plan") || "";
    const queryGateway = params.get("gateway") || "";
    const known = (data.plans || []).find((plan) => String(plan.id) === queryPlan);
    const tooLow = Boolean(known && data.current_plan && Number(known.price) <= Number(data.current_price || 0));
    if (pending?.has_screenshot || upgrade?.has_screenshot) setStep("review");
    else if (known && !tooLow) {
      setPlanId(queryPlan);
      setStep("pay");
    } else if (tooLow) {
      setFormError("Choose a higher package than your current plan.");
      setStep("plan");
    } else if (waiting) {
      setPlanId(String(waiting.plan_id || ""));
      setSender(waiting.sender || "");
      setStep("pay");
    }
    const savedMethod = (waiting || pending || upgrade)?.method || "";
    const byId = (data.gateways || []).find((account) => String(account.id) === queryGateway);
    const matched = byId
      || (data.gateways || []).find((account) => account.account_number && savedMethod.includes(account.account_number))
      || (data.gateways || []).find((account) => savedMethod.toLowerCase().includes(String(account.name || "").toLowerCase()));
    setMethod(String((matched || data.gateways?.[0] || {}).id || ""));
    setOpened(true);
  }, [data, opened, params]);
  if (error) return <p className="pad">{error}</p>;
  if (!data || !opened) return <p className="pad">Loading...</p>;
  if (data.upgrade_locked && data.current_plan) {
    return (
      <section className="review-board upgrade-lock">
        <h1>Plan upgrade is locked</h1>
        <p>Aap plan upgrade nahi kar sakte. Aapka Level {data.level || 3} unlock ho chuka hai. Level 3 se pehle aap plan upgrade kar sakte thay.</p>
      </section>
    );
  }
  const plans = (data.plans || []).filter((plan) => !data.current_plan || Number(plan.price) > Number(data.current_price || 0));
  const chosen = plans.find((plan) => String(plan.id) === String(planId)) || (data.plans || []).find((plan) => String(plan.id) === String(planId));
  const accounts = data.gateways || [];
  const selectedAccount = accounts.find((account) => String(account.id) === String(method)) || accounts[0];
  const priceOf = (plan) => data.current_plan ? (Number(plan.price) - Number(data.current_price || 0)).toFixed(2) : plan.price;
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
    if (!payer.trim()) {
      setFormError("Enter the sender name.");
      return;
    }
    if (!shot) {
      setFormError("Payment screenshot is required.");
      return;
    }
    const activePlanId = planId || params.get("plan") || "";
    const activePlan = (data.plans || []).find((plan) => String(plan.id) === String(activePlanId));
    if (!activePlan) {
      setFormError("Choose a package.");
      setStep("plan");
      return;
    }
    if (data.current_plan && Number(activePlan.price) <= Number(data.current_price || 0)) {
      setFormError("Choose a higher package than your current plan.");
      setStep("plan");
      return;
    }
    setSending(true);
    try {
      const picture = await fitScreenshot(shot);
      const body = new FormData();
      body.append("plan_id", activePlanId);
      body.append("sender", sender.trim());
      body.append("sender_name", payer.trim());
      body.append("gateway_id", selectedAccount.id);
      body.append("method", `${selectedAccount.name} · ${selectedAccount.account_number}`);
      body.append("screenshot", picture);
      const result = await api("/api/user/deposits", { method: "POST", body });
      window.dispatchEvent(new Event("account-gate-refresh"));
      if (result.kind === "upgrade") {
        setStep("review");
        reload();
      } else {
        window.location.assign("/app");
      }
    } catch (err) { setFormError(err.message); }
    finally { setSending(false); }
  };
  const waitingPlan = data.pending_upgrade?.plan || data.pending_deposit?.plan || chosen?.name;
  const waitingAmount = data.pending_upgrade?.amount || data.pending_deposit?.amount || (chosen ? priceOf(chosen) : "");
  return (
    <div className="bloom-wallet pay-flow">
      <BlossomScene />
      {step === "review" ? (
        <ReviewBoard detail={waitingPlan ? `${waitingPlan} · Rs ${moneyText(waitingAmount)}. The new plan and task limit start only after admin approval.` : undefined}>
          <Link className="btn ghost" to="/app">Back to home</Link>
        </ReviewBoard>
      ) : step === "pay" && chosen ? (
        <form className="confirm-pay" onSubmit={submit}>
          <h1>Deposit Confirm</h1>
          <ol className="pay-steps" aria-label="Deposit progress">
            <li className="done"><i>✓</i><span>Select Plan</span></li>
            <li className="on"><i>2</i><span>Payment</span></li>
            <li><i>3</i><span>Review</span></li>
          </ol>
          <article className="confirm-plan">
            <FlowerMark emoji={planFlower(chosen.name).emoji} className="flower-emoji pack-emoji" />
            <div>
              <b className="plan-card-name">{chosen.name}</b>
              <strong>Rs {moneyText(priceOf(chosen))}</strong>
              <small>{taskLine(chosen.daily_tasks)}</small>
            </div>
            {(/super/i.test(chosen.name) || Number(chosen.price) >= Math.max(...(data.plans || []).map((plan) => Number(plan.price) || 0))) && <em>MOST POPULAR</em>}
          </article>
          <h2><i className="head-ico card" aria-hidden="true" /><span>Payment Instructions</span></h2>
          {!accounts.length && <p>Payment account is not added yet.</p>}
          {accounts.length > 1 && (
            <div className="gw-switch">
              {accounts.map((account) => (
                <button type="button" key={account.id} className={String(account.id) === String(selectedAccount?.id) ? "on" : ""} onClick={() => setMethod(String(account.id))}>{account.name}</button>
              ))}
            </div>
          )}
          {selectedAccount && (
            <section className="gw-card">
              <header>
                {selectedAccount.image ? <img src={selectedAccount.image} alt="" /> : <i className={/jazz/i.test(selectedAccount.name) ? "jz" : "ep"}>{/jazz/i.test(selectedAccount.name) ? "J" : "e"}</i>}
                <b>{selectedAccount.name.toLowerCase()}</b>
              </header>
              <p><span>Name</span><em>:</em><strong>{selectedAccount.account_name || "Account name"}</strong></p>
              <p>
                <span>Number</span><em>:</em><strong>{selectedAccount.account_number}</strong>
                <button
                  type="button"
                  aria-label="Copy account number"
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedAccount.account_number);
                    setCopiedNumber(true);
                    window.setTimeout(() => setCopiedNumber(false), 1200);
                  }}
                >{copiedNumber ? "✓" : "⧉"}</button>
              </p>
            </section>
          )}
          <p className="pay-hint"><i aria-hidden="true">i</i> {selectedAccount?.instructions || "Upar diye gaye number par payment karein. Sender Number mein apna mobile number enter karein. Sender Name mein us account ka naam likhein jis se aapne payment transfer ki hai. Payment complete karne ke baad details submit karein."}</p>
          <h2><i className="head-ico lock" aria-hidden="true" /><span>Submit Payment Proof</span></h2>
          <section className="proof-card">
            <label htmlFor="sender-phone">Sender number</label>
            <input id="sender-phone" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="03xxxxxxxxx" inputMode="tel" required />
            <label htmlFor="sender-name">Sender name</label>
            <input id="sender-name" value={payer} onChange={(e) => setPayer(e.target.value)} placeholder="Account holder name" required />
            <div className="upload-box">
              <span className="upload-art" aria-hidden="true">
                <svg viewBox="0 0 48 48"><rect x="8" y="12" width="32" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2.2" /><circle cx="18" cy="21" r="3" fill="currentColor" /><path d="M12 32l8-7 6 5 4-3 6 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /></svg>
              </span>
              <b>Upload Screenshot</b>
              <small>JPG, JPEG, PNG (Max 5MB)</small>
              <label className="choose-file">
                Choose File
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseShot} />
              </label>
            </div>
            {shot && (
              <div className="shot-row">
                {shotUrl ? <img src={shotUrl} alt="" /> : <span className="shot-fallback" />}
                <div><b>Screenshot Uploaded</b><span>{shot.name}</span></div>
                <i aria-hidden="true">✓</i>
              </div>
            )}
          </section>
          {(data.pending_deposit && !data.pending_deposit.has_screenshot) || (data.pending_upgrade && !data.pending_upgrade.has_screenshot) ? <p className="lock-note">The payment is saved, but the screenshot did not upload. Choose the photo again, then submit.</p> : null}
          {formError && <div className="error">{formError}</div>}
          <button className="pay-go submit-deposit" disabled={sending}>
            <span aria-hidden="true">✈</span>
            {sending ? "Sending..." : "Submit Deposit"}
          </button>
        </form>
      ) : (
        <PackageShop
          data={data}
          notice={formError}
          onProceed={({ planId: nextPlan, gateway, step: nextStep }) => {
            if (nextStep === "review") {
              setStep("review");
              return;
            }
            setPlanId(nextPlan);
            setMethod(gateway || "");
            setFormError("");
            setStep("pay");
            navigate(`/app/deposit?plan=${encodeURIComponent(nextPlan)}&gateway=${encodeURIComponent(gateway || "")}`, { replace: true });
          }}
        />
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

function EyeIcon({ off }) {
  return off ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6A3 3 0 0 0 13.4 13.4M9.9 5.2A10.8 10.8 0 0 1 12 5c6 0 10 7 10 7a18.4 18.4 0 0 1-4.1 4.6M6.1 6.1C3.8 7.8 2 12 2 12s4 7 10 7a10.6 10.6 0 0 0 4.2-.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
  );
}

function FieldGlyph({ name }) {
  const paths = {
    user: "M12 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 12 12zM6.2 19.2a5.8 5.8 0 0 1 11.6 0",
    lock: "M8 11V8a4 4 0 0 1 8 0v3M7 11h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z",
    phone: "M8 4h3l1.2 3-1.8 1.2a12 12 0 0 0 5.4 5.4L17 12l3 1.2v3A2 2 0 0 1 18 18 14 14 0 0 1 6 6a2 2 0 0 1 2-2z",
    mail: "M4 7h16v10H4zM4 7l8 6 8-6",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PasswordField({ id, value, onChange, placeholder, autoComplete, icon }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pass-wrap">
      <input id={id} type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} />
      <button type="button" className="pass-toggle" onClick={() => setShow((open) => !open)} aria-label={show ? "Hide password" : "Show password"}>{icon ? <EyeIcon off={show} /> : (show ? "Hide" : "Show")}</button>
    </div>
  );
}

function AuthBloom({ back, children }) {
  return (
    <div className="auth-bloom">
      <img className="auth-frame" src="/dash/auth-frame.jpg" alt="" />
      <div className="auth-sheet">
        {back}
        <div className="auth-brand-mark"><img src={SHOP_ART.pink} alt="" /></div>
        <div className="auth-word">
          <img src={SHOP_ART.pink} alt="" />
          <b>Flowers</b>
          <img src={SHOP_ART.pink} alt="" />
        </div>
        <small>Grow Together • Earn Together</small>
        {children}
      </div>
    </div>
  );
}

export function Impersonate() {
  const navigate = useNavigate();
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code") || "";
    api("/api/auth/impersonate", { method: "POST", body: { code } }).then((res) => {
      setSession(res.token, res.user, false);
      navigate("/app");
    }).catch(() => navigate("/login"));
  }, [navigate]);
  return <p className="pad">Opening the user dashboard...</p>;
}

export function Login({ role = "user" }) {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [bannedReason, setBannedReason] = useState("");
  const [forgot, setForgot] = useState(false);
  const expired = new URLSearchParams(window.location.search).get("expired");
  const submit = async (e) => {
    e.preventDefault();
    setBannedReason("");
    try {
      const res = await api("/api/auth/login", { method: "POST", body: { identity, password, role } });
      setSession(res.token, res.user, remember);
      if (res.session_key) localStorage.setItem("flower_admin_session", res.session_key);
      navigate(role === "admin" ? "/admin" : "/app");
    } catch (err) {
      const message = err.message || "";
      if (/banned/i.test(message)) setBannedReason(message.replace(/^Your Account Is Banned\.?\s*/i, "") || "No ban reason was saved.");
      else setError(message);
    }
  };
  if (bannedReason) return <BanBoard reason={bannedReason} />;
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
    <AuthBloom>
      <form className="auth-card" onSubmit={submit}>
        <h1>Welcome <span>Back!</span></h1>
        <p>Sign in to continue your journey</p>
        <label className="icon-field" htmlFor="identity">
          <FieldGlyph name="user" />
          <input id="identity" value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="Username or Email" autoComplete="username" />
        </label>
        <label className="icon-field" htmlFor="password">
          <FieldGlyph name="lock" />
          <PasswordField id="password" icon value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" />
        </label>
        <div className="auth-row">
          <label className="remember"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
          <button type="button" className="forgot" onClick={() => setForgot(true)}>Forgot Password?</button>
        </div>
        {forgot && <p className="pay-hint">Password reset is handled by support. Contact your upliner.</p>}
        {error && <div className="error">{error}</div>}
        {!error && expired && <div className="error">Your session ended. Please sign in again.</div>}
        <button className="pay-go"><span aria-hidden="true">→</span> Sign In</button>
        <div className="or-line"><span>OR</span></div>
        <p className="auth-switch">Don't have an account? <Link to="/register">Sign Up →</Link></p>
      </form>
    </AuthBloom>
  );
}

export function Register() {
  const navigate = useNavigate();
  const linkedCode = new URLSearchParams(window.location.search).get("ref") || "";
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", referral: linkedCode });
  const [confirm, setConfirm] = useState("");
  const [upline, setUpline] = useState(null);
  const [error, setError] = useState("");
  const locked = Boolean(linkedCode);
  useEffect(() => {
    const code = form.referral.trim();
    if (code.length < 3) { setUpline(null); return undefined; }
    const id = setTimeout(() => {
      api(`/api/auth/referrer?code=${encodeURIComponent(code)}`).then((row) => setUpline(row)).catch(() => setUpline(null));
    }, 250);
    return () => clearTimeout(id);
  }, [form.referral]);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.full_name.trim() || !form.email.trim()) {
      setError("Full name and email are required.");
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim())) {
      setError("Enter a valid email address, for example name@gmail.com.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!upline) {
      setError("A valid referral code is required.");
      return;
    }
    let phone = form.phone.trim();
    if (phone && !phone.startsWith("+") && !phone.startsWith("0")) phone = `+92${phone.replace(/^92/, "")}`;
    try {
      const res = await api("/api/auth/register", { method: "POST", body: { ...form, phone, referral: locked ? linkedCode : form.referral } });
      setSession(res.token, res.user, true);
      navigate("/app/deposit");
    } catch (err) { setError(err.message); }
  };
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  return (
    <AuthBloom back={<Link className="auth-back" to="/login" aria-label="Back to sign in">←</Link>}>
      <form className="auth-card" onSubmit={submit}>
        <ol className="hub-steps" aria-label="Account progress">
          <li className="on"><i>1</i><span>Basic Hub</span></li>
          <li><i>2</i><span>Payment</span></li>
          <li><i>3</i><span>Under Review</span></li>
        </ol>
        <article className="ref-by">
          <img src={SHOP_ART.pink} alt="" />
          <div>
            <b>Referral By</b>
            <span>Enter your upliner details</span>
          </div>
        </article>
        {upline ? (
          <article className="upliner-row">
            <i aria-hidden="true"><FieldGlyph name="user" /></i>
            <div>
              <b>{upline.name}</b>
              <span>Referral Code: <em>{upline.code}</em></span>
            </div>
            <strong>Upliner</strong>
          </article>
        ) : null}
        {!locked && (
          <label className="icon-field" htmlFor="referral">
            <FieldGlyph name="user" />
            <input id="referral" placeholder="Referral code" value={form.referral} onChange={set("referral")} required />
          </label>
        )}
        <label className="icon-field" htmlFor="full_name">
          <FieldGlyph name="user" />
          <input id="full_name" placeholder="Full Name" value={form.full_name} onChange={set("full_name")} autoComplete="name" />
        </label>
        <label className="icon-field phone-field" htmlFor="phone">
          <FieldGlyph name="phone" />
          <input id="phone" placeholder="Phone Number" value={form.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" />
          <span className="dial">+92</span>
        </label>
        <label className="icon-field" htmlFor="email">
          <FieldGlyph name="mail" />
          <input id="email" type="email" placeholder="Email Address" value={form.email} onChange={set("email")} autoComplete="email" inputMode="email" required />
        </label>
        <label className="icon-field" htmlFor="new-password">
          <FieldGlyph name="lock" />
          <PasswordField id="new-password" icon value={form.password} onChange={set("password")} placeholder="Password" autoComplete="new-password" />
        </label>
        <label className="icon-field" htmlFor="confirm-password">
          <FieldGlyph name="lock" />
          <PasswordField id="confirm-password" icon value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm Password" autoComplete="new-password" />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="pay-go"><span aria-hidden="true">＋</span> Create Account <span aria-hidden="true">→</span></button>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign In →</Link></p>
      </form>
    </AuthBloom>
  );
}
