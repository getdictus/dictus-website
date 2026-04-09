export const stripeLinks = {
  5: "https://buy.stripe.com/PLACEHOLDER_5EUR",
  10: "https://buy.stripe.com/PLACEHOLDER_10EUR",
  25: "https://buy.stripe.com/PLACEHOLDER_25EUR",
  50: "https://buy.stripe.com/PLACEHOLDER_50EUR",
  custom: "https://buy.stripe.com/PLACEHOLDER_CUSTOM",
} as const;

export const btcpayConfig = {
  serverUrl: "https://btcpay.getdictus.com",
  storeId: "PLACEHOLDER_STORE_ID",
} as const;

export const AMOUNTS = [5, 10, 25, 50] as const;
export const MIN_AMOUNT = 1;
export const MAX_AMOUNT = 999;
