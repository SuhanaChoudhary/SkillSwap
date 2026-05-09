# SkillSwap API

Base URL: `http://localhost:4000`

All authenticated routes require an `Authorization: Bearer <jwt>` header.

---

## Auth

### `POST /api/auth/register`
Register a new user.

**Body**
```json
{
  "name": "Jane",
  "email": "jane@example.com",
  "password": "secret12",
  "skillsOffered": ["React"],
  "skillsWanted": ["Spanish"]
}
```
**Responses**
- `201` → `{ token, user }`
- `400` Validation
- `409` Email taken

### `POST /api/auth/login`
**Body** `{ email, password }` — **200** `{ token, user }` · **401** invalid creds.

### `GET /api/auth/me` 🔒
Returns `{ user }`.

### `PUT /api/auth/me` 🔒
Update name, `skillsOffered`, `skillsWanted`.

---

## Skills (Listings)

### `GET /api/skills`
Public. Query params: `search`, `category`, `owner`.

**200** `{ items: [{ id, skillName, description, category, ownerId, owner, createdAt }] }`

### `GET /api/skills/:id`
Public.

### `POST /api/skills` 🔒
**Body** `{ skillName, description, category }` → **201** `{ item }`.

### `PUT /api/skills/:id` 🔒
Owner or admin only. Partial update.

### `DELETE /api/skills/:id` 🔒
Owner or admin only. Cascades to requests.

---

## Requests

### `GET /api/requests` 🔒
Returns `{ incoming: [...], outgoing: [...] }` for the current user.

### `POST /api/requests` 🔒
**Body**
```json
{ "listingId": "...", "offerSkill": "Python", "message": "Wanna swap?" }
```
- `400` if requesting your own listing
- `409` if you already have a pending request for this listing

### `PATCH /api/requests/:id` 🔒
**Body** `{ "status": "approved" | "rejected" | "cancelled" }`
- Receiver may approve/reject. Requester may cancel.

---

## Admin (role = `admin`)

### `GET /api/admin/users` 🔒
### `DELETE /api/admin/users/:id` 🔒  (cannot delete admins)
### `GET /api/admin/stats` 🔒

---

## Error format
```json
{ "error": "Message", "details": [ ... optional ... ] }
```

Status codes used: `200, 201, 400, 401, 403, 404, 409, 500`.
