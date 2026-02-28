import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { UsageData } from "../types";

const USAGE_KEY = "kaidoku_usage";
const API_KEY_STORE = "openai_api_key";

// ── SecureStore with Web fallback ──
// expo-secure-store only works on iOS/Android; use AsyncStorage on web
let SecureStore: typeof import("expo-secure-store") | null = null;
if (Platform.OS !== "web") {
  SecureStore = require("expo-secure-store");
}

// ── Get current YYYY-MM ──
function getCurrentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// ── Default usage data ──
function defaultUsage(): UsageData {
  return {
    totalFreeUsed: 0,
    monthlyUsed: 0,
    currentMonth: getCurrentMonth(),
    isPurchased: false,
  };
}

// ── Read usage ──
export async function getUsage(): Promise<UsageData> {
  try {
    const raw = await AsyncStorage.getItem(USAGE_KEY);
    if (!raw) return defaultUsage();

    const data: UsageData = JSON.parse(raw);

    // Monthly reset check
    const now = getCurrentMonth();
    if (data.currentMonth !== now) {
      data.monthlyUsed = 0;
      data.currentMonth = now;
      await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(data));
    }

    return data;
  } catch {
    return defaultUsage();
  }
}

// ── Increment usage ──
export async function incrementUsage(): Promise<UsageData> {
  const data = await getUsage();
  if (data.isPurchased) {
    data.monthlyUsed += 1;
  } else {
    data.totalFreeUsed += 1;
  }
  await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(data));
  return data;
}

// ── Mark as purchased ──
export async function markPurchased(): Promise<void> {
  const data = await getUsage();
  data.isPurchased = true;
  data.monthlyUsed = 0;
  data.currentMonth = getCurrentMonth();
  await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(data));
}

// ── Check if can generate ──
export function canGenerate(usage: UsageData): boolean {
  if (usage.isPurchased) {
    return usage.monthlyUsed < 200;
  }
  return usage.totalFreeUsed < 5;
}

// ── Remaining count ──
export function remainingCount(usage: UsageData): number {
  if (usage.isPurchased) {
    return Math.max(0, 200 - usage.monthlyUsed);
  }
  return Math.max(0, 5 - usage.totalFreeUsed);
}

// ── Secure API key storage (dev only) ──
// On native: SecureStore (encrypted keychain)
// On web: AsyncStorage fallback (dev/preview only)
export async function saveApiKey(key: string): Promise<void> {
  if (SecureStore) {
    await SecureStore.setItemAsync(API_KEY_STORE, key);
  } else {
    await AsyncStorage.setItem(API_KEY_STORE, key);
  }
}

export async function getApiKey(): Promise<string | null> {
  if (SecureStore) {
    return SecureStore.getItemAsync(API_KEY_STORE);
  }
  return AsyncStorage.getItem(API_KEY_STORE);
}

export async function deleteApiKey(): Promise<void> {
  if (SecureStore) {
    await SecureStore.deleteItemAsync(API_KEY_STORE);
  } else {
    await AsyncStorage.removeItem(API_KEY_STORE);
  }
}
