# ControlMe

ControlMe is an open-source web project for tracking subscriptions and other recurring expenses.

The goal of the project is simple: give users a clear view of what renews, when it renews, and how recurring costs change over time. It is built as a lightweight alternative to bloated finance products and is meant to stay understandable both as an app and as a public codebase.

## What It Does

- Track subscriptions and recurring payments manually
- Show upcoming charges and renewal dates
- Organize spending by category
- Surface analytics for recurring costs
- Export data as CSV and PDF

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- React Query
- NestJS backend under `apps/backend`
- Shared types under `packages/shared`

## Project Structure

```text
/app              Next.js App Router pages
/components       Reusable UI components
/hooks            Client hooks
/lib              Utilities and API client
/apps/backend     Backend API
/packages/shared  Shared types and design assets
```

## Local Setup

Install dependencies:

```bash
npm install
cd apps/backend
npm install
```

Set up environment variables from the example files, then run:

```bash
# web
npm run dev

# backend
cd apps/backend
npm run dev
```

The web app runs at `http://localhost:3000`.

## Open Source

This repository is intended to be public and inspectable. The web project is the open-source part of ControlMe and is positioned as a free web application.
