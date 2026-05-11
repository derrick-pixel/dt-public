# CF Zero Trust (Static Admin Paths)

Edge-level auth gate for static-site admin paths. Cloudflare Access runs the gate on Cloudflare's edge before any of your site assets serve. Users hit the IdP login first. No app-side auth code, no server.

## What you get

- A gate that runs on Cloudflare's edge before any of your site assets serve.
- Identity from your IdP (Google OAuth recommended).
- A `CF_Authorization` JWT cookie you can read client-side if you want to display the signed-in user.
- Works on pure-static sites (CF Pages or any CF-proxied origin).

## When to use

- Small set of known admins; underlying site is static; you don't want to ship app-level auth.
- The admin set rarely changes (re-listing emails in CF policy is fine).
- Audit logs at the edge (CF logs sign-ins).

## When to skip

- You need per-user state inside the app (use `magic-link-auth-supabase` instead).
- You need fine-grained RBAC (CF Access policies are coarse).
- Users are outside Google's IdP reach (personal Gmail addresses for partners you don't fully trust — Google IdP works, but you lose org-level access management).

## Wire-up steps

1. Move the site to CF Pages or proxy via CF DNS (so the path is behind Cloudflare's edge).
2. In CF Zero Trust → Access → Applications, create a Self-hosted Application.
3. Set the Application URL to `yourdomain.com/admin/*` (or the path you want to gate).
4. **Configure Google OAuth IdP first** — do NOT start with OTP (see pitfall `bba-cf-access-otp-unreliable`). Set up an OAuth client in Google Cloud Console; paste its client ID + secret into CF Zero Trust → Settings → Authentication → Login methods.
5. Attach the IdP to your application.
6. Add an Allow policy listing admin emails (or an email-domain rule).
7. Test in incognito — you should be redirected to Google, then to the admin page.

## Honest scar

Started with OTP delivery (CF Access's default option). Several emails never arrived in SG inboxes. Migrated to Google OAuth IdP — delivery problem disappeared; sign-in UX got faster (no email round-trip).

## Past uses

- derrickteo.com `/xinceai/admin/*`
- derrickteo.com `/aevum/admin/*`
- derrickteo.com `/elix-eor/admin/*`
