# Brief to Singapore Payments Counsel · MAS PSA Posture for Altru

**From:** Derrick Teo, Founder, Altru Asia Pte Ltd
**Date:** 11 May 2026
**Scope of engagement requested:** ~1 hour written opinion (~S$300–600)
**Confidentiality:** This brief and any response are confidential and privileged.

---

## 1 · What we are asking

We would like a written opinion confirming whether **Altru Asia Pte Ltd's operating model requires licensing or registration under the Payment Services Act 2019 (PSA)**, and if so, which class of licence or which exemption applies.

The core uncertainty is whether Altru holds "specified payment services" funds long enough, and in a manner that meets the statutory definitions of:
- Domestic money transfer service (s.2 PSA)
- E-money issuance (s.2 PSA)
- Account issuance (s.2 PSA)

A definitive view is needed before we operate any real-money flow.

---

## 2 · About Altru (one paragraph)

Altru Asia Pte Ltd is a recently incorporated Singapore Pte Ltd. It operates altru.asia, a wedding-giving platform. Wedding couples register on Altru and invite their guests to direct a portion of their ang-bao gift to one of three curated IPC-registered Singapore charities, chosen by the couple. Altru is regulated under the Charities Act 1994 as a Commercial Fundraiser and operates the Code for Commercial Fundraisers in full. Our public-facing description of the model is at <https://altru.asia/charities/escrow.html>.

---

## 3 · The specific fund flow

Annotated step-by-step:

1. **Wedding guest** initiates a gift on altru.asia, selecting a gift amount and a split between the couple (personal) and the partner charity (charitable).
2. **HitPay** (HitPay Payment Solutions Pte Ltd, a MAS-licensed Major Payment Institution) receives the guest's PayNow payment as Altru's payment service provider, and credits the gross amount to Altru's HitPay merchant balance.
3. HitPay **pays out** to Altru's designated DBS corporate bank account on its standard T+1 / T+2 cycle.
4. The funds rest in Altru's DBS account as a **segregated escrow balance** for the remainder of a 14-day window measured from the timestamp of the original guest payment.
5. **Couple authorisation event:**
   - If the couple **authorises** release within the 14 days, Altru transfers the charity-portion to the partner charity's PayNow-UEN. The couple's personal-portion is transferred to the couple's nominated account.
   - If the couple **does not authorise** within 14 days, Altru triggers a **refund** of the full gift amount to the guest, via HitPay's refund API.
   - The guest also retains a **unilateral right of refund** during the window.
6. Altru issues a **separate monthly invoice** to the partner charity for a 5% platform fee on funds successfully released. The 5% is not deducted from the donation; it is paid by the charity from its operating funds. This structure is to comply with §B.1 of the Code for Commercial Fundraisers ("paid in gross").

The full architectural description is in our public Stage 0 decisions doc at <https://altru.asia/docs/stage0-decisions.md>.

---

## 4 · Why we think we may be in scope

We have read s.2 of the PSA and the MAS PS-N02 Notice. The candidate concerns:

- **Domestic Money Transfer Service.** Funds rest in Altru's bank account for up to 14 days before being forwarded to the partner charity (the ultimate beneficiary) or refunded. Although the gross funds first sit on HitPay's books, the T+1/T+2 payout to Altru means Altru is the holder of those funds for the bulk of the window.
- **E-Money / Account Issuance.** Altru issues a "Wedding Dashboard" to each Couple, showing pending and authorised gifts. The dashboard is operational only — it does not allow the Couple to spend the balance freely or transfer to third parties — but the resemblance to an account view may raise the question.

We do not believe Altru meets the definition of a digital payment token service, cross-border money transfer service, merchant acquisition service, or account issuance service in their conventional senses.

---

## 5 · Specific questions to answer

1. **Primary question.** Is Altru's fund flow, as described in Section 3, a "specified payment service" under the PSA, requiring either a licence (Standard Payment Institution / Major Payment Institution) or registration?

2. **If yes — class.** Which class? At our forecast first-year volume (under S$3M), would the small-scale exemption (PSA s.13 read with the relevant subsidiary legislation) apply?

3. **If yes — alternative structure.** If a structural change would put us cleanly out of scope, what would that change be? Specifically: would routing the charity-portion *directly* from HitPay to the partner-charity UEN — with Altru's 14-day window enforced via the HitPay refund window rather than an Altru-held escrow — remove the licensing question?

4. **Couple's personal portion.** Does the same answer apply to the couple's personal portion of the gift, or is the analysis different because the couple is both the payee of record (effectively) and the registered platform user?

5. **Documentation.** What records does Altru need to maintain (and for how long) to evidence compliance with whichever conclusion you reach? We already maintain immutable audit logs of every state transition with 5-year retention under the Charities Act; we want to know if PSA imposes anything additional.

6. **Insurance.** Is the 30/70 fundraising-efficiency cap and the Charity Act regime the only Singapore-specific cap we should manage to, or does the PSA conclusion shape any insurance or capital requirement?

---

## 6 · What we are willing to do

We are willing to:
- Restructure the fund flow if a clean alternative exists. Our preference for Altru-held escrow is operational, not strategic.
- Apply for an exemption or licence if required, with a realistic timeline.
- Maintain whatever records, controls, audit, and reporting your opinion requires.

We are **not** willing to:
- Operate in the grey zone of a possibly-unlicensed money-transfer service.
- Hold funds longer than 14 days without an explicit lawful basis.

---

## 7 · Documents we can share on request

- Altru Asia Pte Ltd ACRA business profile.
- HitPay merchant agreement (under their NDA, on signature).
- Our internal PDPA programme (<https://altru.asia/docs/pdpa-programme.md>).
- Draft Privacy Notice and Terms of Service (<https://altru.asia/privacy.html>, <https://altru.asia/terms.html>).
- The two SCS template agreements we have been negotiating against (MOA and PFA), both standard COC-compliant templates.

---

## 8 · Practicalities

- **Preferred turnaround:** 7 calendar days from instruction.
- **Format:** a written memo (≤ 5 pages) with a clear go/no-go conclusion in the first paragraph and supporting reasoning thereafter.
- **Follow-up:** we may have one round of clarification (≤ 30 minutes) after reading.
- **Engagement letter:** please send your standard form; we will counter-sign within 48 hours.

Thank you. Please direct your reply to `derrick@elitez.asia` and copy `dpo@altru.asia`.

— Derrick Teo, Founder, Altru Asia Pte Ltd
