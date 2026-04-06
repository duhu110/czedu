const ADMIN_DEMO_AUTH_KEY = "admin-demo-auth";

export function getAdminDemoAuth() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(ADMIN_DEMO_AUTH_KEY) === "true";
}

export function setAdminDemoAuth() {
  window.localStorage.setItem(ADMIN_DEMO_AUTH_KEY, "true");
}

export function clearAdminDemoAuth() {
  window.localStorage.removeItem(ADMIN_DEMO_AUTH_KEY);
}
