# Collab: Product & Build Plan

_Last updated: 9 November 2026_

## 1. What Collab is

Collab is a collaboration app for schools, workplaces and team projects. Users create projects, invite teammates and work together in real time, using built-in tools (Word, Excel, PowerPoint, UML diagrams, graphs and more) instead of switching between apps.

Teams set deadlines, assign tasks, schedule meetings, and talk through built-in chat and voice channels. Every built-in tool covers the essentials users expect (for example font styles and sizes in Word).

### What makes it different

| Pillar | The problem | Collab's answer |
|---|---|---|
| **Project Health** | Group projects run on trust. You can't tell whether a groupmate actually did the work, or did it properly. | Checks run automatically and surface problems, e.g. an incomplete task past its due date, a section under its 300-word minimum, or a section that doesn't match its requirement. Nobody has to check by hand. |
| **Sectioned Word documents** | A 30-page proposal is impossible to manage as one long page. | The document is split into **sections that are also tasks**. Each section has an owner, a due date, dependencies (do before/after another section), and an optional rubric or requirement that AI can check the section against. |
| **NLP AI control** | Setting up a project and its structure is tedious. | Describe it in plain language ("Create a project for ICT374 due 19 Dec with sections Intro, Research, SWOT…") and the AI builds it. |

### Free vs Premium

| | Free | Premium |
|---|---|---|
| Projects | Up to **2** | Unlimited |
| AI tools (rubric checks, AI health checks, NLP commands, automation) | No | Yes |

### Platforms
1. **Web**: Chrome, Safari, Firefox (launch first)
2. **Mobile**: iOS and Android (later)

---

## 2. Core features (from product brief)

- **Projects**: create and manage projects for school, work or personal use. Organize work into **subprojects**.
- **Team access**: invite users and manage roles and access.
- **Chat**: a chatroom is created automatically for every project. Real-time group chat.
- **Voice**: voice channels for quick decisions.
- **Deadlines**: with notifications and reminders.
- **Notes**: add and share project notes.
- **Tasks**: create, assign and track tasks.
- **Meetings**: schedule group meetings inside the project.
- **Team monitoring**: time-usage analytics per user, edit and change tracking, deadline and update notifications, upcoming deadlines and meetings.
- **Tools**: Word, Excel, PowerPoint, UML diagrams, graphs, and more later.

---

## 3. Where the code is today

The UI shell is in place. Almost all data is **hardcoded sample data**, and only a few actions call the backend (`NEXT_PUBLIC_API_URL`).

