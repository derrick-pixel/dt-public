# Example use — derrickteo.com admin paths

Three admin paths on derrickteo.com are gated by this exact recipe:

- `/xinceai/admin/*`
- `/aevum/admin/*`
- `/elix-eor/admin/*`

All three are static HTML admin shells (no backend) — CF Access is the entire auth story.

## The scar

Started with OTP delivery (CF Access's default option). Several emails never arrived in SG inboxes. Migrated to Google OAuth IdP. Delivery problem disappeared; sign-in UX got faster (no email round-trip).

## Why Google OAuth IdP over OTP

- Free tier supports it.
- Most admin users already have a Google identity (Workspace or personal).
- No email-deliverability dependency.
- Sign-in is one click + a Google consent screen.
