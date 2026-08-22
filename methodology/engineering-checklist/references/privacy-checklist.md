# GDPR / CCPA-Style Privacy Checklist

Reference this for a deeper privacy pass (new account/profile system, payments,
analytics integration, pre-launch review). The main SKILL.md covers the everyday
checks. This isn't legal advice — for anything regulated (health, finance, children's
data) or an actual EU/California user base, involve legal review; this is the
engineering-side checklist for building in a privacy-respecting default.

## Lawful basis & consent
- [ ] Every category of personal data collected has a stated reason (contract
  necessity, consent, legitimate interest) — not just "we might need it."
- [ ] Consent for non-essential processing (marketing emails, analytics, ad
  tracking) is opt-in and separate from consent for the core service — don't bundle
  them into one "I agree to the Terms" checkbox.
- [ ] Consent is as easy to withdraw as it was to give (an unsubscribe link, a
  toggle in settings — not a support ticket).

## Data subject rights
- [ ] **Right of access**: a user can get a copy of the personal data held about
  them (even a manual export for MVP scope, but the mechanism must exist).
- [ ] **Right to rectification**: users can correct inaccurate personal data about
  themselves through the product, not just by contacting support.
- [ ] **Right to erasure**: a deletion request actually deletes or irreversibly
  anonymizes personal data — check it doesn't linger in backups, logs, analytics
  events, or a third-party processor indefinitely.
- [ ] **Right to portability**: exported data is in a structured, machine-readable
  format (JSON/CSV), not a PDF screenshot.
- [ ] **CCPA "Do Not Sell/Share"**: if the product shares personal data with third
  parties for advertising, there's an opt-out, and it's honored before the next
  data share, not just recorded.

## Retention & minimization
- [ ] Personal data has a stated retention period per category, after which it's
  deleted or anonymized — not kept indefinitely "in case it's useful."
- [ ] Soft-deleted/deactivated records still containing personal data are covered
  by the same retention policy, not exempt because they're "already deleted" in the
  UI sense.
- [ ] Backups containing personal data expire on a schedule consistent with the
  retention policy, or deletion requests are tracked so they can be re-applied after
  a backup restore.

## Processing & storage
- [ ] PII is never logged in plaintext application logs (see SKILL.md) — this
  includes error-tracking tools (Sentry, etc.), which routinely capture request
  bodies by default and need scrubbing configured.
- [ ] Third-party processors that touch personal data (email provider, analytics,
  payment processor, hosting) have a Data Processing Agreement in place, or are
  flagged to the user as a gap before launch.
- [ ] Data residency requirements, if any (e.g. EU user data staying in EU regions),
  are reflected in the actual infra config (DB region, backup region), not just
  documented as an intent.
- [ ] Sensitive categories (health, biometric, precise location, children's data
  under 13/16) get explicit extra handling — flag to the user if a feature touches
  one of these, since they carry stricter rules (HIPAA, COPPA, etc.) this checklist
  doesn't cover.

## Breach readiness
- [ ] There's a way to determine, after the fact, which users' data was affected by
  an incident (audit logging on access to sensitive tables, not just on mutation).
- [ ] Security/access logs are retained long enough to support an investigation
  (commonly 90 days+) without themselves accumulating unneeded PII.

## Cookies & tracking
- [ ] Cookie banner (where required) distinguishes strictly-necessary cookies (no
  consent needed) from everything else (consent required before the script loads,
  not just before the cookie is "used").
- [ ] Consent state is itself stored and respected on every subsequent page load —
  not re-prompted every visit, and not silently defaulted to "accepted."
