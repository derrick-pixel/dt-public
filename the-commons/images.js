/* ==========================================================
   THE COMMONS — Cover image picker
   ---------------------------------------------------------
   Deterministic: given an event's id + category, always
   returns the same Unsplash image URL. Organisers can
   override via event.coverImage.
   ========================================================== */

(function () {
  'use strict';

  // Curated Unsplash photo IDs (royalty-free, non-watermarked, commercial-use OK).
  // Each entry renders via `?auto=format&fit=crop&w=1200&h=630&q=80` for OG-sized
  // covers and a smaller variant for card thumbnails.
  const POOLS = {
    yacht: [
      'photo-1540946485063-a13cbf5d1f06',  // sailing yacht sunset
      'photo-1544551763-46a013bb70d5',     // yacht deck
      'photo-1569263979104-865ab7cd8d13',  // marina
      'photo-1502160716929-c661c3b5e5e1',  // yacht horizon
      'photo-1596526131083-e8c633c948d2'   // sunset boat
    ],
    festival: [
      'photo-1459749411175-04bf5292ceea',  // festival crowd
      'photo-1514525253161-7a46d19cd819',  // stage lights
      'photo-1508700115892-45ecd05ae2ad',  // dj lights
      'photo-1506157786151-b8491531f063',  // crowd silhouette
      'photo-1470229722913-7c0e2dbbafd3'   // neon stage
    ],
    hike: [
      'photo-1551632811-561732d1e306',     // forest hike
      'photo-1464822759023-fed622ff2c3b',  // mountain path
      'photo-1533240332313-0db49b459ad6',  // sunrise hike
      'photo-1519904981063-b0cf448d479e',  // greenery
      'photo-1501555088652-021faa106b9b'   // river trail
    ],
    party: [
      'photo-1530103862676-de8c9debad1d',  // rooftop bar
      'photo-1414235077428-338989a2e8c0',  // party lights
      'photo-1492684223066-81342ee5ff30',  // cocktails table
      'photo-1543007630-9710e4a00a20',     // disco lights
      'photo-1533174072545-7a4b6ad7a6c3'   // confetti
    ],
    travel: [
      'photo-1506929562872-bb421503ef21',  // bali rice
      'photo-1512100356356-de1b84283e18',  // pool villa
      'photo-1570789210967-2cac24afeb00',  // airplane window
      'photo-1540541338287-41700207dee6',  // tropical road
      'photo-1540202404-a2f29016b523'      // beach retreat
    ],
    food: [
      'photo-1414235077428-338989a2e8c0',  // communal table
      'photo-1555939594-58d7cb561ad1',     // plating
      'photo-1476224203421-9ac39bcb3327',  // food spread
      'photo-1432139509613-5c4255815697',  // chefs
      'photo-1504674900247-0877df9cc836'   // peranakan dish
    ],
    learn: [
      'photo-1513364776144-60967b0f800f',  // workshop
      'photo-1587440871875-191322ee64b0',  // pottery class
      'photo-1556761175-4b46a572b786',     // art class
      'photo-1524178232363-1fb2b075b655',  // classroom
      'photo-1552664730-d307ca884978'      // presentation
    ],
    sport: [
      'photo-1517649763962-0c623066013b',  // runners
      'photo-1571008887538-b36bb32f4571',  // football
      'photo-1530549387789-4c1017266635',  // fitness
      'photo-1552674605-db6ffd4facb5',     // running track
      'photo-1571019613454-1cb2f99b2d8b'   // gym
    ]
  };
  const FALLBACK = POOLS.party;

  function _hash(str) {
    let h = 0;
    for (let i = 0; i < String(str || '').length; i++) {
      h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  // url size: 'cover' (1200x630) or 'card' (800x450) or 'thumb' (400x240)
  function coverFor(event, size) {
    if (!event) return null;
    if (event.coverImage) return event.coverImage;
    const pool = POOLS[event.category] || FALLBACK;
    const id = pool[_hash(event.id || event.slug || event.title || '') % pool.length];
    const dims = size === 'thumb' ? 'w=400&h=240'
               : size === 'card' ? 'w=800&h=450'
               : 'w=1200&h=630';
    return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&' + dims + '&q=80';
  }

  // List of available photo IDs for a category — useful if we add
  // a "change cover image" picker later.
  function optionsForCategory(category) {
    const pool = POOLS[category] || FALLBACK;
    return pool.map(id => ({
      id: id,
      thumb: 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=200&h=120&q=60',
      full:  'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=1200&h=630&q=80'
    }));
  }

  window.TCImages = {
    coverFor: coverFor,
    optionsForCategory: optionsForCategory,
    POOLS: POOLS
  };
})();
