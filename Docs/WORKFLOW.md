# Workflow and Detection Rules

## Workflow stages

`Pending Edit 1 → Edit 1 → Pending Edit 2 → Edit 2 → Ready to Render → Render Requested → Checking → Rendering → Rendered → Pending Upload → Uploaded → Given to Jamey → Done`

Exception state: `Correction Needed`. Terminal/non-success state: `Failed` or `Cancelled`. Preserve One Tap's existing internal state names where possible; map them to website labels in one connector mapping, not by reimplementing detection.

## Existing evidence and known gap

One Tap's documented lifecycle detects pending/editing/review/rendered-pending/uploaded/submitted from configured folder roots, `.prproj` existence/mtime, and matching folder presence. It marks a Safar done when every required date folder is uploaded or submitted. The exact Edit 1/Edit 2 distinction and “Given to Jamey” are not represented in the shared lifecycle description and require explicit machine-readable markers or Admin actions. Do not infer them from arbitrary filenames or age.

The existing 48-hour `.prproj` age threshold is a review signal, not proof an edit is complete. Report the underlying timestamp and rule; ask an Admin to confirm the phase when this is the only evidence.

## Evidence protocol

Every report includes: stable item/session key; One Tap rule/source ID and version; detected state (or unknown); scan time; relevant safe evidence summary; explicit list of passed, failed, missing, and conflicting checks; bridge ID/status. Do not transmit full media, credentials, or unnecessary absolute paths.

### Rule outcomes

- **Known and unambiguous:** show `Detected by One Tap`, evidence, and time. Update only fields that an existing deterministic rule owns.
- **Known but needs human confirmation:** set `Correction Needed`, explain which rule/evidence triggered the question, and offer Confirm/Correct/Rescan.
- **Missing or conflicting:** set `Correction Needed`; do not select the most likely state.
- **Unsupported:** preserve previous confirmed state, show that the latest scan could not determine status, and request Admin review.
- **Stale/offline:** keep last confirmed state visibly marked stale; never claim it is current.

## Render start rules

- Render request is created only by an authenticated User/Admin allowed for that item, with request ID and expiry.
- The user action explicitly asks to start rendering; a notification itself is not treated as consent or authority.
- Bridge must be online and claim a valid command exactly once.
- Run One Tap's existing preflight. Each check must return an explicit result. Any fail/unknown/conflict blocks start and reports the exact reason.
- No fallback guessing, forced start, or repeated command on retry. Admin may correct source data or cancel; a documented exception may be explicitly approved by Admin and recorded.
- Start only by calling the existing One Tap render path. If that path requires a visible confirmation or an external editor/encoder, preserve that requirement; do not simulate a click or bypass the application.
- `Rendered` requires One Tap's completion signal plus existing output verification. Start accepted or process launched is not completion.
- On verified success, report result, update status, create notification, and then deliver opt-in push.

## Completion and Done

Rendered and Pending Upload are separate. Uploaded and Given to Jamey are separate. `Done` follows the existing all-date-folders uploaded/submitted rule; Admin exception requires reason and audit record. A work item may not be auto-closed while any required date remains incomplete or ambiguous.
