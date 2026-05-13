# Autenticacion (Backend)

## Resumen
El backend usa JWT con refresh token. Los endpoints publicos se marcan con `@Public()` y el resto requiere `Authorization: Bearer <token>`.

## Endpoints
- POST /auth/login
- POST /auth/register
- POST /auth/refresh
- POST /auth/logout

Controlador: [GetOnBoardUCBBackend/src/auth/auth.controller.ts](GetOnBoardUCBBackend/src/auth/auth.controller.ts)

## Flujo de login
1. El cliente envia `email` y `password` a /auth/login.
2. Se valida contra DB (bcrypt.compare).
3. Se generan tokens:
   - access token: 15m
   - refresh token: 1d
4. Se guarda el refresh token hasheado en DB.
5. Se responde con tokens y datos del usuario.

Implementacion:
- Servicio: [GetOnBoardUCBBackend/src/auth/auth.service.ts](GetOnBoardUCBBackend/src/auth/auth.service.ts)
- Refresh token hash: [GetOnBoardUCBBackend/src/users/users.service.ts](GetOnBoardUCBBackend/src/users/users.service.ts)

## Flujo de refresh
1. El cliente envia `userId` y `refreshToken` a /auth/refresh.
2. Se compara el refresh token con el hash guardado.
3. Se verifica la firma con `JWT_REFRESH_SECRET` (o `JWT_SECRET` si no existe).
4. Se generan nuevos tokens y se actualiza el hash.

## Flujo de logout
1. El cliente envia `email` a /auth/logout.
2. Se invalida el refresh token en DB (se pone `null`).

## Guardas y roles
- AuthGuard valida el JWT y agrega `request.user`.
- RolesGuard valida el rol segun `@Roles()`.
- `@Public()` omite autenticacion.

Archivos:
- AuthGuard global: [GetOnBoardUCBBackend/src/common/guards/auth.guard.ts](GetOnBoardUCBBackend/src/common/guards/auth.guard.ts)
- RolesGuard global: [GetOnBoardUCBBackend/src/common/guards/roles.guard.ts](GetOnBoardUCBBackend/src/common/guards/roles.guard.ts)
- Decoradores: [GetOnBoardUCBBackend/src/common/decorators/public.decorator.ts](GetOnBoardUCBBackend/src/common/decorators/public.decorator.ts), [GetOnBoardUCBBackend/src/common/decorators/roles.decorator.ts](GetOnBoardUCBBackend/src/common/decorators/roles.decorator.ts)
- Registro global: [GetOnBoardUCBBackend/src/app.module.ts](GetOnBoardUCBBackend/src/app.module.ts)

## Payload JWT
Se firma un payload con:
- sub: userId
- username: email
- role: rol

Se usa para validacion de roles y para identificar al usuario en los controladores.

## Configuracion
Variables usadas:
- JWT_SECRET (obligatoria)
- JWT_REFRESH_SECRET (opcional)

Referencia: [GetOnBoardUCBBackend/.env.example](GetOnBoardUCBBackend/.env.example)
