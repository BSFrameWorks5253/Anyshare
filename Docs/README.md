# Anything Share — Product Specification

**Status:** Planning specification  
**Date:** 5 November 2026  
**Product:** Mobile-friendly website and One Tap workflow bridge  
**Backend:** Existing Anything Supabase project

Anything Share is a lightweight production status and render-command interface for the Anything ecosystem. Users can see assigned work, request a render from a phone, and receive completion notices. Admins can review status evidence, correct errors, and manage work. One Tap remains the source of truth for local folder rules, validation, and rendering. Supabase stores only account/profile information, compact workflow reports, render commands, and notification/delivery records. Media files and copies of the One Tap rule engine are not uploaded.

## Specification files

- [Product requirements (PRD)](PRD.md)
- [Detailed feature specifications](FEATURES.md)
- [Liquid Glass design specification](DESIGN.md)
- [Architecture and bridge description](ARCHITECTURE.md)
- [Workflow and detection rules](WORKFLOW.md)
- [Website and role flows](APP_FLOW.md)
- [Data model and retention](DATA_AND_RETENTION.md)
- [Security requirements](SECURITY.md)
- [Supabase schema draft](DATABASE_SCHEMA.sql)
- [Technical requirements and implementation plan (TRP)](TECHNICAL_REQUIREMENTS_PLAN.md)

## Key decisions recorded

1. The website uses **User** and **Admin** roles. Existing Anything roles map as `admin → Admin` and `member/pro → User`; this app does not expose a third role.
2. Existing One Tap code and its local rules perform folder scans, preflight checks, and rendering. The bridge reports results to Supabase; it does not reimplement the rules.
3. Detection must be evidence-based. A supported rule may report a deterministic finding with its evidence. Missing, conflicting, or unsupported evidence becomes **Correction needed** and asks an admin to confirm or correct it. The system never guesses or silently edits a status.
4. The website only sends a render request. One Tap starts the job locally after its checks pass. The PC, One Tap bridge, and required local render tools must be available.
5. A mobile notification is delivered after One Tap reports completion and the expected output is verified. Supabase holds the record; background phone delivery requires Web Push for the installable website (or a push transport if a native app is chosen).
6. Only small metadata and reports go to Supabase. Retention deletes old notifications and completed workflow details while keeping login/account records.
7. Hosted free tiers have quotas and can change. “Free forever” is not a provider guarantee.

## Scope note

This folder was empty when the specification was prepared. These files describe what to add; they do not claim the website or remote render bridge already exists. The current Anything and One Tap projects contain the referenced authentication, desktop notification, task tracking, folder scanning, and render-completion logic.
