import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';

export const GOLD_ENTITLEMENT = 'gold';

let configured = false;
let customerId: string | null = null;
let identityTask: Promise<void> = Promise.resolve();

export function configureGoldSubscriptions() {
  if (configured || Platform.OS === 'web') return configured;

  const storeKey = Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY
    : process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY;
  const apiKey = storeKey || (__DEV__ ? process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY : undefined);

  if (!apiKey) return false;
  Purchases.configure({ apiKey });
  configured = true;
  return true;
}

export function hasGold(customerInfo: CustomerInfo) {
  return Boolean(customerInfo.entitlements.active[GOLD_ENTITLEMENT]);
}

export function subscribeGoldStatus(onChange: (active: boolean) => void) {
  if (!configureGoldSubscriptions()) return () => {};
  const listener = (customerInfo: CustomerInfo) => onChange(hasGold(customerInfo));
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => { Purchases.removeCustomerInfoUpdateListener(listener); };
}

export function syncGoldCustomer(userId: string | null) {
  if (!configureGoldSubscriptions()) return Promise.resolve();
  identityTask = identityTask.catch(() => {}).then(async () => {
    if (customerId === userId) return;
    if (userId) await Purchases.logIn(userId);
    else if (customerId) await Purchases.logOut();
    customerId = userId;
  });
  return identityTask;
}

export async function getGoldOptions(): Promise<{ offering: PurchasesOffering; monthly: PurchasesPackage; annual: PurchasesPackage }> {
  if (!configureGoldSubscriptions()) throw new Error('REVENUECAT_NOT_CONFIGURED');
  const offerings = await Purchases.getOfferings();
  const offering = offerings.current;
  if (!offering?.monthly || !offering.annual) throw new Error('GOLD_OFFERING_UNAVAILABLE');
  return { offering, monthly: offering.monthly, annual: offering.annual };
}

export async function getGoldStatus() {
  if (!configureGoldSubscriptions()) throw new Error('REVENUECAT_NOT_CONFIGURED');
  await identityTask;
  return hasGold(await Purchases.getCustomerInfo());
}

export async function buyGold(aPackage: PurchasesPackage) {
  if (!configureGoldSubscriptions()) throw new Error('REVENUECAT_NOT_CONFIGURED');
  await identityTask;
  const { customerInfo } = await Purchases.purchasePackage(aPackage);
  return hasGold(customerInfo);
}

export async function restoreGold() {
  if (!configureGoldSubscriptions()) throw new Error('REVENUECAT_NOT_CONFIGURED');
  await identityTask;
  return hasGold(await Purchases.restorePurchases());
}