| Screen | Route | State |
|---|---|---|
| Home | `/` | "Coming soon" placeholder |
| Login | `/login` | UI done. The Google button calls `checkEmail`. Continue just links to the dashboard. No real auth. |
| Dashboard shell | `app/dashboard/layout.tsx` | Sidebar (main + project-expanded variant), header with tabs, floating messenger. All mock data. |
| Dashboard home | `/dashboard` | **Empty** |
| Activities / Inbox / Notes | `/dashboard/{activities,chat,notes}` | Stub pages |
| Schedule | `/dashboard/schedule` | Month grid, today highlighted. No navigation, no events. |
| Project page | `/dashboard/project/[id]` | Banner + tabs (tabs don't navigate) + hardcoded overview + details/activity cards |
| Project overview | `/dashboard/project/[id]/overview` | Draft layout with placeholder rows (Health, Progress, Activities…) |
| Project sub-pages | `assignments`, `team-members`, `schedules`, `notes` | Stub pages |
| Document editor | `/dashboard/project/[id]/files/[fileid]` | Sections list, toolbar, A4 page, right panel. Only Bold/Italic/Underline and .docx export work. |
| Create Project dialog | global overlay | Image upload/crop, name, visibility, due date. Submit calls `createProject`. |

The editor already has a document model (`Document → Section → Paragraph → Text` with `Style`) and a Sections panel with lock icons. Both are good starting points for the sectioned-Word feature.

---

## 4. Fix first (bugs found in current code)

These are small, safe fixes that should happen before building features.

### Breaking / incorrect
- [x] `InitProjectDialog.tsx` imports `@/lib/api/types/ProjectModel`, but the file is `lib/api/types.ts`. The typecheck fails.
- [x] Create Project always sends `visibility: "Public"`, whatever the user picks. It also sends a placeholder `imageUrl: "/////"` and `description: "Test"`.
- [x] The cropped image is never produced: `croppedAreaPixels` is computed but not used, and the ✓ button in `CropHelper` does nothing.
- [x] `lib/api/Project.ts` used Node's `Buffer` (now `btoa`).
- [ ] `lib/api/Project.ts` still sends dev-only Basic-auth credentials (`User` / `1234`) from the browser. Replace with real auth in Phase 1.
- [x] `Fieldset.tsx` type mismatches (dropdown `onChange` typing, optional `setDate`).
- [x] Header tabs: `handleCreateTabs` is never called, so opening a project never adds a tab. The `+` tab button does nothing.
- [x] Header back/forward arrows do nothing. Wire them to `router.back()` / `router.forward()`.
- [x] Sidebar "Notes" under project Components links to `/activities` (no such route). It should go to `/notes`.
- [x] The project page `[id]/page.tsx` has an untyped `params`. In Next 16 it should be `params: Promise<{ id: string }>`.
- [x] Links to missing routes: `/terms-and-conditions`, `/privacy-policy`, `/dashboard/settings`, `/dashboard/help-center`, `/dashboard/plans`.
- [x] 15 TypeScript errors in total (mostly unused imports). Fixed; typecheck, lint and build are clean.
- [ ] Consider adding `npm run typecheck` to the pre-commit hook. Today only ESLint runs.

### Visual polish (no redesign, just making it look right)
- [x] The dialog overlay uses `absolute`. It should be `fixed` so it covers the screen even when the page scrolls.
- [x] The header user avatar isn't rounded (other avatars are).
- [x] `text-text)` typos (stray bracket) in `Header.tsx` and `NavigationTab.tsx`, so Tailwind ignores those classes.
- [x] The project page body height is hardcoded to `calc(802px - 148px)`. Use flex/`min-h-0` so it fits any screen.
- [x] The light-mode active nav item uses `bg-neutral-700` with black text (unreadable). Only matters if light mode ships.
- [x] Placeholder content to clean before any demo: shipping text in `RibbonAccordion.tsx`, crude test chat messages, and the long hardcoded ICT374 overview.

---

## 5. Gaps & improvement ideas

Things the brief needs that the current code doesn't cover yet, plus improvements I'd suggest.

### 5.1 Structure & navigation
- **Unify the project page and sub-routes.** There are two parallel structures today: tabs on `/project/[id]` (local state only) and sidebar links to `/project/[id]/overview` etc. Suggestion: add `app/dashboard/project/[id]/layout.tsx` holding the banner, and make the tabs real links to the sub-routes. One source of truth, and URLs you can share.
- **Dashboard home is empty.** It's the first screen after login and should answer "what do I need to do today?": my tasks due soon, upcoming deadlines and meetings, project cards with health status, recent activity.
- **Project-scoped chat.** The brief says each project automatically gets a chatroom. The messenger should list one room per project (plus DMs), and the project page should link to its room.
- **Subprojects** don't exist anywhere in the UI or model yet.

### 5.2 Free / Premium in the UI
- The sidebar "Basic Tier FREE" pill could show usage, e.g. **"1 of 2 projects"**, with an Upgrade link.
- When a free user tries to create a 3rd project, show an upgrade prompt instead of the form.
- Mark AI features with a small Premium badge, so free users can see them but they're clearly gated.
- Enforce the limit **on the server** too. The UI check is only a convenience.

### 5.3 Sectioned Word documents (key feature)
Each section should carry:
- owner(s), status (not started / in progress / in review / done), due date
- **dependencies**: "starts after X" / "must finish before Y" (validate there are no cycles)
- **requirements**: word count min/max, rubric text, required headings/keywords
- lock state (the UI already shows lock icons). Lock while a dependency is unfinished, or once the section is approved.

UI touches:
- In the Sections panel, show owner avatar, status dot and a health warning icon per section.
- In the right panel ("Section Information"), show assignee, due date, dependencies, requirements and the "Check with AI" button (Premium).
- A live word count against the target ("212 / 300 words").
- Sections are tasks, so they should appear in the project's Assignments/Tasks view automatically.

**Technical recommendation:** the current editor wraps selections in `<span>` by hand on a `contentEditable` div. That won't scale to font sizes, lists, tables, undo/redo, and especially **real-time multi-user editing**. Before investing more in it, move to an editor framework (e.g. **TipTap/ProseMirror** or **Lexical**) paired with a CRDT such as **Yjs** for live collaboration. Both support per-section documents and track who changed what, which also feeds edit tracking and Project Health.

### 5.4 Project Health (key feature)
Two layers:
1. **Rule checks** (free, run instantly, explainable):
   - task or section past due and not done
   - section below or above its word target
   - section unassigned, or blocked by an unfinished dependency
   - no activity from a member for N days
   - deadline approaching with low completion
2. **AI checks** (Premium): does the section meet its rubric or requirement? Is it off-topic? Possible plagiarism or duplication between sections?

UI: a health score or status (Healthy / At risk / Critical) on the project card and overview, plus a list of issues. Each issue has a severity, a plain-language reason and a **"Go to section"** link. Let users dismiss an issue with a note ("agreed with lecturer"), so health stays trustworthy rather than noisy.

### 5.5 Team monitoring & trust
- **Edit tracking**: per-section version history, and "who wrote what" contribution share (from the editor's change history).
- **Time-usage analytics**: active editing time per user per project.
- ⚠️ **Privacy:** in schools many users may be minors. Be transparent: show each user what is tracked about them, keep the data to project-relevant activity, and check the relevant student-data/privacy laws for your launch region.

### 5.6 Deadlines, meetings & notifications
- A central notifications model: in-app (header bell) first, then email, then mobile push.
- Configurable reminders (e.g. 3 days / 1 day / 1 hour before).
- Meetings: create inside the project, show them on the Schedule calendar, one-click join into the project's voice channel, `.ics` export / Google Calendar sync later.
- Schedule page: month navigation, week view, events and deadlines plotted on the grid.

### 5.7 Invites & access
- The dialog says "join an existing project with an invitation link", but there's no UI for joining. Add a **Join with link/code** option.
- Roles: **Owner / Editor / Viewer** (activity already mentions "Editor"), plus optionally "Reviewer" for teachers/supervisors.
- Organization visibility needs an Organization model (school / company) with its members.

### 5.8 NLP AI
- A command bar (e.g. `Ctrl/Cmd + K`) where users type requests: "create project…", "assign Research to Jordan due Friday", "schedule a meeting Thursday 3pm".
- Have the model return **structured actions** (tool calls) that the app shows as a preview, which the user confirms before anything is created. Safer and easier to debug than letting the AI act directly.
- Reuse the same AI layer for rubric checking (5.3) and AI health checks (5.4).

### 5.9 Other built-in tools (later)
Excel, PowerPoint, UML and graphs are each large builds. Strong existing libraries cover spreadsheets, slide editors and diagram canvases, so integrating one is far faster than building from scratch. Ship Word first (it carries Project Health and sections-as-tasks), then add the others one at a time behind the same "file inside a project" model.

### 5.10 UI quality across the app
Keeping the existing look; these make it feel finished:
- **Consistent tokens**: many components use raw hex (`#383838`, `#ffffff70`, `#2e2e2e`) next to theme tokens. Moving them onto the tokens in `globals.css` keeps the look identical and makes light mode or rebranding easy later.
- **Empty, loading and error states** for every list (projects, tasks, chat, notes), plus toast messages for actions like "Project created".
- **Accessibility**: several clickable `div`s and bare icons (close ✕, chat previews, the expanded "+") should be real `<button>`s with labels. The custom dialog should trap focus and close on Esc (shadcn/Radix Dialog does this out of the box).
- **Responsive layout**: fixed widths (sidebar 250/350px, login 600px, messenger 300px, 16-column editor) will break on small laptops and tablets. Worth handling early, since mobile is on the roadmap.
- **One Avatar component** used everywhere (header, activity, chat, banner) instead of repeated `<Image>` blocks.
- Two select components exist (`components/common/Dropdown.tsx` and shadcn `components/ui/select.tsx`). Pick one.

---

## 6. Suggested roadmap (original, superseded by section 10)

| Phase | Goal | Includes |
|---|---|---|
| **0. Cleanup** | A clean, compiling base | Everything in section 4, token cleanup, real Dialog component, Avatar component |
| **1. Accounts & projects** | Real users and real projects | Auth (Google/Apple/email), protected routes, project CRUD, image upload, invites + roles, free 2-project limit, Dashboard home |
| **2. Coordination** | The team can organize | Tasks (create/assign/track), deadlines + reminders, notifications, notes, meetings + Schedule calendar, real-time project chat |
| **3. Sectioned Word** | The flagship tool | Editor framework + real-time collab, sections-as-tasks, dependencies, requirements, word targets, version history |
| **4. Project Health & monitoring** | Trust without checking manually | Rule-based health checks, health UI, edit tracking, contribution/time analytics |
| **5. Premium & AI** | Monetization | Payments/subscriptions, AI rubric check, AI health checks, NLP command bar |
| **6. Voice & more tools** | Full suite | Voice channels, Excel, PowerPoint, UML, graphs |
| **7. Mobile** | iOS & Android | Responsive web first, then native apps |

Voice could move earlier if it matters for launch. It's independent of the other phases.

---

## 7. Progress log

### 9 November 2026: Phase 0 cleanup + TipTap editor
- All fixes in section 4 done, except the pre-commit typecheck and real auth.
- Repeated hardcoded colours moved onto theme tokens (`--muted-text`, `--subtle-text`, `--hover`, `--divider`, `--dialog`, `--overlay`, `--paper`, `--canvas`). Same look.
- Create Project dialog now uses Radix Dialog (Esc, focus trap, fixed overlay). The cropped image and chosen visibility are sent. Loading and error states added.
- Shared `Avatar` and `ComingSoon` components. Missing routes now show a "coming soon" page.
- Header tabs: projects open as tabs, the active tab is highlighted, closing works, and `+` opens Create Project. Back/forward work.
- **Word editor rebuilt on TipTap v3**: headings, font family/size, bold/italic/underline/strike, alignment, bullet and numbered lists, quotes, tables (with row/column menu), images, undo/redo, zoom, word and character count. `.docx` export rewritten with the `docx` library from the TipTap document. Drafts autosave to the browser (localStorage) until there's a backend.

**Editor next steps**
- Real-time co-editing: add the TipTap Collaboration extension + Yjs once the backend is known (needs a WebSocket server, e.g. Hocuspocus or y-websocket). The `ACTIVE_EDITORS` badges in `A4.tsx` are still mock.
- Sections-as-tasks (Phase 3): decide between one TipTap doc with a custom `section` node or one editor per section. A custom node keeps one continuous page and makes export simple.
- Images are stored as data URLs. Switch to uploads when storage exists.
- Visual page breaks: the page currently grows as one long A4 sheet.

### 9 November 2026: Steps A + B, real accounts and projects
**collab-api** (uncommitted, on `main` alongside your own uncommitted work)
- Fixed issues 1–7 and 10–12 from section 9. Only the auth endpoints are public now. Sign-up works and signs you straight in. Login returns proper 401s. Errors come back as `{ code, message }`.
- New and changed endpoints: `GET /auth/me` (user + plan usage), `GET /projects` (only your projects), `GET /projects/{id}` (members, or anyone if public), `POST /projects` (owner and manager set from the token, Free limit enforced → `403 PROJECT_LIMIT_REACHED`). The old `POST /project` and `GET /test` were removed.
- New `local` profile: in-memory H2, no Postgres needed. Run with `SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run` using JDK 25. The test suite uses it too.
- Placeholder `schema/schema.graphqls` so the Maven build passes (the GraphQL generator required it).
- Still open: issue 8 (document storage, planned for Step C) and issue 9 (GraphQL vs REST).

**collab-web**
- Login page: email → password (existing account) or name + password (new account), with clear errors. Google and Apple buttons say "coming soon".
- The session token is kept in an httpOnly cookie. Browser calls go through `/api/backend/*`, which adds it. `proxy.ts` protects `/dashboard` and returns you to the page you asked for after login.
- Sidebar, header account menu (with Log out), plan pill (`Basic Tier · 1/2`) and project pages use real data. The Create Project dialog warns at the Free limit and opens the new project. The overview renders the description as Markdown.
- Verified with a 19-step browser test (sign-up, login, limits, access, logout, expired session).

### 9 November 2026: Step C, sectioned documents, live editing, version history
**How it works**
- A document is made of **sections**. Each section is its own live-editing room on collab-realtime (`section:<id>`), so nothing done in one section can affect another.
- **Who can edit:** the section's assignees (one or more) and the team leader. Unassigned sections are leader-only. **Approved (Done) sections are locked for everyone** until the leader reopens them. The realtime server asks the API on connect and re-checks every 15s, so an open editor is closed when a section is locked or unassigned.
- **Drafts vs published ("commits"):** the live draft autosaves every ~2s and is visible only to that section's editors. **Publish** creates an immutable version (v1, v2… with author, time and an optional message). Teammates, the full-document **Preview** and the **.docx export** only see published versions.
- **History:** every version is listed per section. Opening one shows a word-level diff against the previous version (green = added, red = removed), with **Restore to draft**.
- **Status flow:** Not started → In progress (on first edit) → In review (assignee submits after publishing) → Done (leader approves and locks) → back to In progress (leader reopens).
- The team leader manages sections (add, rename, delete, drag to reorder) and sets assignees, due date, word target and requirements/rubric in **Section Information**.
- The project page's **Invite** button lets the leader add existing users by email (needed to assign sections).

**collab-api:** new tables `project_documents`, `document_sections`, `section_assignees`, `section_drafts`, `section_versions`. Endpoints for documents, sections, versions, members and `GET /sections/{id}/access`. Internal endpoints `/internal/v1/sections/{id}/draft` for collab-realtime, protected by `INTERNAL_API_KEY`. The old unused `model/docx` classes are still there; they can be deleted.

**collab-realtime:** Hocuspocus 4 on port 3001 (your Express app still serves normal HTTP routes). It needs `.env`: `PORT`, `API_URL`, `INTERNAL_API_KEY` (same value as the API). Run with `npm run dev`.

**collab-web:** needs `NEXT_PUBLIC_REALTIME_URL` (default `ws://localhost:3001`). Install note: `@tiptap/y-tiptap` must be installed explicitly because `--legacy-peer-deps` skips peer dependencies.

**Verified:** 41 API checks (permissions, versions, status rules, internal key) and a 20-step, three-person browser test (live typing both ways, cursors, presence, view-only, publish, unpublished detection, preview excludes drafts, diff, draft persistence, review → approve → open editor locked).

**Known limits (fixed on 10 Nov, see below)**
- ~~Section status changes reach other people by refreshing every 15s.~~
- ~~No page breaks between sections; no generated Table of Contents.~~
- ~~Invites only work for people who already have an account.~~
- Still open: the editor token handed to the WebSocket is the full session token. Mint a short-lived, scoped token later.

### 10 November 2026: live events, page breaks, table of contents, invites
- **Live events:** collab-api notifies collab-realtime after each saved change (`POST /internal/events`, internal key). collab-realtime pushes it to everyone in the project's event room (`project:<id>`, members only, read-only). Section statuses, versions, renames, assignments and the sidebar's document list update instantly (measured: approval reaches an open editor in ~430 ms, a rename in ~200 ms). When a section changes, the realtime server immediately re-checks everyone editing it and closes sessions that lost permission. Polling is now a 60s fallback.
  - Gotcha fixed: Java's HttpClient tries an HTTP/2 upgrade by default, and Node treats the `Upgrade` header as a WebSocket handshake. The notifier forces HTTP/1.1.
- **Page breaks:** each section has "Start on a new page" (default on). Preview shows real A4 pages, and the .docx gets page breaks.
- **Table of Contents:** a section type that is generated, not edited. It lists the published headings of the sections after it (so the cover is skipped), updates live, and links to sections in the preview. In the .docx it is a real Word TOC field: Word fills in page numbers when the file opens.
- **Invites:** "Invite" now takes any email. Existing users join immediately. Others get a pending invite and **join automatically when they sign up**. The leader also gets a **shareable invite link** (14 days, can be reset) and can cancel pending invites. New page: `/invite/<token>` shows who invited you to which project, with Log in / Sign up / Join.
- **Verified:** API test (permissions, versions, invites incl. email mismatch, single-use, reset link), 18-step live/TOC/invite browser test, the 20-step three-person editing test, API test suite, lint, typecheck and production build.

## 8. Open questions

1. ~~**Backend**~~: answered, see section 9.
2. ~~**Real-time infrastructure**~~: answered: own Node service (`collab-realtime`), see section 9.
3. ~~**Editor**~~: decided: **TipTap** (done, see progress log).
4. **AI provider** and whether AI runs through your backend (recommended, so keys stay secret and Premium is enforced).
5. **Payments** provider and pricing for Premium.
6. **Launch audience**: universities first (the ICT374 sample data suggests so)? That shapes privacy, roles (lecturer/reviewer) and onboarding.
7. **Light mode**: will it ship? `dark` is hard-set on `<body>` today.

---

## 9. System architecture

Three repos in the XoraForge GitHub org:

| Repo | Stack | Job | Local port |
|---|---|---|---|
| `collab-web` (this repo) | Next.js 16, React 19, TipTap | UI | 3000 |
| `collab-api` | Spring Boot 4, Java 25, JPA, PostgreSQL, JWT (jjwt) | Accounts, projects, members, tasks, files, permissions. **Source of truth.** | 8080 (`/api/v1`) |
| `collab-realtime` | Node + TypeScript, Express (skeleton today) | WebSockets: live document editing, chat, presence, call signalling | 3001 |

```
Browser ──REST (JWT)──────────────▶ collab-api ──▶ PostgreSQL
   │                                    ▲
   └──WebSocket (JWT in handshake)──▶ collab-realtime
        • /collab : Hocuspocus (Yjs) ───┘ load/save document state via API
        • Socket.IO: chat, presence, WebRTC signalling
```

### Proposed design
- **Live co-editing**: run **Hocuspocus** (the Yjs WebSocket server made by the TipTap team) inside `collab-realtime`. The web app adds TipTap's `Collaboration` + `CollaborationCaret` extensions with `@hocuspocus/provider`. Live cursors replace today's mock name badges.
  - Auth: `onAuthenticate` verifies the user's JWT (same `JWT_SECRET` as the API) and asks the API whether the user is a member of the document's project.
  - Storage: the Hocuspocus database hook loads and saves the Yjs state through an internal API endpoint. The API stays the only service that writes to Postgres. It stores the binary Yjs state plus a JSON snapshot (for search, export, word counts and Project Health).
- **Chat & presence**: Socket.IO in the same Node server, one room per project (the "auto-created project chatroom"). Messages are persisted through the API, then broadcast.
- **Voice/video**: WebRTC with Socket.IO signalling. A peer-to-peer mesh is fine for student-sized groups (≈ up to 5). Calls also need a **TURN server** (e.g. coturn or a hosted one), or they fail on many school and office networks. Move to an SFU (e.g. LiveKit) for bigger calls and screen sharing.
- **Login in the web app**: Next.js route handlers call the API and keep the JWT in an **httpOnly cookie** (not localStorage). `proxy.ts` protects `/dashboard`, and a small route hands the token to the WebSocket connections.

### `collab-api`: issues found (9 Nov 2026)
1. **Every endpoint is public.** `SecurityConfig` has `.requestMatchers("/api/v1/**").permitAll()`, so projects can be read and created without logging in.
2. **Sign-up saves an empty user.** `new User().create(...)` returns a *new* user that is thrown away. The empty one is saved and fails (`email` is NOT NULL).
3. **Login status codes are swapped.** Wrong password returns 404, and unexpected errors return 401. They should be 401 and 500.
4. **Creating a project from the web app can't succeed yet:**
   - `owner` is required but never set. It should come from the logged-in user.
   - The web sends `"Public"`, but the enum is `PUBLIC`.
   - The web sends full timestamps, but the fields are `LocalDate`. `createdAt`/`startDate` should be set by the server anyway.
   - The project image is a data URL, which won't fit the default `varchar(255)`. Needs an upload endpoint (or `TEXT` short-term).
5. **`GET /projects` returns everyone's projects** and serializes JPA entities directly. The lazy `owner` and the `members` back-reference cause serialization errors and recursion. Use response DTOs, filtered to the current user.
6. `ProjectMember` and `Style` have no no-args constructor, which JPA requires.
7. `spring.jpa.hibernate.ddl-auto=create` **wipes the database on every restart.** Use `update` for now, and Flyway migrations before real users.
8. The `docx` entities (Document → Section → Paragraph → Element/Style) mirror the old editor. With TipTap + Yjs, a document should be one row: project, title, type, Yjs state, JSON snapshot. **Sections** stay as their own table for sections-as-tasks (assignee, due date, status, word target, rubric, dependencies).
9. GraphQL (Netflix DGS) dependencies are included, but everything is REST. Pick one; REST is what exists.
10. Free plan limit (2 projects) must be enforced here, in project creation.
11. `spring.security.user.password` is hardcoded and unused once JWT is in. Remove it (and the matching dev credentials in `collab-web`'s `lib/api/Project.ts`).
12. The project targets Java 25; the default `java` on this machine is 17. Build with the JDK 25 in `~/.jdks`.

### `collab-realtime`: status
Express skeleton only (`GET /` → "Server is running" on port 3001). Socket.IO, WebRTC and the editor sync are planned in its README but not started. Its README mentions a "custom WYSIWYG editor"; that is now TipTap.

### Build order
| Step | Repo(s) | Outcome |
|---|---|---|
| A ✅ | api | Fix issues 1–7, add `/auth/me`, project DTOs scoped to the user, free-plan limit, `documents` + `sections` tables |
| B ✅ | web | Real sign-up/login (email flow on the existing login page), httpOnly cookie, `proxy.ts`, real project list in the sidebar, Create Project wired up |
| C ✅ | realtime + web | Hocuspocus with JWT auth and persistence through the API. TipTap `Collaboration` + live cursors. Built as **sections-as-tasks + version history** (see progress log) |
| D | realtime + web | Socket.IO project chat + presence in the Messenger |
| E | realtime + web | Voice channels (WebRTC + TURN) |

### 10 November 2026 (later): tasks and timeline (10.1) + every dead button fixed
**Tasks & timeline**
- **API:** `Task` (title, description, status, priority, assignees, start/due, milestone, board position) and `WorkDependency` (finish-to-start links between any tasks *or document sections*). Projects take a chosen **start date**, and the leader can edit name, description and dates (`PATCH /projects/{id}`). Sections gained a start date.
- `GET /projects/{id}/work-items` returns tasks **and document sections** in one list. A section's status follows its document workflow, so it can't be dragged on the board, and only the leader schedules it.
- **Auto-scheduling (like Microsoft Project):** moving an item later pushes everything that waits on it, keeping their durations. Adding a dependency moves the item after its prerequisite. Items are never pulled earlier, and loops are rejected.
- **Web:** project page **Tasks** tab with three views:
  - **Board:** drag between columns.
  - **List.**
  - **Timeline (Gantt):** drag to move, drag ends to resize, dependency arrows, milestones ◆, today and project-due lines, Days/Weeks zoom, critical-path highlight, double-click a day to add a task, "Not scheduled" list.
  - All views update live for the team.

**Dead clickables fixed**
- `/` goes to the app.
- `/dashboard` is a real home page: your tasks due soon, project cards with progress, upcoming deadlines.
- **Header:** What's new, Messages (opens the Messenger), Notifications (empty state). The account menu has Settings and Help Center.
- **Sidebar:** the plan pill links to Plans; the project card is a project switcher; "plan" is now "Plans"; Overview goes to the real project page (the old `/overview` draft redirects).
- **Project page:** Share (copy link), Edit (leader dialog), and tabs that are real links. Team Members is a real page with Invite; Files is a real page. Notes and Schedule keep the project header (Schedule links to the timeline).
- **Document:** the ⚙ menu has Rename, Download .docx and Delete.
- **Schedule:** month navigation, with deadlines, milestones and project due dates from all projects.
- **Create Project:** has a start date.
- **Unbuilt features** (calls, chat sending, attachments, Excel/PowerPoint/UML) now show a clear "coming soon" toast instead of doing nothing.

**Verified:** 33 task API checks (permissions, ordering, auto-shift, cycles, sections-as-tasks), an 11-step tasks browser test, a 25-step clickables browser test (both also on the production build), and all earlier suites (API sections/invites, live/TOC/invites, three-person editing, API test suite).
- Note: a React hydration warning appeared occasionally in **dev only** while the dev server was recompiling. It does not occur on the production build (0 of 12 fresh loads).

---

## 10. How we'll build the rest

Collab is a **project-management SaaS**: projects with start and end dates, tasks and deadlines, a timeline (like Microsoft Project's Gantt chart), built-in Word, Excel and PowerPoint, chat, and calls while you work. Below is the approach for each remaining piece, in the order I'd build them. Everything reuses what exists: the API owns data and permissions, collab-realtime pushes live updates, and documents are made of assignable sections.

### 10.1 Tasks and the project timeline (Microsoft Project-style Gantt): DONE (10 Nov)
- **Model:** `Task`: project, title, description, status (To do / In progress / In review / Done), priority, assignees, **start date + due date**, estimate, `dependsOn` (finish-to-start), milestone flag, optional link to a document section. Projects get a user-chosen **start date** next to the due date.
- **Sections are tasks.** Every document section automatically owns a task, so it shows on the board and the timeline with its assignees and due date. There's one source of truth, not two lists.
- **Views:** Board (Kanban columns), List, **Timeline**, and the existing Calendar.
- **Timeline / Gantt ("auto-made"):** bars from start to due, dependency arrows, milestones and a "today" line. Drag a bar to reschedule; **dependent tasks shift automatically** (like Microsoft Project), and the critical path is highlighted. Built as our own component (CSS grid + dayjs) so it matches the design. A library such as SVAR React Gantt (MIT) is the fallback if time is tight.
- **Live:** task changes emit the same project events, so boards and timelines update instantly for everyone.

### 10.2 Notifications, deadlines and the activity feed
- **Activity log:** every service writes `ActivityEvent`s (published v3, approved, assigned, joined, task moved). This powers "Recent Activities", the Activities page and edit tracking.
- **Notifications:** a `Notification` table plus a personal realtime room (`user:<id>`), so the header bell updates instantly. A scheduled job in the API sends reminders at 3 days, 1 day and 1 hour before due dates. Email (e.g. Resend or SES) comes next, then mobile push.

### 10.3 Project chat (auto-created per project)
- **Model:** `Channel` (one "general" channel created with each project, more later) and `Message` (author, markdown body, attachments, reply-to, edited/deleted).
- **Flow:** send via REST (saved and permission-checked), the API emits an event, and realtime pushes it to the project room. Typing indicators are live-only messages.
- **UI:** the existing bottom-right Messenger: chat list = your projects, unread counts, and the chatroom view that's already designed.

### 10.4 Voice and video calls while working
- **Use LiveKit** (open-source WebRTC server; self-host, or LiveKit Cloud to start). Peer-to-peer breaks down beyond ~4 people and needs a TURN relay anyway; LiveKit includes both, plus screen sharing.
- The API mints a LiveKit access token only for project members (room = project). The web app uses `livekit-client`.
- **UI:** the existing call bar in the Messenger ("TeamCollab 05:43", mic / headset / settings) becomes a **persistent voice channel** in the dashboard layout. You stay in the call while moving between pages and editing documents, with mute, deafen, speaking indicators and screen share.

### 10.5 Schedule and meetings
- **Model:** `Meeting`: project, title, start/end, attendees, agenda, linked voice room ("Join" opens the project call).
- **UI:** the Schedule page gets week and day views, with meetings, task due dates and project milestones together. Plus `.ics` export and reminders (10.2).

### 10.6 Dashboard home
- My tasks due soon, upcoming meetings, project cards with progress and health, and recent activity.

### 10.7 Project Health
- **Rules, run on every change event and nightly:** overdue tasks or sections, published word count outside the target, sections unassigned or unpublished close to their due date, drafts with unpublished changes near the deadline, inactive members, blocked dependencies.
- **Where it shows:**
  - A health score (Healthy / At risk / Critical) on the project and dashboard cards.
  - Each issue, with its reason, in the document's existing **Problems** panel.
  - Dismissible with a note.
- **AI checks (Premium):** "does this published section meet its requirements/rubric?" via the Claude API, server-side.

### 10.8 Built-in Excel, PowerPoint, UML and graphs
All of these reuse the document model (a file in a project made of assignable parts with drafts, publish and history):
- **Excel:** each **sheet is a section** (assignable). Use an MIT-licensed spreadsheet component (FortuneSheet) with its operations synced through collab-realtime, snapshots stored like drafts, and `.xlsx` export via ExcelJS. Formula engines differ in licensing (e.g. HyperFormula is GPL/commercial), so check before choosing.
- **PowerPoint:** each **slide is a section**. A 16:9 canvas of positioned text boxes (TipTap), images and shapes stored in Yjs. Present mode, and `.pptx` export via PptxGenJS (MIT).
- **UML and diagrams:** React Flow (MIT) with UML node types (class, sequence, use case). Mermaid as a quick text-to-diagram option.
- **Graphs and charts:** chart blocks inside Word and slides, fed from a sheet range, so they update when the data changes.
- Avoid libraries that need a commercial licence (e.g. tldraw), or budget for it.

### 10.9 Plans, payments and AI
- **Payments:** Stripe Checkout and the customer portal. A webhook sets the plan to PREMIUM; the Free limit (2 projects) is already enforced.
- **AI command bar (Premium):** Ctrl/Cmd + K. Claude turns plain language into proposed actions (create project, add sections, assign, schedule a meeting). The user confirms before anything is created.

### 10.10 Production readiness
- Flyway migrations (replace `ddl-auto`), file and image uploads to object storage (S3 / R2) instead of data URLs, Redis so several collab-realtime instances share rooms, CI, and error monitoring.
- **Deploy:** web on Vercel, API and realtime on a host that supports WebSockets (e.g. Fly.io / Render), Postgres on Neon.
- **Mobile:** after the web app is stable. A responsive web app first, then native iOS/Android.

### Suggested order
| # | Build | Why first |
|---|---|---|
| 1 ✅ | Tasks + Timeline (10.1) | Core of a PM tool; sections already behave like tasks |
| 2 | Notifications + activity (10.2) | Deadlines need reminders; feeds Health and the dashboard |
| 3 | Chat (10.3) | Messenger UI already exists; reuses project events |
| 4 | Calls (10.4) | Builds on the chat panel and project rooms |
| 5 | Meetings + Dashboard (10.5, 10.6) | Ties tasks, deadlines and calls together |
| 6 | Project Health (10.7) | Needs tasks, activity and word targets in place |
| 7 | Excel, then PowerPoint, then UML/graphs (10.8) | Same section model, one tool at a time |
| 8 | Premium + AI (10.9), production (10.10) | Monetise once the core is solid |
