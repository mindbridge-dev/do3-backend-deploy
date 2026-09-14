# do³ — API backend image (booking engine + email).
# Serves /api/trpc/* on PORT (default 3000). Run behind api.dodo-do.com.
#
#   docker build -t do3-api .
#   docker run -p 3000:3000 --env-file .env do3-api
FROM node:20-slim

WORKDIR /app

# deps (production) — layer-cached
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# prebuilt server bundle + runtime contracts it imports
COPY dist ./dist
COPY contracts ./contracts

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# config (DATABASE_URL, DO3_SMTP_*, APP_ID/SECRET) via --env-file or -e
CMD ["node", "dist/boot.js"]
