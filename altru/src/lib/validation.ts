const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[a-z0-9-]{3,64}$/;
const NRIC_RE = /^[STFGM]\d{7}[A-Z]$/;
const MOBILE_RE = /^\+?[1-9]\d{6,14}$/;

const SLUG_DENYLIST: ReadonlySet<string> = new Set([
  'admin', 'api', 'app', 'docs', 'about', 'help', 'support', 'login',
  'signup', 'register', 'donor', 'couple', 'charities', 'privacy',
  'terms', 'index', 'wedding', 'gift', 'home', 'root', 'static',
  'public', 'assets', 'images', 'css', 'js', 'fonts',
]);

export function isValidEmail(email: string): boolean {
  return typeof email === 'string'
    && email.length <= 254
    && EMAIL_RE.test(email);
}

export function isValidMobile(mobile: string): boolean {
  return typeof mobile === 'string' && MOBILE_RE.test(mobile);
}

export function isValidSlug(slug: string): boolean {
  if (!SLUG_RE.test(slug)) return false;
  if (SLUG_DENYLIST.has(slug)) return false;
  if (/^-|-$/.test(slug)) return false;
  if (/--/.test(slug)) return false;
  return true;
}

export function isValidWeddingDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(d.getTime())) return false;
  const now = Date.now();
  const pastBound = now - 30 * 86400 * 1000;
  const futureBound = now + 730 * 86400 * 1000;
  const t = d.getTime();
  return t >= pastBound && t <= futureBound;
}

const NRIC_CHECKSUMS = {
  S: ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'],
  T: ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'],
  F: ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'],
  G: ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'],
  M: ['K', 'L', 'J', 'N', 'P', 'Q', 'R', 'T', 'U', 'W', 'X'],
} as const;

export function isValidNRIC(nric: string): boolean {
  if (typeof nric !== 'string' || !NRIC_RE.test(nric)) return false;
  const weights = [2, 7, 6, 5, 4, 3, 2];
  const digits = nric.substring(1, 8).split('').map(Number);
  let sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
  const prefix = nric[0] as keyof typeof NRIC_CHECKSUMS;
  if (prefix === 'T' || prefix === 'G') sum += 4;
  if (prefix === 'M') sum += 3;
  const expected = NRIC_CHECKSUMS[prefix]?.[sum % 11];
  return expected === nric[8];
}

const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;

export function generateSlug(coupleNames: string[], weddingDate: string): string {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const first1 = clean(coupleNames[0] ?? '');
  const first2 = clean(coupleNames[1] ?? '');
  const monthNum = parseInt(weddingDate.split('-')[1] ?? '0', 10);
  const monthName = MONTHS[monthNum - 1] ?? 'xxx';
  let slug = first2 ? `${first1}-and-${first2}-${monthName}` : `${first1}-${monthName}`;
  if (slug.length < 3) {
    const r = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    slug = `wedding-${r}`;
  }
  if (slug.length > 64) slug = slug.slice(0, 64).replace(/-$/, '');
  return slug;
}
