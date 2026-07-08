FROM node:24-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-fund --no-audit

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-slim AS runtime

WORKDIR /app

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-fund --no-audit \
  && npm rebuild better-sqlite3 \
  && npm cache clean --force

RUN npx playwright install --with-deps chromium webkit \
  && apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates glib-networking \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]
