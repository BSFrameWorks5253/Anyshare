# Website Design Specification — Liquid Glass

## Visual direction

Use a restrained Liquid Glass interface: layered translucent surfaces, softly blurred backgrounds, fine reflective borders, and clear depth. The interface should feel polished and calm rather than decorative. Keep the production statuses and action buttons highly legible; glass effects must never reduce contrast.

## Layout

- **Desktop:** slim glass navigation rail, top bar with account/role and notifications, main dashboard with status summary and production list.
- **Mobile:** compact top bar, horizontally scrollable stage filters or segmented controls, stacked work cards, fixed bottom navigation for Overview, My Work, Notifications, Account.
- Item detail and correction review use full-screen mobile sheets; desktop uses a side panel or modal.

## Components

- `GlassShell`: page background, translucent shell, blur and border.
- `GlassNav`: desktop side navigation / mobile bottom navigation.
- `StatusPill`: one color and icon per workflow state; always includes text, never color alone.
- `WorkCard`: item/session, assigned user, stage, last verified time, source badge (One Tap/Admin), primary action.
- `StageSummary`: tappable counts; filters the list.
- `EvidencePanel`: exact rule result, source, evidence summary, scan time, and missing/conflicting checks.
- `CorrectionReview`: Confirm, Correct, or Request Scan; correction requires a reason.
- `RenderAction`: Start Render request, disabled with an explanation when checks fail or bridge is offline.
- `BridgeHealth`: Online/Offline/Last Seen; no fake “live” state.
- `NotificationCenter`: inbox, read state, delivery state, preferences.
- `ConfirmDialog`: explicit confirmation for start/correction/done actions.

## Tokens and effects

- Background: deep ink/navy or warm neutral base with low-intensity ambient color fields.
- Glass surfaces: translucent white/black tint, 1px low-contrast border, subtle inner highlight, restrained shadow, `backdrop-filter: blur(16–24px) saturate(140%)`.
- Fallback: opaque surface with the same border and hierarchy when blur is unsupported or reduced transparency is enabled.
- Accent: one primary blue/violet accent; semantic green = passed/completed, amber = waiting/review, red = failed; status text/icon stays readable in light and dark themes.
- Motion: short opacity/position transitions only; respect `prefers-reduced-motion`; never animate a progress bar as if real progress were known.

## Accessibility and interaction

- Minimum WCAG AA contrast for all text and controls, visible keyboard focus, semantic headings, labels, and buttons.
- Never use blur, color, or icons as the only source of meaning.
- Every disabled render button explains the blocking condition.
- Confirmation dialogs name the exact item and action. Destructive-looking admin corrections require a reason but are not hidden behind vague wording.
- Screen-reader announcements for new status/notification events; do not steal focus.
- Loading, no data, offline bridge, Supabase unavailable, permission denied, and stale scan states each need a designed view.

## Main pages

1. Sign in / session restore.
2. Overview dashboard.
3. My Work / All Work list.
4. Work item detail and timeline.
5. Admin correction review.
6. Render request / preflight / progress.
7. Notifications and preferences.
8. Account and bridge status.
