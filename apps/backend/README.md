# ControlMe Backend

NestJS backend API for ControlMe subscription tracker.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database and JWT secret
```

3. Set up database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user (protected)

### Subscriptions
- `GET /subscriptions` - Get all subscriptions (protected)
- `POST /subscriptions` - Create subscription (protected)
- `GET /subscriptions/:id` - Get subscription by ID (protected)
- `PATCH /subscriptions/:id` - Update subscription (protected)
- `DELETE /subscriptions/:id` - Delete subscription (protected)

### Analytics
- `GET /analytics/monthly` - Get monthly analytics (protected)
- `GET /analytics/categories` - Get category breakdown (protected)

### Export
- `GET /export/pdf` - Export financial summary as PDF (protected)

## Tech Stack

- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- PDFKit (for PDF export)

