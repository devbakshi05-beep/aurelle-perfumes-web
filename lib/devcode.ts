// DEMO mode: backend mein Gmail set na ho toh verification code screen pe dikhane ke liye
// (sirf is tab ke sessionStorage mein rehta hai)
const KEY = "aurelle-devcode";

export function setDevCode(code?: string | null) {
  try {
    if (code) sessionStorage.setItem(KEY, code);
    else sessionStorage.removeItem(KEY);
  } catch {}
}

export function getDevCode(): string {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}
