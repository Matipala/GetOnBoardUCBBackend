FROM node:22-bookworm-slim AS deps
WORKDIR /app

ENV HUSKY=0

COPY package*.json ./
RUN npm ci --legacy-peer-deps

FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HUSKY=0

COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps --ignore-scripts && npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]