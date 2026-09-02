import { Capacitor } from "@capacitor/core";

/**
 * Purchases, kept behind one interface so the rest of the app never talks to a
 * billing SDK directly.
 *
 * Not wired to a provider yet: doing so needs an App Store Connect product,
 * a RevenueCat account and a public API key, none of which exist in the repo.
 * Until `REVENUECAT_API_KEY` is filled in, every call reports "unavailable"
 * and the paywall says so honestly rather than showing a dead Buy button.
 *
 * To finish the integration:
 *   1. Create the subscription/product in App Store Connect.
 *   2. Add it to a RevenueCat "pro" entitlement; copy the public SDK key here.
 *   3. npm i @revenuecat/purchases-capacitor  (verified SPM-compatible)
 *   4. Replace the stubs below with Purchases.configure / getOfferings /
 *      purchasePackage / restorePurchases, then call
 *      useEntitlementStore.setPro() with the resulting entitlement.
 */

/** Public RevenueCat SDK key. Empty until billing is set up. */
const REVENUECAT_API_KEY = "";

export type BillingStatus =
  | { available: false; reason: "notConfigured" | "notNative" }
  | { available: true };

export type PurchaseResult =
  | { status: "purchased" }
  | { status: "cancelled" }
  | { status: "unavailable" }
  | { status: "error"; message: string };

export function getBillingStatus(): BillingStatus {
  if (!Capacitor.isNativePlatform()) {
    return { available: false, reason: "notNative" };
  }
  if (!REVENUECAT_API_KEY) {
    return { available: false, reason: "notConfigured" };
  }

  return { available: true };
}

/** Start the purchase flow for BulkOS Pro. */
export async function purchasePro(): Promise<PurchaseResult> {
  const status = getBillingStatus();
  if (!status.available) return { status: "unavailable" };

  // Provider call goes here once configured.
  return { status: "unavailable" };
}

/** Restore a previous purchase (required by App Store review). */
export async function restorePurchases(): Promise<PurchaseResult> {
  const status = getBillingStatus();
  if (!status.available) return { status: "unavailable" };

  return { status: "unavailable" };
}
