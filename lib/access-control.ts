import type { SiteContent } from "@/lib/content-store";

export const ACCESS_SESSION_KEY = "only-us-access-marker";
export const ACCESS_NOTICE_KEY = "only-us-access-notice";
const LEGACY_ACCESS_KEYS = ["only-us-access-unlocked", "only-us-unlocked"];

type CoupleConfig = SiteContent["couple"];

export async function hashPasscode(passcode: string) {
  const data = new TextEncoder().encode(passcode);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getAccessMarker(couple: CoupleConfig) {
  if (couple.passwordHash) return `sha256:${couple.passwordHash}`;
  if (couple.password) return `legacy:${await hashPasscode(couple.password)}`;
  return "";
}

export async function verifyPasscode(couple: CoupleConfig, passcode: string) {
  if (!passcode) return false;
  if (couple.passwordHash) return (await hashPasscode(passcode)) === couple.passwordHash;
  return Boolean(couple.password && passcode === couple.password);
}

export function readStoredAccessMarker() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ACCESS_SESSION_KEY) || "";
}

export function storeAccessMarker(marker: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_SESSION_KEY, marker);
  for (const key of LEGACY_ACCESS_KEYS) window.localStorage.removeItem(key);
}

export function clearAccessState(message?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_SESSION_KEY);
  for (const key of LEGACY_ACCESS_KEYS) window.localStorage.removeItem(key);
  if (message) window.sessionStorage.setItem(ACCESS_NOTICE_KEY, message);
}

export function consumeAccessNotice() {
  if (typeof window === "undefined") return "";
  const message = window.sessionStorage.getItem(ACCESS_NOTICE_KEY) || "";
  if (message) window.sessionStorage.removeItem(ACCESS_NOTICE_KEY);
  return message;
}
