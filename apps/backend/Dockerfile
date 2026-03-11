FROM node:20-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app/apps/backend

FROM base AS deps
COPY apps/backend/package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY apps/backend/package*.json ./
RUN npm ci
COPY apps/backend/ ./
COPY prisma ./prisma
# Copy packages to /app/packages so ../../packages/shared/* resolves correctly from /app/apps/backend/
COPY packages /app/packages
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/apps/backend/node_modules ./node_modules
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/node_modules/.prisma ./node_modules/.prisma
# Copy prisma schema for migrate deploy (Prisma looks in ./prisma relative to cwd)
COPY prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/apps/backend/src/main"]
