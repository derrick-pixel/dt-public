// Singapore PayNow Corporate (UEN) QR — EMVCo TLV format.
// Spec: SGQR + PayNow proprietary tag set 26.
// Output is the raw EMV string. Render to image via QRCode.toCanvas / toDataURL.
(function () {
  function tlv(id, value) {
    const len = value.length.toString().padStart(2, "0");
    return id + len + value;
  }

  function crc16(s) {
    let crc = 0xffff;
    for (let i = 0; i < s.length; i++) {
      crc ^= s.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  // {
  //   uen:        "201912345A"        Elitez UEN
  //   amount:    250.00               SGD, two decimals
  //   reference: "EXR-2026-00001"     pre-fills bill ref field in banking app
  //   editable:  false                if true, holder can edit the amount
  //   merchant:  "ELITEZ GROUP PTE LTD"
  // }
  function buildPayNowQR({ uen, amount, reference, editable = false, merchant = "ELITEZ GROUP PTE LTD" }) {
    if (!uen) throw new Error("uen required");
    if (!(amount > 0)) throw new Error("amount must be positive");
    if (!reference) throw new Error("reference required");

    const tag26 =
      tlv("00", "SG.PAYNOW") +
      tlv("01", "2") + // 2 = UEN (1 = mobile)
      tlv("02", uen) +
      tlv("03", editable ? "1" : "0");

    const tag62 = tlv("01", reference);

    let payload =
      tlv("00", "01") +        // Payload Format Indicator
      tlv("01", "12") +        // Point of Initiation Method: 12 = dynamic
      tlv("26", tag26) +
      tlv("52", "0000") +      // MCC (0000 = unspecified)
      tlv("53", "702") +       // Currency: 702 = SGD
      tlv("54", amount.toFixed(2)) +
      tlv("58", "SG") +        // Country
      tlv("59", merchant) +
      tlv("60", "Singapore") +
      tlv("62", tag62);

    payload += "6304";         // CRC tag + length placeholder
    payload += crc16(payload);
    return payload;
  }

  window.ESOPSGQR = { buildPayNowQR };
})();
