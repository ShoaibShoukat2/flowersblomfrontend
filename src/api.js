const LOGO = "/logo.png?v=20261019";

const AREA = {
  admin: { token: "flower_admin_token", user: "flower_admin_user" },
  user: { token: "flower_user_token", user: "flower_user_user" },
};

export function sessionArea() {
  return window.location.pathname.startsWith("/admin") ? "admin" : "user";
}

function namesFor(area) {
  return AREA[area] || AREA.user;
}

function readStored(name) {
  return sessionStorage.getItem(name) || localStorage.getItem(name) || "";
}

function legacyRole() {
  try {
    return JSON.parse(sessionStorage.getItem("flower_user") || localStorage.getItem("flower_user") || "null")?.role || "";
  } catch {
    return "";
  }
}

function migrateLegacy(area) {
  const names = namesFor(area);
  if (readStored(names.token)) return;
  const legacyToken = readStored("flower_token");
  const legacyUser = readStored("flower_user");
  if (!legacyToken || !legacyUser || legacyRole() !== area) return;
  const store = sessionStorage.getItem("flower_token") ? sessionStorage : localStorage;
  store.setItem(names.token, legacyToken);
  store.setItem(names.user, legacyUser);
}

function parseStoredUser(area) {
  migrateLegacy(area);
  try { return JSON.parse(readStored(namesFor(area).user) || "null"); } catch { return null; }
}

function roleFits(area, user) {
  if (!user || !user.role) return false;
  return area === "admin" ? user.role === "admin" : user.role === "user";
}

export function token() {
  const area = sessionArea();
  if (!roleFits(area, parseStoredUser(area))) return "";
  return readStored(namesFor(area).token);
}

export function setSession(tokenValue, user, remember = true) {
  const area = user?.role === "admin" ? "admin" : "user";
  const names = namesFor(area);
  sessionStorage.removeItem(names.token);
  sessionStorage.removeItem(names.user);
  localStorage.removeItem(names.token);
  localStorage.removeItem(names.user);
  const store = remember ? localStorage : sessionStorage;
  store.setItem(names.token, tokenValue);
  store.setItem(names.user, JSON.stringify(user));
}

export function clearSession(area = sessionArea()) {
  const names = namesFor(area);
  sessionStorage.removeItem(names.token);
  sessionStorage.removeItem(names.user);
  localStorage.removeItem(names.token);
  localStorage.removeItem(names.user);
  if (area === "admin") localStorage.removeItem("flower_admin_session");
  if (legacyRole() === area) {
    sessionStorage.removeItem("flower_token");
    sessionStorage.removeItem("flower_user");
    localStorage.removeItem("flower_token");
    localStorage.removeItem("flower_user");
  }
}

export function savedUser() {
  const area = sessionArea();
  const user = parseStoredUser(area);
  return roleFits(area, user) ? user : null;
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const area = sessionArea();
  if (token()) headers.Authorization = `Token ${token()}`;
  if (area === "admin") {
    const sessionKey = localStorage.getItem("flower_admin_session");
    if (sessionKey) headers["X-Admin-Session"] = sessionKey;
  }
  let response;
  try {
    response = await fetch(path, { ...options, headers, body: options.body instanceof FormData || typeof options.body === "string" || !options.body ? options.body : JSON.stringify(options.body) });
  } catch (err) {
    if (err.name === "AbortError") {
      const abort = new Error("aborted");
      abort.name = "AbortError";
      throw abort;
    }
    throw err;
  }
  const data = await response.json().catch(() => ({}));
  if (response.status === 413) throw new Error("Payment screenshot is too large. Choose a smaller photo.");
  if (response.status === 401) {
    const onAuth = /\/login|\/register|\/impersonate/.test(window.location.pathname);
    if (!onAuth) {
      clearSession(area);
      window.location.replace(area === "admin" ? "/admin/login?expired=1" : "/login?expired=1");
    }
    throw new Error("Your session ended. Please sign in again.");
  }
  if (response.status === 403 && data.detail === "Your Account Is Banned") {
    throw new Error(`Your Account Is Banned. ${data.reason || ""}`.trim());
  }
  if (!response.ok) throw new Error(data.detail || "Request failed");
  return data;
}

export { LOGO };
