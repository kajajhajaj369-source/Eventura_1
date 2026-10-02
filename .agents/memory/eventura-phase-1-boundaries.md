---
name: EVENTURA Phase 1 boundaries
description: Role assignment and feature-scope constraints for EVENTURA's first phase.
---

EVENTURA has exactly five roles: College Admin, Club, Organizer, Student, and Volunteer. New self-signups receive Student. Elevated roles are assigned through server-controlled data, never a client role picker.

Phase 1 includes the extensible schema and role-specific dashboard/navigation shells. Keep event creation and approval, registration, QR attendance, volunteer task execution, finance calculations, feedback, certificates, and advanced analytics as placeholders until the user explicitly starts that phase.

Development seed profiles are fixtures, not Clerk authentication identities or usable demo accounts.

**Why:** These are explicit security and scope constraints in the product brief.

**How to apply:** Preserve the five-role allowlist and server-owned role values when changing auth, schema, dashboards, or navigation. Do not expose demo credentials or activate Phase 2 workflows in the starter dashboards.