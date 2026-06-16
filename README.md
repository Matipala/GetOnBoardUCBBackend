<img width="885" height="183" alt="Colorful Community Logo" src="https://github.com/user-attachments/assets/111053c7-d317-4c8e-950a-4e57a51b3ba0" />

# Get On Board UCB - Backend

API y servicios backend para la plataforma de conexión laboral dirigida a estudiantes y graduados de la UCB. Enfocada en proveer un acceso seguro, estructurado y escalable para la gestión de usuarios, empresas, ofertas de trabajo y postulaciones.

## Enlaces Públicos

- **API Desplegada (Producción)**: https://getonboarducbbackend.onrender.com

##  Tech Stack

- **Framework:** [NestJS](https://nestjs.com/)
- **Database ORM:** [TypeORM](https://typeorm.io/) con PostgreSQL
- **Security & Auth:** [JWT](https://jwt.io/) y [bcrypt](https://www.npmjs.com/package/bcrypt)
- **Linter & Formatter:** [ESLint](https://eslint.org/) y [Prettier](https://prettier.io/)
- **Git Hooks:** [Husky](https://typicode.github.io/husky/) y lint-staged

##  Estándares de Desarrollo

Para este repositorio utilizamos **ESLint**, **Prettier** y **Husky**. 
> **¿Por qué usar estas herramientas?** Filtran y aseguran que cualquier código nuevo cumpla con los estándares de calidad y estilo antes de hacer un commit (pre-commit hook). Formatea y revisa automáticamente el código, permitiendo un desarrollo ágil y sin errores de sintaxis que suban al repositorio.

## GitHub Flow
Seguimos el modelo de ramas de **GitHub Flow**:
1. `main` siempre es producción.
2. `test` siempre es preview
3. Crea una rama descriptiva para cada tarea: `feature/nombre-tarea` o `fix/nombre-error`.
4. Abre un Pull Request para revisión en `test` antes de mergear a `main`.

## Instalación Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Matipala/GetOnBoardUCBBackend.git
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Variables de Entorno:
   Crea un archivo `.env` en la raíz del proyecto basándote en un posible `.env.example` y configura tus accesos a la base de datos PostgreSQL y la clave secreta para JWT.

4. Ejecutar en modo desarrollo:
   ```bash
   npm run start:dev
   ```

## Scripts Adicionales

1. Si necesitas formatear tus archivos manualmente:
   ```bash
   npm run format
   ```

2. Para escanear el código y encontrar errores de linting automáticamente:
   ```bash
   npm run lint
   ```

3. Para preparar los hooks de Husky (suele ejecutarse automáticamente tras `npm install`):
   ```bash
   npm run prepare
   ```

## Testing y CI

### Tests locales

- Unit tests:
   ```bash
   npm run test
   ```
- E2E tests:
   ```bash
   npm run test:e2e
   ```
- Cobertura:
   ```bash
   npm run test:cov
   ```

### Pipeline CI (GitHub Actions)

El repositorio cuenta con flujos de trabajo automatizados en GitHub Actions para asegurar la calidad del código:
- **Linting (`lint.yml`)**: Ejecuta `npm run lint` (usando ESLint). Se dispara automáticamente en cada `push` o `pull request` hacia las ramas `main` o `test`. Su objetivo es bloquear la integración de código que no cumpla con los estándares de estilo.
- **Pruebas (`ci.yml`)**: Ejecuta tests unitarios, tests e2e, compilación (build), auditoría de seguridad y escaneo de vulnerabilidades con Trivy.
- **Deploy (`cd.yml`)**: Dispara el deploy automático a Render cuando se hace push a `main` (producción) o `develop` (desarrollo).

## 🐳 Docker

### Levantar el stack completo

El proyecto incluye un `docker-compose.yml` que orquesta los siguientes servicios en una red Docker compartida (`getonboard-net`):

| Servicio | Imagen | Puerto |
|---|---|---|
| `db` | PostgreSQL 15 | 5432 |
| `backend` | NestJS (build local) | 3004 → 3001 |

```bash
# Construir y levantar todos los servicios
docker-compose up --build

# Levantar en segundo plano
docker-compose up --build -d

# Ver estado de los servicios y healthchecks
docker-compose ps

# Detener todo
docker-compose down
```

### Health Check

El backend expone un endpoint `/health` que verifica la conexión a la base de datos:

```bash
# Verificar el estado del backend
curl http://localhost:3004/health
# Respuesta esperada: {"status":"ok","database":"connected"}
```

Docker utiliza este endpoint para monitorear automáticamente el estado del servicio backend.

---
