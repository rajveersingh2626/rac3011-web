# Decisions (rac3011-web)

Recorded where the spec left a choice open. Each entry: date, decision, reason.

- 2026-09-04: `react-leaflet@4` instead of latest (5). v5 requires React 19; spec pins React 18 (Vite 5 react-ts template).
- 2026-09-04: `vitest@3` instead of latest (5). Vitest 5 requires Vite 6+; spec pins Vite 5.
- 2026-09-04: Subdomain accents taken from the Subdomains mockups (spec §9.1 said to replace its placeholder hexes): drishti `#123499`, rcl `#0F7B6C`, careerbridge `#6B3FA0`, ride `#B8541A`; mission3011 keeps pink. Soft tints from the same screens (`#EEF1FA`, `#E9F5F2`, `#F3EEF9`, `#FDF1E7`).
- 2026-09-04: Added `--border-accent`, `--track`, `--danger`, `--input-bg`, shadow variables beyond §9.1 because the Design System mockup uses them (hairline `rgba(216,27,96,0.15)`, gauge track, destructive maroon `#8A1027`, input fill). Spec values are unchanged.
- 2026-09-04: Destructive Button variant uses the mockup's maroon `#8A1027` (dark `#7A1024`), not a generic red.
- 2026-09-04: `resolveSurface` treats unknown hostnames as `main`; `?surface=` query is honoured only on `localhost`/`127.0.0.1` hosts (never in production hostnames).
- 2026-09-04: `can()` with a `zone` scope grant and a club not present in `/me.clubs` returns `false` (hidden), because the zoneId cannot be resolved client-side. Server enforces the real check.
- 2026-09-04: `can()` with `project` scope only matches when the requested scope is `{ type: 'project', id }` with the same id; `none` grants match everything.
- 2026-09-04: Second-factor step defaults to `email` method (mockup: "email OTP as the primary second factor"); `totp` is an opt-in toggle. Resend countdown is 30s.
- 2026-09-04: `ThemeProvider` reads `profile.themePreference` when present, else `localStorage['rac3011.theme']`, else `prefers-color-scheme`. `PATCH /me` persistence on toggle is called only when `me` is present.
- 2026-09-04: Sidebar groups Overview/Reporting/Club/Me are shown to every authenticated user except items that name a permission (Reporting requires `reports:submit`; Club → Events requires `club_events:log`, Showcase requires `showcase:submit`). Admin items each require exactly one permission key.
- 2026-09-04: `TagInput` at `maxTags` keeps its text input enabled (adds are refused in `add()`) rather than disabling it, so Backspace can still remove a tag. Disabling it trapped keyboard users at the cap.
