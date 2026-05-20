/* ════════════════════════════════════════════════════════════════
   Elitez — Admin activity tracker
   ----------------------------------------------------------------
   Beacons admin-page activity to the `track-admin-activity` Edge
   Function on Supabase project suehogmzjspagcsrqvsw.

   Captures per session:
     - login         on first authenticated session observed
     - heartbeat     every 30s while the tab is visible
     - session_end   on pagehide / unload (carries total visible_ms)
     - logout        on explicit sign-out

   Server-side enriches with: IP, country (ISO 3166-1 alpha-2),
   device_type, browser, OS — all derived from request headers,
   never trusted from the client.

   Wiring: drop this AFTER auth-gate.js on any gated admin page:

     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
     <script src="assets/js/auth-gate.js"></script>
     <script src="assets/js/activity-tracker.js"></script>

   Idempotent — safe to include on every admin page.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (!window._sbReady || !window._sb) return;
  if (window.__elitezActivityTracker) return;
  window.__elitezActivityTracker = true;

  var ENDPOINT      = 'https://suehogmzjspagcsrqvsw.supabase.co/functions/v1/track-admin-activity';
  var HEARTBEAT_MS  = 30 * 1000;

  var sessionId      = null;
  var visibleStartTs = null;   // ms timestamp of current "visible" run
  var visibleAccumMs = 0;      // total visible ms so far this session
  var heartbeatTimer = null;
  var started        = false;
  var currentJwt     = null;

  function uuidv4() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function (c) {
      var r = crypto.getRandomValues(new Uint8Array(1))[0];
      return ((+c ^ r) & (15 >> (+c / 4))).toString(16);
    });
  }

  function visibleMsTotal() {
    var live = visibleStartTs ? (Date.now() - visibleStartTs) : 0;
    return visibleAccumMs + live;
  }

  function send(eventType, extra) {
    if (!currentJwt || !sessionId) return;
    var payload = Object.assign({
      event_type: eventType,
      session_id: sessionId,
      page_path:  location.pathname,
    }, extra || {});
    try {
      fetch(ENDPOINT, {
        method:  'POST',
        headers: {
          'authorization': 'Bearer ' + currentJwt,
          'content-type':  'application/json',
        },
        body:      JSON.stringify(payload),
        keepalive: true,                // survives pagehide
        mode:      'cors',
        credentials: 'omit',
      }).catch(function () {});
    } catch (_) {}
  }

  function startHeartbeats() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(function () {
      if (!started) return;
      if (document.visibilityState !== 'visible') return;
      send('heartbeat', { duration_ms: visibleMsTotal() });
    }, HEARTBEAT_MS);
  }

  function onVisibilityChange() {
    var now = Date.now();
    if (document.visibilityState === 'visible') {
      if (visibleStartTs == null) visibleStartTs = now;
    } else if (visibleStartTs != null) {
      visibleAccumMs += (now - visibleStartTs);
      visibleStartTs  = null;
    }
  }

  function onPageHide() {
    if (!started) return;
    onVisibilityChange(); // flush the live "visible" run into the accumulator
    send('session_end', { duration_ms: visibleAccumMs });
  }

  function beginSession() {
    if (started) return;
    started        = true;
    sessionId      = uuidv4();
    visibleAccumMs = 0;
    visibleStartTs = (document.visibilityState === 'visible') ? Date.now() : null;
    send('login');
    startHeartbeats();
  }

  function endSessionLocal() {
    if (!started) return;
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
    onVisibilityChange();
    send('logout', { duration_ms: visibleAccumMs });
    started = false;
  }

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', onPageHide);

  window._sbReady.then(function (sb) {
    sb.auth.onAuthStateChange(function (event, session) {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session) {
        currentJwt = session.access_token;
        if (!started) beginSession();
      } else if (event === 'SIGNED_OUT') {
        endSessionLocal();
      }
    });

    // Cover the page-load case where the session already exists but
    // INITIAL_SESSION may have fired before our listener registered.
    sb.auth.getSession().then(function (res) {
      var s = res && res.data && res.data.session;
      if (s) {
        currentJwt = s.access_token;
        if (!started) beginSession();
      }
    });
  });
})();
