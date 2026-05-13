# API

Base URL: `http://localhost:3001` (o el valor de `PORT`).

Nota: AuthGuard es global. Los endpoints con `@Public()` son publicos. El resto requiere JWT.

## Auth
- POST /auth/login (publico)
- POST /auth/register (publico)
- POST /auth/refresh (publico)
- POST /auth/logout (auth)

Ver controlador: [GetOnBoardUCBBackend/src/auth/auth.controller.ts](GetOnBoardUCBBackend/src/auth/auth.controller.ts)

## Offers
- GET /offers (publico)
- GET /offers/:id (publico)
- GET /offers/employer/mine (roles: employer, admin)
- GET /offers/career/:career (roles: coordinator, admin, student)
- GET /offers/stats (roles: admin)
- POST /offers (roles: employer, admin)
- PATCH /offers/:id (roles: employer, admin)
- DELETE /offers/:id (roles: employer, admin)

Ver controlador: [GetOnBoardUCBBackend/src/offers/offers.controller.ts](GetOnBoardUCBBackend/src/offers/offers.controller.ts)

## Applications
- POST /applications (roles: student, multipart con `cv`)
- GET /applications/offer/:offerId (roles: employer, coordinator, admin)
- GET /applications/student/mine (roles: student)
- GET /applications/student/:studentId (roles: coordinator, admin)
- PATCH /applications/:id/status (roles: employer, admin)

Ver controlador: [GetOnBoardUCBBackend/src/applications/applications.controller.ts](GetOnBoardUCBBackend/src/applications/applications.controller.ts)

## Users
- POST /users (auth requerido, ver nota)
- GET /users (roles: admin, coordinator)
- GET /users/stats (roles: admin)
- GET /users/:id (auth, restricciones por rol)
- PATCH /users/:id (auth, restricciones por rol)
- PATCH /users/:id/role (roles: admin)
- PATCH /users/:id/deactivate (roles: admin)

Ver controlador: [GetOnBoardUCBBackend/src/users/users.controller.ts](GetOnBoardUCBBackend/src/users/users.controller.ts)
