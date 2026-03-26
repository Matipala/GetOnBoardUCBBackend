<img width="885" height="183" alt="Colorful Community Logo" src="https://github.com/user-attachments/assets/111053c7-d317-4c8e-950a-4e57a51b3ba0" />

# Get On Board UCB - Backend

API y servicios backend para la plataforma de conexión laboral dirigida a estudiantes y graduados de la UCB. Enfocada en proveer un acceso seguro, estructurado y escalable para la gestión de usuarios, empresas, ofertas de trabajo y postulaciones.

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
2. Crea una rama descriptiva para cada tarea: `feature/nombre-tarea` o `fix/nombre-error`.
3. Abre un Pull Request para revisión antes de mergear a `main`.

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

---
