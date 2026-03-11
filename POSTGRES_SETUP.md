# PostgreSQL Setup

## Docker example

```powershell
docker run --name controlme-postgres `
  -e POSTGRES_USER=<db_user> `
  -e POSTGRES_PASSWORD=<db_password> `
  -e POSTGRES_DB=controlme `
  -p 5432:5432 `
  -d postgres:15
```

## Local connection string

```env
DATABASE_URL="postgresql://<db_user>:<db_password>@localhost:5432/controlme?schema=public"
```

## Prisma

```powershell
cd apps/backend
npx prisma migrate dev --schema=../../prisma/schema.prisma
```
