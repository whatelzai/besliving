# Besliving: lead to tenant

## Current release

- Edmund is Superadmin; Lisa is Admin. Clerk profile names are user-editable; email local-part is the fallback when no name is set. Staff permissions remain in the server-side database.
- Anonymous visitors can browse and book a 30-minute viewing without creating an account. Admins publish individual slots, in Malaysia time, on the hour or half hour, up to 90 days ahead. Visitors supply a name and email or phone with consent.
- A database transaction locks the selected slot, creates the lead and appointment together, and prevents duplicate reservations. Confirmation appears on screen. Email/SMS delivery is not configured. Admins contact visitors to provide arrival details.
- Leads and Viewings are the main admin pages. Tenancies remain secondary. Sample inventory and Design System are removed. The existing waitlist contact was migrated to Leads before sample inventory deletion.
- Public Desa Aman pages are still curated content; they are not yet editable via the operational Units table.

## Access and lifecycle

Superadmin manages staff access and configuration. Admin manages leads, viewing availability, bookings, tenant operations and payment verification. Anonymous is an unauthenticated visitor, not a stored role. A lead is a contact with rental interest, not necessarily a registered account. A tenant has a linked account and signed tenancy. Do not grant staff permissions when changing a lead into a tenant.

## Next: agreements and tenant onboarding

Use an owner-approved tenancy template and confirmed rent, deposit, dates and parties. Generate a draft for review, record the signed agreement and approval, then activate tenancy. Do not treat a generated draft or a viewing booking as a signed contract. Preserve the lead record and link it to the tenant account.

## Next: bank transfer payments

User chose bank transfer/DuitNow with admin verification; no Stripe or card flow. Bank account details are deferred and must not be invented or published yet. Tenant selects an outstanding invoice or utility top-up, provides amount, bank reference and optionally proof. Record it as submitted, not paid. Admin matches the bank statement and approves/rejects with an audit trail. Approval must be idempotent and cannot credit a utility balance twice. Handle refunds and corrections as new ledger entries, not edits to history. TNG merchant acceptance is unconfirmed.

## Next: prepaid utilities and Tuya

User confirms an existing Tuya (涂鸦) IoT platform project with eight smart meters connected to eight air-conditioners. All eight devices need explicit room mapping, including the two non-rental rooms; the public six-room inventory must not be assumed to cover every device. Need project/API authorization, region, device identifiers and documented supported switch commands. Secrets belong in server-only environment configuration. No device action is currently implemented. Keep a ledger of verified top-ups and measured consumption. An admin-only, explicit air-conditioner off command must report device acknowledgement or failure and keep an audit log. No automatic shutoff rule has been requested. Reconcile meter readings and balances before enabling any balance-triggered control.

## Verification

Production build and lint must pass. Test anonymous bookings, private lead access, staff-only scheduling, concurrent slot claims, past/closed slots, rate limits, and preservation of staff roles on profile sync. Migration is in supabase/migrations; schema has RLS and no anonymous table access. Public booking is mediated by server actions and a service-role-only database function.
