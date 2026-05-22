# Etapa 1: Dependencias
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
# Etapa 2: Build
# FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Etapa 3: Producción
# FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Exponemos el puerto (ajustado al .env del usuario)
EXPOSE 3001

CMD ["npm", "run", "start:prod"]
