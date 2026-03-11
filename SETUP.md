# ControlMe Setup

## Requirements

- Node.js 18+
- PostgreSQL 14+
- npm

## Environment

Create `apps/backend/.env`:

```env
DATABASE_URL="postgresql://<db_user>:<db_password>@localhost:5432/controlme?schema=public"
JWT_SECRET="<generate_a_real_secret>"
PORT=3001
ALLOWED_ORIGINS="http://localhost:3000"
```

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Install

```bash
npm install
cd apps/backend
npm install
```

## Run

Backend:

```bash
cd apps/backend
npm run dev
```

Web:

```bash
npm run dev
```
