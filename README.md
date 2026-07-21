# Auth System

An Express + Prisma authentication API with register, login, and refresh-token flows.

## What It Uses

- Express 5
- Prisma with PostgreSQL
- JWT access and refresh tokens
- `express-validator` for request validation
- `bcrypt` for password hashing

## Project Structure

- `index.js` - application entry point
- `src/controllers` - route handlers
- `src/services` - auth and token business logic
- `src/middleware` - token, admin, and request validation
- `src/routers` - API route definitions
- `prisma/schema.prisma` - database schema

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with the required variables:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/authsystem"
JWT_SECRET="your-access-token-secret"
REFRESH_JWT_SECRET="your-refresh-token-secret"
```

Note: the refresh-token secret is read from `REFRESH_JWT_SECRET` in the current code.

Note: If you don't have a secret, you can generate one by running
```bash
node create_secret.js
```

3. Apply Prisma migrations and generate the client if needed:

```bash
npx prisma migrate dev --name "Initial_Migration"
npx prisma generate
```

Note: If prisma migrate dev fails, and ask you to run **prisma migrate dev**. Run:

```bash
npx prisma migrate reset
```
Then run the migration command again.

This error comes if any migration history exists from when I tested it. This command will reset the database.

4. Start the server:

```bash
node index.js
```

## API Routes

Base path: `/api/users`

### `POST /register`

Creates a new user.

Required fields:

- `email`
- `name`
- `password` with a minimum length of 8

Optional field:

- `role`, which must be either `USER` or `ADMIN`

If `role` is omitted, the database default is `USER`.

### `POST /login`

Authenticates a user and returns an access token, refresh token, and user name.

Required fields:

- `email`
- `password` with a minimum length of 8

### `POST /refresh-token`

Generates a new access token from a valid refresh token.

Required field:

- `token`

## Request Format

The app currently uses `multer().none()` in `index.js`, so requests should send form fields as `multipart/form-data` without files.

## Usage Examples

These examples show the middleware order used in the router.

### User-only endpoint

```js
router.post(
  "/a",
  validateToken, // Adds req.userId and req.isAdmin from the access token.
  body("title").exists().notEmpty(),
  body("content").exists().notEmpty(),
  validateRequest,
  authController.someUserAction
)
```

### Admin-only endpoint

```js
router.post(
  "/b",
  validateToken, // Adds req.userId and req.isAdmin from the access token.
  isAdmin, // Rejects the request if req.isAdmin is false.
  body("name").exists().notEmpty(),
  body("role").optional().isString(),
  validateRequest,
  authController.someAdminAction
)
```

### Protected GET endpoint with no body validation

```js
router.get(
  "/c",
  validateToken,
  isAdmin,
  authController.someAdminReadAction
)
```

## Middleware Order

- Use `validateToken` before any route that depends on `req.userId` or `req.isAdmin`.
- Use `isAdmin` only after `validateToken` has populated the request.
- Use `validateRequest` only when the route defines `express-validator` checks for body or query parameters.
