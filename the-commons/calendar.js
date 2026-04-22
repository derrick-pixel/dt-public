/* ==========================================================
   THE COMMONS — iCalendar (.ics) generator
   ---------------------------------------------------------
   Creates a standards-compliant .ics file attendees can
   import into Google / Apple / Outlook calendars.
   ========================================================== */

(function () {
  'use strict';

  function _icsDate(date, time) {
    // YYYYMMDDTHHMMSS (local) — good enough for friendly events.
    const d = new Date((date || '1970-01-01') + 'T' + (time || '00:00') + ':00');
    if (isNaN(d.getTime())) return '19700101T000000';
    const pad = n => String(n).padStart(2, '0');
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
           'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  }

  function _escape(s) {
    return String(s || '')
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }

  function buildICS(event) {
    if (!event) return null;
    const start = _icsDate(event.date, event.time);
    // Default 4hr duration; organisers can set `event.durationMins` later.
    const durationMins = Number(event.durationMins || 240);
    const endDate = new Date((event.date || '1970-01-01') + 'T' + (event.time || '00:00') + ':00');
    endDate.setMinutes(endDate.getMinutes() + durationMins);
    const pad = n => String(n).padStart(2, '0');
    const end = endDate.getFullYear() + pad(endDate.getMonth() + 1) + pad(endDate.getDate()) +
                'T' + pad(endDate.getHours()) + pad(endDate.getMinutes()) + '00';

    const now = new Date();
    const stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) +
                  'T' + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + 'Z';

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//The Commons//Event//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + event.id + '@thecommons.asia',
      'DTSTAMP:' + stamp,
      'DTSTART:' + start,
      'DTEND:' + end,
      'SUMMARY:' + _escape(event.title),
      'DESCRIPTION:' + _escape((event.description || '') + '\nOrganised via The Commons · PayNow 9100 2050'),
      'LOCATION:' + _escape(event.location || ''),
      'STATUS:CONFIRMED',
      'URL:' + (typeof location !== 'undefined' ? location.origin + location.pathname + '?slug=' + encodeURIComponent(event.slug) : ''),
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return lines.join('\r\n');
  }

  function downloadICS(event) {
    const ics = buildICS(event);
    if (!ics) return;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (event.slug || 'event') + '.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Google Calendar "quick add" URL — works without file download.
  function googleCalUrl(event) {
    if (!event) return '#';
    const start = _icsDate(event.date, event.time);
    const endDate = new Date((event.date || '1970-01-01') + 'T' + (event.time || '00:00') + ':00');
    endDate.setMinutes(endDate.getMinutes() + Number(event.durationMins || 240));
    const pad = n => String(n).padStart(2, '0');
    const end = endDate.getFullYear() + pad(endDate.getMonth() + 1) + pad(endDate.getDate()) +
                'T' + pad(endDate.getHours()) + pad(endDate.getMinutes()) + '00';
    const q = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title || '',
      dates: start + '/' + end,
      details: event.description || '',
      location: event.location || ''
    });
    return 'https://calendar.google.com/calendar/render?' + q.toString();
  }

  window.TCCalendar = { buildICS: buildICS, downloadICS: downloadICS, googleCalUrl: googleCalUrl };
})();
