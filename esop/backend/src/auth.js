// Cloudflare Access JWT validation.
// All requests through esop.derrickteo.com pass the Access edge first; the
// edge sets the `cf-access-jwt-assertion` header and the
// `cf-access-authenticated-user-email` header. We trust the email but
// independently verify the JWT signature so a misconfigured route can't
// be exploited.

const JWKS_TTL_MS = 60 * 60 * 1000; // 1h
let cachedKeys = null;
let cachedKeysAt = 0;

async function loadKeys(teamDomain) {
  if (cachedKeys && Date.now() - cachedKeysAt < JWKS_TTL_MS) return cachedKeys;
  const url = `https://${teamDomain}/cdn-cgi/access/certs`;
  const r = await fetch(url, { cf: { cacheEverything: true, cacheTtl: 3600 } });
  if (!r.ok) throw new Error(`JWKS fetch ${r.status}`);
  const data = await r.json();
  cachedKeys = data.keys || [];
  cachedKeysAt = Date.now();
  return cachedKeys;
}

function b64urlDecode(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}

function b64urlDecodeStr(s) {
  return new TextDecoder().decode(b64urlDecode(s));
}

async function importKey(jwk) {
  return crypto.subtle.importKey(
    "jwk", jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["verify"]
  );
}

export async function verifyAccessJwt(jwt, env) {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;
  let header, payload;
  try {
    header = JSON.parse(b64urlDecodeStr(headerB64));
    payload = JSON.parse(b64urlDecodeStr(payloadB64));
  } catch { return null; }

  // Check expiry & audience
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) return null;
  if (env.CF_ACCESS_AUD && Array.isArray(payload.aud) && !payload.aud.includes(env.CF_ACCESS_AUD)) return null;
  if (env.CF_ACCESS_AUD && typeof payload.aud === "string" && payload.aud !== env.CF_ACCESS_AUD) return null;

  // Verify signature
  try {
    const keys = await loadKeys(env.CF_ACCESS_TEAM_DOMAIN);
    const jwk = keys.find(k => k.kid === header.kid);
    if (!jwk) return null;
    const key = await importKey(jwk);
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const sig = b64urlDecode(sigB64);
    const ok = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      key, sig, data
    );
    if (!ok) return null;
  } catch (e) {
    return null;
  }

  return {
    email: (payload.email || "").toLowerCase(),
    sub: payload.sub,
    iat: payload.iat,
    exp: payload.exp
  };
}

export function classifyRole(email, env) {
  if (!email) return null;
  const e = email.toLowerCase();
  const committeeEmails = [
    env.COMMITTEE_DERRICK,
    env.COMMITTEE_CHEN,
    env.COMMITTEE_LIM,
    env.COMMITTEE_YVONNE
  ].filter(Boolean).map(s => s.toLowerCase());
  if (committeeEmails.includes(e)) return "committee";
  // The frontend's holder roster is in data.js; the Worker doesn't ship
  // with that list. The Cloudflare Access policy itself enforces who can
  // reach the API at all. Here we mark anyone outside Committee as 'holder'.
  return "holder";
}

// Pull identity from incoming request: prefer JWT-validated, fall back to
// CF-set header (for development bypass scenarios disable in prod).
export async function identify(request, env, { allowHeaderFallback = false } = {}) {
  const jwt =
    request.headers.get("cf-access-jwt-assertion") ||
    getCookie(request, "CF_Authorization");
  let identity = null;
  if (jwt) identity = await verifyAccessJwt(jwt, env);
  if (!identity && allowHeaderFallback) {
    const email = (request.headers.get("cf-access-authenticated-user-email") || "").toLowerCase();
    if (email) identity = { email, sub: email, fallback: true };
  }
  if (!identity) return null;
  return { ...identity, role: classifyRole(identity.email, env) };
}

function getCookie(request, name) {
  const c = request.headers.get("cookie") || "";
  const m = c.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
