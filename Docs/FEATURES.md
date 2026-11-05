# Detailed Feature Specifications

## 1. Role-based access

**User:** sees assigned items, status, evidence summaries, own notification preferences, and can request render on assigned items that pass eligibility checks.  
**Admin:** sees all items, assigns users, reviews/corrects findings, marks work done, and manages render requests.  
Every action is checked by database policies or a trusted Edge Function. Existing ecosystem `admin` maps to Admin; `member` and `pro` map to User.

## 2. Production dashboard

Show compact counts for Pending Edit 1, Edit 1, Pending Edit 2, Edit 2, Ready to Render, Rendering, Rendered, Pending Upload, Uploaded, Given to Jamey, Correction Needed, and Done. Counts derive from current item records, not hand-entered totals. Filters: assigned person, stage, date/session, and search text. Show the last One Tap scan and bridge connection state.

## 3. Work item and activity history

Each item is keyed by a stable One Tap identity (for example, safar/session plus date folder), not an absolute local path. Detail shows current stage, assignment, last checked time, concise evidence, active command if any, and chronological status/confirmation/correction events. Preserve `detected`, `confirmed`, and `corrected` as distinct actions.

## 4. Evidence-based status report

One Tap sends the rule result, rule/source identifier, relevant safe evidence summary (matched folder/file names or counts), scan time, and machine/bridge status. Website labels the result **Detected by One Tap**. It must not invent missing facts or silently convert a warning into a valid state. If the signal is unknown, stale, or inconsistent, set **Correction needed**, state exactly what is missing/conflicting, and request Admin review.

Confirmation prompt example: “One Tap found a rendered output folder for this session at the last scan. Does this match the work?” Actions: **Confirm**, **Correct status**, **Open in One Tap**. Confirmation records actor/time; correction requires a reason and preserves the prior finding in history.

## 5. Render request from mobile

The button creates a uniquely identified request in Supabase; it does not render in the browser. The local One Tap bridge claims the request once, runs existing local preflight, and reports each result. Only a fully passing preflight plus the user's explicit Start Render request allows start. If an Admin must resolve a correction, the request waits until that review. Expired, duplicate, unauthorized, offline, or already-rendering requests are rejected or held with a clear reason.

Preflight checks must call existing One Tap validators. The UI shows each returned check as Pass, Needs Admin, or Failed, with evidence. The bridge must not substitute guessed checks.

## 6. Progress, result, and completion notification

Show queued, claimed, validating, correction-needed, rendering, verifying-output, completed, or failed. One Tap is authoritative for render state. On completion it verifies the output using existing code and sends a compact report. Then Supabase updates the item, adds a notification, and attempts an opt-in Web Push. If push fails, the notification remains in the inbox and delivery state says so. Do not report `Rendered` merely because a start command was accepted.

## 7. Admin correction and done action

Admin sees the detected value, evidence, expected rule, and reason it needs correction. Admin may accept the finding, select a valid status, or request a fresh scan. A correction must have a reason; retain the original and corrected values in the audit event. `Done` is allowed only when the existing One Tap completion rule says all required date folders are uploaded/submitted, or Admin explicitly resolves a documented exception. Exception reason and actor are mandatory.

## 8. Notifications

In-app inbox for assignment, correction-needed, render start/failure/completion, and admin confirmation/correction. User can opt in/out of phone push and choose event categories. Push payload contains a short generic message and item ID/deep link, not private media details or local drive paths. Log queued/sent/failed/expired state and prune per retention policy.

## 9. Retention and minimal storage

Keep login/account identity records. Automatically delete notification records after 30 days and detailed workflow/event reports 90 days after an item becomes Done. Keep active items, pending commands, and unresolved correction requests. Remove completed/cancelled command payloads after 7 days. On logout or invalid subscription, remove that device's push registration. Exact cleanup must be scheduled and observable; no rule may delete login/account rows.

## 10. Bridge health and recovery

Display last heartbeat, last scan, app version, and whether the bridge can reach Supabase. If offline, label requests Waiting for One Tap; do not imply they are running. On reconnect, process only non-expired, still-authorized commands and use idempotency keys to prevent duplicate renders.
