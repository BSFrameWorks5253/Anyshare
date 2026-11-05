# Security and Operations Requirements

## Authentication and roles

- Reuse the existing Anything Supabase Auth project; require valid session for all pages except sign-in.
- Resolve role from trusted Supabase profile data/authorization, not local storage, URL parameters, environment variables supplied by the client, ecosystem session JSON, or a hidden button.
- Map `admin` to Admin and `member`/`pro` to User for this app.
- Review the existing `public.profiles` self-update RLS policy before launch. Users must not be able to update their own `role`, user ID, or authorization claims. Restrict profile updates to safe columns and use a trusted admin-only server operation for role changes.
- First Admin is provisioned securely by existing Anything admin setup or a trusted migration. Never accept a client-submitted `role=admin` during signup.

## Bridge and render commands

- Bridge enrolls to a specific Supabase project and workstation. Store only a hashed device credential where feasible; keep raw secrets in OS secure storage and rotate/revoke enrollment.
- Bridge makes outbound TLS requests; do not publish a LAN HTTP server or Supabase service-role key in the desktop app.
- Commands carry a unique ID/idempotency key, item ID, requesting user, creation/expiry time, and state. Claim and state transitions are atomic; only one bridge can claim a command.
- Verify auth, role, item assignment, command freshness, existing render state, and preflight before start. Reject duplicate, expired, revoked, or unsupported requests.
- Do not accept arbitrary filesystem paths, shell commands, or executable names from the website. Resolve all paths locally from One Tap's existing trusted item/configuration mapping.
- Never bypass a confirmation or prompt required by existing One Tap/render software.

## Reports and notifications

- Validate payload shape, size, schema version, item identity, and allowed status values server-side.
- Escape evidence in the website; treat local file/folder names as untrusted text.
- Send minimum push payload (notification type and opaque item ID). Do not include personal data, full paths, or media names unnecessarily.
- Push is opt-in; respect device revocation and permission denial. Keep an in-app notification fallback.
- Restrict notification reads to recipient. Restrict workflow detail reads to assigned user/Admin. Keep Admin corrections in an append-only event history.

## Privacy, retention, and operations

- Store no raw media or passwords. Auth handles credentials; workflow tables hold compact metadata.
- Cleanup follows [Data and Retention](DATA_AND_RETENTION.md); account/profile records and unresolved/current work are excluded.
- Alert Admin if bridge heartbeat or scan is stale. Do not continue remote render execution after a Supabase outage without a valid claimed command.
- Provide an admin way to disable/revoke a bridge and remove push registration.
- Before launch, review Supabase RLS with separate User and Admin accounts and verify that direct REST calls cannot bypass UI restrictions.

## Failure behavior

If Supabase, network, bridge, local drive, or render software is unavailable, preserve the last known state with a stale label, show the exact failure, and do not claim start/completion. On reconnect, reconcile using command IDs and latest One Tap report without replaying a completed render.
