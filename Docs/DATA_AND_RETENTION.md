# Data Model and Retention Policy

## Data-minimization decision

Supabase stores only authentication/profile information needed to sign in and authorize roles, compact One Tap workflow reports/events, render command state, notification records, and the minimum device subscription needed for opted-in Web Push. It stores no raw media, project files, video content, cloud copies, or duplicate One Tap rule logic.

Use opaque stable item IDs. Keep local absolute paths on the workstation; transmit only required status evidence summaries. Do not store passwords or Supabase session secrets in application tables.

## Recommended automatic retention

| Record | Retention rule |
|---|---|
| Supabase Auth account and profile/role | Keep while account is active; no automatic cleanup. Remove only through the controlled account-removal process. Never include in report cleanup. |
| Current active workflow item | Keep while unfinished, assigned, correction-needed, or otherwise unresolved. |
| Completed workflow details/events | Delete 90 days after Done. Preserve active/current state until Done. |
| Notification records | Delete 30 days after creation, whether read or unread. |
| Completed/cancelled render command details | Delete 7 days after terminal state. Never delete queued/claimed/running commands by retention. |
| Push subscription | Delete on user opt-out/logout, invalid endpoint, or account removal. |
| Login credentials/tokens | Managed by Supabase Auth; application does not copy passwords or tokens into report tables. |

These are initial defaults and may be changed by Admin before launch. Cleanup runs daily, is idempotent, records a minimal cleanup outcome, and never deletes login/account records or active work. If a report is unresolved, its retention clock does not start until resolved/Done. Avoid keeping login event history indefinitely; if login audit is later required, define a separate security retention period.

## Quota guidance

Current published Supabase Free plan figures checked 5 Nov 2026: two active free projects; 500 MB database per project; 1 GB Storage; 5 GB egress; 50,000 monthly active users; 500,000 Edge Function calls; 2 million Realtime messages; Realtime up to 200 concurrent connections. Realtime message usage is affected by subscribers receiving each change. Avoid storing files, broadcasting to every client, and high-frequency polling. Re-check official pricing before launch because limits can change.

Supabase may pause a Free project after a week of low activity. A pause can interrupt sign-in, bridge commands, and notifications until restored. Free is a cost target, not an uptime promise.
