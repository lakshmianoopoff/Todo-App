# PRD: Minimalist To-Do Application

## 1. Overview
A single-user task manager where an authenticated user can add, complete, and delete daily tasks. Emphasis on speed, clarity, and a distraction-free UI — no categories, tags, due dates, or reminders in v1.

**Stack:** Django + Django REST Framework (backend/API) · React (frontend) · Token/session auth assumed already in place.

**Assumption (per scope):** The user is already logged in. Every request in this spec operates on `request.user` — no login/signup screens are part of this build.

---

## 2. Goals
- Add a task in under 2 seconds (type + Enter).
- Toggle completion with a single click, with instant visual feedback and a persisted backend update.
- Delete a task with one click, no confirmation modal (undo-friendly design preferred over "are you sure" friction).
- Keep the UI to two visual zones: **input** and **list**. No settings, no sidebar, no onboarding.

## 3. Non-Goals (v1)
- No due dates, priorities, tags, or subtasks.
- No drag-to-reorder.
- No multi-user sharing/collaboration.
- No offline support / PWA.

---

## 4. Data Model

```python
# models.py
from django.db import models
from django.conf import settings

class Task(models.Model):
    title = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
```

**Field notes:**
- `title` — required, non-empty after trim, max 255 chars.
- `is_completed` — defaults to `False`; flipped via `PATCH`.
- `created_at` — set once, immutable, used for default sort order (newest first within each section).
- `owner` — never exposed as an editable field on the API; always set server-side from `request.user`.

---

## 5. API Contract

All endpoints require authentication. All querysets are scoped to `request.user` — a user must never be able to read, toggle, or delete another user's task (return 404, not 403, for tasks that exist but aren't theirs, to avoid leaking existence).

| Method | Endpoint | Purpose | Request Body | Response |
|---|---|---|---|---|
| GET | `/api/tasks/` | List current user's tasks | — | `200` array of tasks |
| POST | `/api/tasks/` | Create a task | `{ "title": string }` | `201` created task |
| PATCH | `/api/tasks/:id/` | Toggle/update completion | `{ "is_completed": bool }` | `200` updated task |
| DELETE | `/api/tasks/:id/` | Delete a task | — | `204` no content |

**Serializer behavior:**
- `owner` is read-only / not accepted from the client — set via `serializer.save(owner=request.user)`.
- Reject empty/whitespace-only `title` with `400`.
- Use a `ModelViewSet` + `IsAuthenticated` permission class; override `get_queryset` to filter by `owner=self.request.user`.

---

## 6. Frontend UX Spec (React)

### Layout
- Single column, centered, max-width ~560px, generous whitespace. No cards-within-cards.
- **Top:** a single input field with placeholder text ("Add a task and press Enter"). No separate "Add" button required — Enter submits — but include a minimal `+`/send icon button for clarity on touch devices.
- **Below:** two sections, in this order:
  1. **Active** — incomplete tasks, newest first.
  2. **Completed** — collapsed by default behind a small "Completed (n)" toggle, or shown de-emphasized (strikethrough + muted gray) below a thin divider. Pick one; don't build both.

### Interaction rules
- Clicking a task's checkbox toggles `is_completed` optimistically in UI state, fires the `PATCH`, and reconciles/rolls back on error (show a small inline error state, don't silently fail).
- Completing a task **animates it out of Active and into Completed** (simple fade/slide, ~150–200ms — nothing bouncy or playful).
- Deleting a task removes it from local state immediately, fires `DELETE`, rolls back with a toast/inline message if the request fails.
- Empty state (no tasks at all): a single centered line of muted text, e.g. "Nothing here yet." No illustration.

### Visual direction (explicitly avoid AI-generated-template look)
- No gradients, no glassmorphism, no oversized rounded blobs, no emoji as UI elements.
- One accent color used sparingly (e.g., for the input focus ring and the completion checkmark only) — everything else neutral grayscale.
- System font stack or a single clean sans-serif (e.g., Inter). One font, two weights max.
- Checkbox as a real custom-styled checkbox (not a colorful pill toggle) — this is a to-do app, not a settings screen.
- Hover/focus states subtle (opacity or border-color shift), not shadow-heavy.

### State management
- Local component state (`useState`) is sufficient — no Redux/Context needed for this scope.
- Fetch tasks once on mount; all subsequent mutations update local state directly (avoid refetching the whole list after every action).

---

## 7. Non-Functional Requirements
- API responses scoped and filtered server-side — never trust a client-supplied `owner`.
- Basic rate-limiting/validation on task creation (max length) to prevent abuse — not critical for v1 but note it.
- Mobile-responsive down to ~360px width; input and list remain single-column throughout.

## 8. Acceptance Criteria
- [ ] User can create a task via Enter key or button click; it appears in Active immediately.
- [ ] User can toggle a task's completion; it visually moves to Completed and persists on refresh.
- [ ] User can delete a task from either section; it's gone on refresh.
- [ ] Refreshing the page shows only that user's tasks, correctly split into Active/Completed.
- [ ] No task belonging to another user is ever retrievable via the API, even by guessing an ID.
- [ ] UI has no default Bootstrap/Material look-and-feel — custom minimal styling throughout.

---

## 9. Build Prompt (for Antigravity)

Copy-paste this as your build instruction:

```
Build a minimalist to-do app with a Django REST Framework backend and a React frontend.

BACKEND (Django + DRF):
- Task model: title (CharField, max 255), is_completed (BooleanField, default False),
  created_at (auto_now_add), owner (FK to the user model, CASCADE delete).
- ModelViewSet at /api/tasks/ supporting GET (list), POST (create), PATCH (toggle
  is_completed), DELETE — all restricted to IsAuthenticated and scoped to
  request.user via get_queryset override.
- Serializer: owner is read-only, set server-side from request.user on create.
  Reject empty/whitespace title with a 400.
- Assume the user is already authenticated; do not build login/signup flows.

FRONTEND (React):
- Single centered column, max-width ~560px.
- Top: text input, placeholder "Add a task and press Enter" — Enter key or a
  small send-icon button creates the task via POST.
- Below: two sections — "Active" (incomplete tasks, newest first) and
  "Completed" (de-emphasized with strikethrough + muted color, or collapsed
  behind a "Completed (n)" toggle — pick one).
- Checking a task's checkbox PATCHes is_completed and animates it from Active
  to Completed (simple 150-200ms fade/slide, no bounce).
- Delete button per task, fires DELETE, removes immediately from local state
  with optimistic update + rollback on error.
- Design: no gradients, no glassmorphism, no default Bootstrap/Material look.
  Neutral grayscale palette with exactly one accent color used only for the
  input focus ring and the completion checkmark. Single clean sans-serif font
  (e.g. Inter), two weights max. Custom-styled checkbox, not a colorful toggle
  pill. Subtle hover/focus states via opacity or border-color, not shadows.
- Use local component state (useState) — no Redux/Context needed. Fetch tasks
  once on mount; update local state directly on create/toggle/delete rather
  than refetching the full list each time.
- Empty state: single centered muted line, "Nothing here yet." — no illustration.
```
