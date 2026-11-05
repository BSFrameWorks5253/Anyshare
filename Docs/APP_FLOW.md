# Application Flow

## User flow

1. Open the installable website and sign in with Anything Supabase Auth.
2. See My Work, counts by stage, last scan time, and bridge availability.
3. Open an item to inspect its stage, One Tap evidence, and activity timeline.
4. If eligible, tap **Start Render** and confirm the exact item. If offline, show that the request cannot currently reach One Tap.
5. See queued → checking → rendering → verifying output. If a check is uncertain or fails, show Correction Needed and stop.
6. Receive an in-app alert and, when opted in/supported, a phone push after verified completion.

## Admin flow

1. Sign in; Admin-only pages appear only when Supabase confirms role.
2. View all work, assignments, stuck items, corrections, render queue, and bridge health.
3. Open a correction. Read the rule finding, evidence, missing/conflicting checks, and last scan.
4. Confirm, correct with a reason, or request a fresh One Tap scan. Each action creates an audit event.
5. Assign work or mark Done only when the completion rule passes; exceptions require a reason.

## Page structure

- **Overview:** stage counts, assigned summary, recent activity, online/last scan status.
- **Work:** filterable list/board with stage, owner, freshness, and source.
- **Work detail:** evidence, checks, history, render action/progress.
- **Corrections:** admin review queue with evidence and safe choices.
- **Notifications:** inbox, read state, delivery state, preferences.
- **Admin settings:** role mapping, retention status, bridge enrollment/health.

## Important states

Design explicit views for first run/no work, loading, offline phone, offline bridge, stale scan, correction needed, render queued, duplicate request blocked, push denied/unavailable, auth expired, permission denied, Supabase unavailable, render failed, and completed. Always say whether a command is queued, running, or complete; never present a pending request as a started render.
