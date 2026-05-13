# Base de datos

## Motor
PostgreSQL 15+.

## Contenedores
Se incluye un docker-compose para Postgres:
- [GetOnBoardUCBBackend/docker-compose.yml](GetOnBoardUCBBackend/docker-compose.yml)

## Tablas principales (TypeORM)
- users: [GetOnBoardUCBBackend/src/users/entities/user.entity.ts](GetOnBoardUCBBackend/src/users/entities/user.entity.ts)
- offers: [GetOnBoardUCBBackend/src/offers/entities/offer.entity.ts](GetOnBoardUCBBackend/src/offers/entities/offer.entity.ts)
- applications: [GetOnBoardUCBBackend/src/applications/entities/application.entity.ts](GetOnBoardUCBBackend/src/applications/entities/application.entity.ts)

## Relaciones
- applications.offer_id -> offers.id
- applications.student_id -> users.id

## Notas
- `synchronize: true` esta activo en desarrollo (ver [GetOnBoardUCBBackend/src/app.module.ts](GetOnBoardUCBBackend/src/app.module.ts)).
- Para produccion se recomienda migraciones.
