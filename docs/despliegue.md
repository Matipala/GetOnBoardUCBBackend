# Despliegue

## Build
```bash
npm run build
```

## Run
```bash
npm run start:dev
```

## Variables de entorno
Configura .env con los valores de produccion (ver [GetOnBoardUCBBackend/.env.example](GetOnBoardUCBBackend/.env.example)).

## Base de datos
Asegura acceso a PostgreSQL con credenciales validas.

## CORS
El backend permite CORS al frontend via `FRONTEND_URL` (ver [GetOnBoardUCBBackend/src/main.ts](GetOnBoardUCBBackend/src/main.ts)).
