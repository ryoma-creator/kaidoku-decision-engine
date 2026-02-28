import { Platform } from "react-native";
import { IAP_PRODUCT_ID } from "../constants/options";
import { markPurchased } from "./storage";

// ── In-App Purchase service ──
// Uses react-native-iap for StoreKit integration
// Falls back gracefully if IAP is unavailable (simulator, etc.)

let RNIap: typeof import("react-native-iap") | null = null;

async function loadIAP() {
  if (RNIap) return RNIap;
  try {
    RNIap = require("react-native-iap");
    return RNIap;
  } catch {
    console.warn("react-native-iap not available");
    return null;
  }
}

export async function initIAP(): Promise<boolean> {
  if (Platform.OS !== "ios") return false;
  try {
    const iap = await loadIAP();
    if (!iap) return false;
    await iap.initConnection();
    return true;
  } catch (err) {
    console.warn("IAP init failed:", err);
    return false;
  }
}

export async function getProduct() {
  try {
    const iap = await loadIAP();
    if (!iap) return null;
    const products = await iap.getProducts({ skus: [IAP_PRODUCT_ID] });
    return products[0] ?? null;
  } catch (err) {
    console.warn("Get products failed:", err);
    return null;
  }
}

export async function purchaseUnlock(): Promise<boolean> {
  try {
    const iap = await loadIAP();
    if (!iap) throw new Error("IAP not available");
    await iap.requestPurchase({ sku: IAP_PRODUCT_ID });
    // Purchase listener will handle completion
    return true;
  } catch (err) {
    console.warn("Purchase failed:", err);
    return false;
  }
}

export async function setupPurchaseListener(
  onSuccess: () => void,
  onError: (msg: string) => void
): Promise<(() => void) | null> {
  try {
    const iap = await loadIAP();
    if (!iap) return null;

    const purchaseUpdateSubscription = iap.purchaseUpdatedListener(
      async (purchase) => {
        if (purchase.productId === IAP_PRODUCT_ID) {
          try {
            await iap.finishTransaction({ purchase, isConsumable: false });
            await markPurchased();
            onSuccess();
          } catch (e) {
            console.warn("Finish transaction failed:", e);
          }
        }
      }
    );

    const purchaseErrorSubscription = iap.purchaseErrorListener((error) => {
      if (error.code !== "E_USER_CANCELLED") {
        onError("購入処理でエラーが発生しました。");
      }
    });

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  } catch {
    return null;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const iap = await loadIAP();
    if (!iap) return false;
    const purchases = await iap.getAvailablePurchases();
    const found = purchases.some((p) => p.productId === IAP_PRODUCT_ID);
    if (found) {
      await markPurchased();
    }
    return found;
  } catch {
    return false;
  }
}

export async function endIAP(): Promise<void> {
  try {
    const iap = await loadIAP();
    if (iap) await iap.endConnection();
  } catch {
    // ignore
  }
}
