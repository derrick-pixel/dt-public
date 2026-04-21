# PayNow QR

Generates EMVCo-compliant Singapore PayNow QR codes in the browser.

## What it does
Takes mobile number (or UEN) + amount + optional reference, produces scannable QR that SG bank apps (DBS, UOB, OCBC) parse as PayNow transaction.

## When to plug in
- Transactional sites (checkout, donations, invoicing)
- Any SG-facing site that takes payment

## Trade-offs
- **Pro:** Native SG payment, zero customer fees, instant settlement.
- **Con:** SG-only. Overseas users can't scan.
- **Con:** No webhook — you don't know if payment happened without second channel (email, phone).

## How to use

1. Include QRCode library in page head:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
   ```
2. Copy snippet block from `snippet.html` into your checkout page.
3. Call `renderPaynowQR({ targetElementId, phoneOrUEN, amountSGD, referenceText })`.

## Linked pitfalls
- `trans-paynow-wrong-amount` — verify UI amount === QR amount
- `trans-paynow-no-checksum` — CRC16 mandatory
- `trans-ui-qr-mismatch` — single source of truth for amount

## Sourced from
altru/checkout.html + discounter/src/pages/checkout.tsx.
