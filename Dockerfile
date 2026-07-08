FROM node:24-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-fund --no-audit \
  && npm cache clean --force

RUN npx playwright install --with-deps chromium webkit \
  && apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates glib-networking \
  && rm -rf /var/lib/apt/lists/*

COPY src ./src

EXPOSE 8080

CMD ["node", "src/index.ts"]
