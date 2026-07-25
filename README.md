# Auth System

An Express + Prisma authentication API with register, login, and refresh-token flows.

## What It Uses

- Express 5
- Prisma with PostgreSQL
- JWT access and refresh tokens
- `express-validator` for request validation
- `bcrypt` for password hashing
- `nodemailer` for OTP delivery

## Project Structure

- `index.js` - application entry point
- `src/controllers` - route handlers
- `src/services` - auth and token business logic
- `src/middleware` - token, admin, and request validation
- `src/routers` - API route definitions
- `prisma/schema.prisma` - database schema

## Design Decisions

- OTP and OTP expiry are stored in the database.
- OTPs are hashed before storage.
- Verifying OTP automatically logs the user in by returning access and refresh tokens.
- A user must be verified before they can log in.
- Passwords are hashed with `bcrypt` before being stored.
- OTPs expire after 10 minutes.
- Access tokens expire after 15 minutes and refresh tokens expire after 1 hour.
- The API currently accepts form fields through `multipart/form-data` without files because the app uses `multer().none()`.
- The auth routes are mounted under `/api/auth`.

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
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=587
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-email-password"
```

Note: the refresh-token secret is read from `REFRESH_JWT_SECRET` in the current code.

Note: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASS` are used by `nodemailer` to send OTP emails.

Note: If you don't have a secret, you can generate one by running
```bash
node create_secret.js
```

3. Apply Prisma migrations and generate the client if needed:

```bash
npx prisma migrate dev --name "Initial_Migration"
npx prisma generate
```

Note: If `prisma migrate dev` fails and asks you to reset the database, run:

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

Base path: `/api/auth`

### `POST /register`

Creates a new user.

Required fields:

- `email`
- `name`
- `password` with a minimum length of 8

Optional field:

- `role`, which must be either `USER` or `ADMIN`

If `role` is omitted, the database default is `USER`.

The server creates an OTP, stores its hashed value and expiry in the database, and emails the OTP to the user.

### `POST /login`

Authenticates a user and returns an access token, refresh token, and user name.

Required fields:

- `email`
- `password` with a minimum length of 8

The account must already be verified before login succeeds.

### `POST /refresh-token`

Generates a new access token from a valid refresh token.

Required field:

- `token`

### `POST /verify-otp`

Verifies a one-time password (OTP) sent to the user's email.

Required fields:

- `email`
- `otp`

If verification succeeds, the API returns tokens immediately, so OTP verification also completes the login flow.

### `POST /resend-otp`

Sends a new one-time password (OTP) to the user's email.

Required field:

- `email`

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

## Database Notes

- You can find the schema in `prisma/schema.prisma`.
