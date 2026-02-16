# Backend API contract

This document describes what the Vue frontend expects from the ASP.NET backend so that login and authorized features work end-to-end.

## Base URL

The frontend uses a **single config** for the backend base URL, defaulting to `https://localhost:7109` when set via environment. Override with `VITE_API_BASE_URL` in `.env` (see project root `.env.example`). If unset, the app runs in demo mode (no real API calls).

## Authentication

### POST /api/auth/login

- **Body:** `{ "email": string, "password": string }`
- **Success (200):** `{ "accessToken": string, "user": { "id": string, "username": string, "email": string, "bio"?: string } }`
- **Failure:** Return 401 or 400 with a JSON body containing a `message` or `error` field so the UI can display it (e.g. "Invalid credentials").

### POST /api/auth/register

- **Body:** `{ "username": string, "email": string, "password": string }`
- **Success (200):** Same shape as login: `{ "accessToken": string, "user": { "id", "username", "email", "bio"? } }`
- **Failure:** 400 with `message` or `error` for validation/duplicate errors.

### GET /api/auth/user (Authorized)

- **Headers:** `Authorization: Bearer <token>`
- **Success (200):** Current user object `{ "id", "username", "email", "bio"? }`
- **Failure:** 401 when token is missing or invalid; clear token on client.

### GET /api/auth/test (Authorized)

- Optional health/connectivity check. Frontend does not require it; backend may use it for testing `[Authorize]`.

## JWT

- The frontend sends `Authorization: Bearer <token>` on every request after login.
- The backend must accept this token on all `[Authorize]` endpoints and validate it (e.g. JWT Bearer middleware). Token should include user identity (e.g. username or user ID) so authorized endpoints can resolve the current user.

## Canvas (all authorized)

All canvas endpoints expect `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/canvas | List all canvases for the user |
| GET | /api/canvas/{id} | Get canvas details (meta + elements) |
| POST | /api/canvas | Create canvas (body: `{ "name": string }`) |
| PUT | /api/canvas/{id} | Update canvas (body: `{ "meta": object, "elements": array }`) |
| DELETE | /api/canvas/{id} | Delete canvas |

Request/response shapes should match the frontend types in `src/types/canvas-meta.ts` and `src/types/canvas/canvas-element.ts` if the backend returns them directly; otherwise the frontend may need adapters.

## Error handling

- Failed login/register: return 401 or 400 with a JSON body containing `message` or `error` so the UI can show it.
- Authorized endpoints: return 401 when the token is missing or invalid so the client can clear the token and redirect to sign-in.
