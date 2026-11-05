# Product Requirements Document

## 1. Purpose

Provide a simple website where the production team can see One Tap work status, request eligible renders from mobile, review problems with evidence, and receive a completion notification. Avoid moving media files or the existing rule engine into the cloud.

## 2. Users and roles

### User

- Sign in using the existing Anything Supabase authentication.
- View assigned work and its current verified stage.
- Request a render for an assigned eligible item.
- See preflight progress, correction requests, render progress, and completion.
- Receive and manage their own notifications.

### Admin

- Everything a User can do.
- View and assign all work, inspect detection evidence, confirm/correct workflow reports, and mark eligible work done.
- Create/cancel render requests and resolve correction-required items.
- Review activity and basic operational health (bridge online, last scan, last successful report).

Authorization is enforced in Supabase; hiding buttons in the website is not security. Map existing Anything roles to these two app roles. Do not let a user grant themselves Admin.

## 3. Core user problem

The team currently works in local folders and One Tap. Status visibility is scattered across folders and the desktop app; a phone cannot safely initiate local rendering or show completion remotely. The product provides one compact status view and a controlled command bridge.

## 4. Product outcomes

- At a glance, users can tell what is pending, in Edit 1, pending Edit 2, in Edit 2, rendered, pending upload, uploaded, given to Jamey, or done.
- Admins can tell why a status was detected and when One Tap last checked it.
- No render begins from an unverified or conflicting state.
- Render completion is confirmed by One Tap output checks and reported to the website and user.
- Supabase holds no video, photo, project, or other production media.

## 5. Functional requirements

1. Authenticate through the existing Anything Supabase project.
2. Present only User and Admin roles in this product.
3. Display a stage summary, assigned-work list, item detail, activity history, notification inbox, and bridge health.
4. Receive status reports from a One Tap connector using stable item identifiers and compact evidence summaries.
5. Preserve provenance: automatic detection, admin confirmation, and admin correction are distinct sources.
6. Ask an admin to confirm/correct any ambiguous, missing, contradictory, or unsupported finding. Never infer a missing stage.
7. Allow a signed-in authorized user to request a render. One Tap validates locally before starting it; duplicate and stale commands must not start duplicate work.
8. Report progress and final result to Supabase. Mark rendered only after One Tap confirms the expected output exists and passes the existing checks.
9. Notify the requesting user after verified completion, and show an in-app notification record.
10. Apply automatic retention to notification and completed-work details while preserving login/account records.
11. Make the web interface responsive and installable as a PWA. Phone push is opt-in and permission-based.

## 6. Non-functional requirements

- Use existing One Tap rules, not a second implementation.
- Minimize data collection; store metadata, not media.
- RLS and server-side authorization protect every table and command.
- Bridge communicates outward to Supabase; do not expose a local control server to the public internet.
- Be understandable on a phone, keyboard accessible, and usable with reduced motion.
- Display last successful sync and offline/paused states honestly.
- Free-tier operation is the target. Enforce usage-aware design and explain provider limits; do not promise perpetual free hosting.

## 7. Out of scope

- Cloud rendering or uploading production media to Supabase Storage.
- Replacing One Tap's folder scanning, render rules, or local databases.
- A third paid/pro role, payments, public sharing links, or a chat system.
- Automatically changing a status when evidence is uncertain.
- Keeping unlimited notification or workflow history.

## 8. Success criteria

- User can request an eligible render from mobile and see the request acknowledged.
- With One Tap offline, request remains visibly waiting or fails safely; no claim of rendering is shown.
- A missing/conflicting preflight check produces a correction request with exact evidence and no render start.
- A valid request runs once; One Tap reports progress and verified completion.
- Admin correction records who changed what, when, and why.
- Notification arrives after verified completion, with an in-app fallback if push is unavailable.
- Retention removes expired eligible records and never removes active work or account records.
