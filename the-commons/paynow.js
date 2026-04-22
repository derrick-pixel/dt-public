/* ==========================================================
   THE COMMONS — PayNow SGQR generator
   ---------------------------------------------------------
   All escrow payments route to the platform PayNow account.
   Target: 91002050  (mobile)
   Merchant: The Commons · Singapore
   ---------------------------------------------------------
   Usage (after qrcode@1.5.3 is loaded):
     TCPayNow.render(containerEl, { amount: 50, reference: 'TC-...' })
   ========================================================== */

(function () {
  'use strict';

  const TC_PAYNOW = {
    mobile: '91002050',
    merchantName: 'The Commons',
    merchantCity: 'Singapore',
    currency: '702'
  };

  // ── TLV helper ─────────────────────────────────────────
  function tlv(tag, value) {
    const v = String(value == null ? '' : value);
    const len = v.length.toString().padStart(2, '0');
    return tag + len + v;
  }

  // ── CRC16-CCITT (poly 0x1021, init 0xFFFF) ─────────────
  function crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= (str.charCodeAt(i) << 8);
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  // ── Build SGQR payload for PayNow Mobile ───────────────
  function buildPayload(opts) {
    const { amount, reference, editable = false, expiry = '20991231' } = opts || {};

    const merchantAccount =
      tlv('00', 'SG.PAYNOW') +
      tlv('01', '0') +                                 // proxy type = mobile
      tlv('02', '+65' + TC_PAYNOW.mobile) +
      tlv('03', editable ? '1' : '0') +
      tlv('04', expiry);

    const additionalData = reference ? tlv('01', reference) : '';

    let payload =
      tlv('00', '01') +                                 // payload format indicator
      tlv('01', amount != null ? '12' : '11') +         // 12 dynamic, 11 static
      tlv('26', merchantAccount) +
      tlv('52', '0000') +                               // merchant category
      tlv('53', TC_PAYNOW.currency) +                   // 702 = SGD
      (amount != null ? tlv('54', Number(amount).toFixed(2)) : '') +
      tlv('58', 'SG') +
      tlv('59', TC_PAYNOW.merchantName) +
      tlv('60', TC_PAYNOW.merchantCity) +
      (additionalData ? tlv('62', additionalData) : '');

    payload += '6304';                                  // CRC tag + length, then value
    return payload + crc16(payload);
  }

  // ── Reference code generator ───────────────────────────
  function makeReference(prefix) {
    const p = (prefix || 'TC').toUpperCase();
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return p + '-' + date + '-' + rand;
  }

  // ── Render QR into a DOM element using qrcodejs (davidshimjs) ─
  // API: new QRCode(element, { text, width, height, colorDark, colorLight, correctLevel })
  function render(containerEl, opts) {
    if (!containerEl) return null;
    const options = Object.assign({}, opts);
    if (!options.reference) options.reference = makeReference(options.refPrefix);

    const payload = buildPayload(options);

    // Clear previous contents without innerHTML
    while (containerEl.firstChild) containerEl.removeChild(containerEl.firstChild);

    if (typeof QRCode === 'undefined') {
      // Fallback: show payload as text so the user can still see it.
      const pre = document.createElement('pre');
      pre.style.fontSize = '10px';
      pre.style.whiteSpace = 'pre-wrap';
      pre.style.wordBreak = 'break-all';
      pre.style.padding = '12px';
      pre.style.background = '#fff';
      pre.style.border = '1px solid #eee';
      pre.style.borderRadius = '8px';
      pre.textContent = payload;
      containerEl.appendChild(pre);
      return { payload: payload, reference: options.reference, fallback: true };
    }

    // Wrapper so qrcodejs can draw into a dedicated node and we style the frame.
    const wrap = document.createElement('div');
    wrap.style.display = 'inline-block';
    wrap.style.padding = '12px';
    wrap.style.background = '#FFFFFF';
    wrap.style.borderRadius = '12px';
    wrap.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
    containerEl.appendChild(wrap);

    try {
      /* eslint-disable no-new */
      new QRCode(wrap, {
        text: payload,
        width: 240,
        height: 240,
        colorDark: '#1A1A2E',
        colorLight: '#FFFFFF',
        correctLevel: (QRCode.CorrectLevel && QRCode.CorrectLevel.M) || 0
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('PayNow QR render failed:', e);
    }

    return { payload: payload, reference: options.reference };
  }

  // ── Public surface ─────────────────────────────────────
  window.TCPayNow = {
    MOBILE: TC_PAYNOW.mobile,
    MERCHANT_NAME: TC_PAYNOW.merchantName,
    buildPayload: buildPayload,
    makeReference: makeReference,
    render: render
  };
})();
