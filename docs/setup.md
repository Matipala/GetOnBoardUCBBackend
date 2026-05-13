# Setup

## Requisitos
- Node.js 18+ (recomendado)
- PostgreSQL 15+
- Docker (opcional, para la DB local)

## Variables de entorno
Crea un archivo .env en la raiz y usa como referencia [GetOnBoardUCBBackend/.env.example](GetOnBoardUCBBackend/.env.example).

Variables principales:
- PORT
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- JWT_SECRET
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

## Base de datos con Docker
Se incluye un docker-compose para levantar Postgres:
- [GetOnBoardUCBBackend/docker-compose.yml](GetOnBoardUCBBackend/docker-compose.yml)

Comando sugerido:
```bash
docker compose up -d
```

## Instalar dependencias
```bash
npm install
```

## Ejecutar en desarrollo
```bash
npm run start:dev
```

## Scripts utiles
- build: `npm run build`
- lint: `npm run lint`
- format: `npm run format`
- tests: `npm run test` / `npm run test:e2e`
- seed: `npm run seed`

## Puertos
El servidor lee `PORT` y por defecto usa 3001 si no existe. Ver [GetOnBoardUCBBackend/src/main.ts](GetOnBoardUCBBackend/src/main.ts).
