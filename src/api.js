const LOGO = "/logo.png?v=20261019";

export function token() {
  return sessionStorage.getItem("flower_token") || localStorage.getItem("flower_token") || "";
}

export function setSession(tokenValue, user) {
  localStorage.setItem("flower_token", tokenValue);
  localStorage.setItem("flower_user", JSON.stringify(user));
}

export function clearSession() {
  if (sessionStorage.getItem("flower_token")) {
    sessionStorage.removeItem("flower_token");
    sessionStorage.removeItem("flower_user");
    return;
  }
  localStorage.removeItem("flower_token");
  localStorage.removeItem("flower_user");
  localStorage.removeItem("flower_admin_session");
}

export function savedUser() {
  try { return JSON.parse(sessionStorage.getItem("flower_user") || localStorage.getItem("flower_user") || "null"); } catch { return null; }
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (token()) headers.Authorization = `Token ${token()}`;
  const sessionKey = localStorage.getItem("flower_admin_session");
  if (sessionKey) headers["X-Admin-Session"] = sessionKey;
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
    const onAuth = /\/login|\/register/.test(window.location.pathname);
    if (!onAuth) {
      clearSession();
      window.location.replace("/login?expired=1");
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
