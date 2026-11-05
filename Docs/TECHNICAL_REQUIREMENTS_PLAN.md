# TRP — Technical Requirements and Implementation Plan

## 1. Technical requirements

- Responsive installable web app with Liquid Glass UI and accessible fallback surfaces.
- Existing Anything Supabase Auth; User/Admin authorization enforced by RLS and Edge Functions.
- New `anything_share` tables for current work, event history, render commands, notification inbox, push registrations, and bridge enrollment metadata.
- One Tap bridge connector that invokes existing scan/preflight/render/status/completion logic and posts compact reports.
- Reliable command lifecycle: idempotency, expiry, atomic claim, progress, output verification, failure/correction state.
- In-app notification feed; optional Web Push from Supabase after verified events.
- Scheduled retention with observable cleanup and protected login/account and unresolved-work records.
- No production media uploads, no copied render rules, no service-role credentials in client code.

## 2. Work packages

### A. Verify existing One Tap integration points

Map existing scanner states and stable item identifiers; identify exact preflight and render-start API; verify when human confirmation is required; identify final-output verification and progress events. Resolve Edit 1/Edit 2/“Given to Jamey” signals with a maintainer; do not guess from names/timestamps.

### B. Supabase foundation

Review current schema/RLS, especially role self-update. Add app tables and constraints without duplicating `public.profiles`. Add RLS, RPC/Edge Functions for corrections, command creation/claim, state changes, notification creation, and mark-read. Add retention schedule and usage dashboard.

### C. Bridge connector

Enroll one One Tap workstation, heartbeat, scan/report, command claim, preflight result mapping, render start through existing code, progress reporting, verified completion, duplicate protection, offline recovery, revoke/uninstall path.

### D. Website and design system

Build sign-in, stage dashboard, work list/detail, evidence and correction review, render request/progress, inbox/preferences, bridge health. Apply Liquid Glass components with mobile/keyboard/accessibility states and PWA setup.

### E. Push and retention

Implement web push registration/opt-in, server-side delivery, invalid subscription cleanup, notification fallback, daily retention job, and visible cleanup status. For iOS web push, document Add to Home Screen requirement.

### F. Release readiness

Test with separate User/Admin accounts, bridge offline/online, supported/missing/conflicting evidence, duplicate/expired command, render failure/success, push denied, RLS direct access, and retention boundary cases. These are required implementation checks; no claims of verification until run.

## 3. Acceptance gates

1. No status is changed without a recognized One Tap rule or explicit authorized Admin action.
2. Missing/conflicting/unknown evidence always blocks render and prompts Admin with the evidence and question.
3. Only an explicit authorized Start Render request plus passing One Tap preflight calls the existing render entry point.
4. One Tap must be online; otherwise the site says waiting/offline and starts nothing.
5. Exactly one render starts per request ID.
6. Rendered/Done states require existing output/completion checks; Done follows the existing completion rule or a reasoned Admin exception.
7. Completion notification is created only after verified success; failed delivery remains visible in-app.
8. Supabase stores no media and cleanup never deletes account/login identity or active/unresolved work.
9. User cannot elevate role or read another user's assignment/notifications through direct API access.
10. Usage stays within free quota for expected team volume; free-tier caveats and pause behavior are visible to owner.

## 4. Decisions needed before implementation

- Exact One Tap marker/rule for Edit 1, Edit 2, and Given to Jamey.
- Which users may request render on assigned work; recommended: assigned User may request, Admin may request any item.
- Whether the existing render path can start unattended or requires local confirmation. Keep existing confirmation if required.
- Retention defaults in this spec: 30-day notifications, 90-day completed workflow details, 7-day terminal command details.
- Web Push only for the initial mobile website; native FCM/APNs only if a native app is later chosen.
