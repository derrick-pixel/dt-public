/**
 * Singapore PayNow QR code generator.
 * Follows the EMVCo Merchant QR Code Specification used by all Singapore banks.
 */

/** Build a TLV (Tag-Length-Value) field */
function tlv(tag: string, value: string): string {
  const len = String(value.length).padStart(2, '0')
  return `${tag}${len}${value}`
}

/** CRC16-CCITT (polynomial 0x1021, init 0xFFFF) */
function crc16(data: string): string {
  let crc = 0xffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }
  return ((crc & 0xffff).toString(16).toUpperCase().padStart(4, '0'))
}

export interface PayNowQRParams {
  /** Mobile number — with or without +65 prefix */
  mobile: string
  /** Amount in SGD */
  amount: number
  /** Payment reference / remarks (max 25 chars) */
  reference: string
  /** Merchant name displayed in banking app (max 25 chars) */
  merchantName?: string
}

/**
 * Returns the raw EMV QR string for a PayNow payment.
 * Pass this into a QR library (e.g. `qrcode`) to render as an image.
 */
export function buildPayNowQRString(params: PayNowQRParams): string {
  const mobile = params.mobile.startsWith('+65')
    ? params.mobile
    : `+65${params.mobile.replace(/\s/g, '')}`

  const merchantName = (params.merchantName ?? 'Discounter SG').substring(0, 25)
  const reference = params.reference.substring(0, 25).toUpperCase()
  const amount = params.amount.toFixed(2)

  // Tag 26 — PayNow merchant account info
  const paynowInfo = [
    tlv('00', 'SG.PAYNOW'),
    tlv('01', '0'),      // proxy type: 0 = mobile number
    tlv('02', mobile),
    tlv('03', '1'),      // editable: 1 = fixed amount (non-editable)
  ].join('')

  // Tag 62 — additional data (payment reference shown in banking app)
  const additionalData = tlv('05', reference)

  // Build the QR payload (everything before CRC)
  const payload = [
    tlv('00', '01'),              // payload format indicator
    tlv('01', '12'),              // dynamic QR (12 = one-time use)
    tlv('26', paynowInfo),        // PayNow merchant account
    tlv('52', '0000'),            // merchant category code
    tlv('53', '702'),             // currency: SGD (ISO 4217)
    tlv('54', amount),            // transaction amount
    tlv('58', 'SG'),              // country code
    tlv('59', merchantName),      // merchant name
    tlv('60', 'Singapore'),       // city
    tlv('62', additionalData),    // additional data
    '6304',                       // CRC tag (value appended below)
  ].join('')

  return payload + crc16(payload)
}

/** Extract last name from a full name string */
export function extractLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  return parts[parts.length - 1] ?? fullName
}

/** Build the payment reference from last name + postal code */
export function buildPaymentRef(fullName: string, postalCode: string): string {
  const lastName = extractLastName(fullName)
  return `${lastName} ${postalCode}`.toUpperCase().substring(0, 25)
}
