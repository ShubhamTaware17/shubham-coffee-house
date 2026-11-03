import type { Settings } from "./types";

const PREFIX = "scs:";

export const KEYS = {
  seeded: "scs:seeded",
  categories: "scs:categories",
  products: "scs:products",
  customers: "scs:customers",
  orders: "scs:orders",
  logs: "scs:logs",
  enquiries: "scs:enquiries",
  employees: "scs:employees",
  coupons: "scs:coupons",
  settings: "scs:settings",
  cart: "scs:cart",
  session: "scs:admin-session",
} as const;

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadCollection<T>(key: string, fallback: T[]): T[] {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function saveCollection<T>(key: string, value: T[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — ignore */
  }
}

export function loadSettings(key: string, fallback: Settings): Settings {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return fallback;
  }
}

export function saveSettings(key: string, value: Settings): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function loadSingle<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveSingle<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function removeKey(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

/** Seed every collection once. Idempotent: guarded by a marker key. */
export function seedIfNeeded(seed: {
  categories: unknown[];
  products: unknown[];
  customers: unknown[];
  orders: unknown[];
  logs: unknown[];
  enquiries: unknown[];
  employees: unknown[];
  coupons: unknown[];
  settings: Settings;
}): void {
  if (!isBrowser()) return;
  if (window.localStorage.getItem(KEYS.seeded)) return;
  saveCollection(KEYS.categories, seed.categories);
  saveCollection(KEYS.products, seed.products);
  saveCollection(KEYS.customers, seed.customers);
  saveCollection(KEYS.orders, seed.orders);
  saveCollection(KEYS.logs, seed.logs);
  saveCollection(KEYS.enquiries, seed.enquiries);
  saveCollection(KEYS.employees, seed.employees);
  saveCollection(KEYS.coupons, seed.coupons);
  saveSettings(KEYS.settings, seed.settings);
  window.localStorage.setItem(KEYS.seeded, "v1");
}

/** Wipe everything (admin Settings → Reset demo data). */
export function resetStorage(): void {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
}
