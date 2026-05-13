# Arquitectura

## Tipo de arquitectura
- Monolito modular (NestJS) con modulos por dominio.
- API REST basada en controladores + servicios (estilo MVC en capas).
- Persistencia con ORM (TypeORM) sobre PostgreSQL.

## Por que esta arquitectura
- Velocidad de entrega: un monolito modular reduce complejidad operativa frente a microservicios.
- Separacion clara de responsabilidades: cada dominio (auth, users, offers, applications) tiene su propio modulo.
- Mantenibilidad: controladores orquestan peticiones, servicios concentran logica de negocio.
- Escalabilidad razonable: se puede escalar el monolito y, si hace falta, extraer modulos a servicios.
- Consistencia de datos: una sola base de datos facilita transacciones y reglas de negocio.

## Criterios de diseno
- Modularidad por dominio para evitar acoplamiento entre features.
- Guards globales para seguridad uniforme.
- DTOs + validacion global para entradas confiables.

## Estructura general
Backend basado en NestJS con modulos por dominio y TypeORM para persistencia.

- Modulo raiz: [GetOnBoardUCBBackend/src/app.module.ts](GetOnBoardUCBBackend/src/app.module.ts)
- Bootstrap: [GetOnBoardUCBBackend/src/main.ts](GetOnBoardUCBBackend/src/main.ts)

## Modulos de dominio
- Auth
- Users
- Offers
- Applications

## Seguridad y validacion
- AuthGuard y RolesGuard se registran globalmente en [GetOnBoardUCBBackend/src/app.module.ts](GetOnBoardUCBBackend/src/app.module.ts).
- Validacion global en [GetOnBoardUCBBackend/src/main.ts](GetOnBoardUCBBackend/src/main.ts).

## Persistencia
- TypeORM con Postgres.
- Entities en cada modulo bajo `entities/`.
- `synchronize: true` en el datasource (solo recomendado para desarrollo).

