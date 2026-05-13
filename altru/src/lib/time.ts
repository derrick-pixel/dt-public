export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function daysFromNowSeconds(days: number): number {
  return nowSeconds() + days * 86400;
}
