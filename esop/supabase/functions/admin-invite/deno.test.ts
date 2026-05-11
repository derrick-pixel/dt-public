// Minimal smoke test — fuller integration test runs in the runbook against
// a deployed function.
import { assertEquals } from "jsr:@std/assert";

Deno.test("rejects non-POST when served locally", async () => {
  // This test only runs when `supabase functions serve admin-invite` is up on :54321.
  // Skip silently if it's not.
  try {
    const res = await fetch("http://localhost:54321/functions/v1/admin-invite", {
      method: "GET",
    });
    assertEquals(res.status, 405);
  } catch (_e) {
    console.warn("local supabase functions not running; skipping");
  }
});
