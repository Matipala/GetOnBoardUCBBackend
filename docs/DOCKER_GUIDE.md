# Guía de Docker - Backend

Este proyecto está configurado para funcionar de forma profesional utilizando Docker, permitiendo un desarrollo ágil y sincronizado.

## Comandos Rápidos

- **Encender todo**: `docker compose up -d`
- **Apagar todo**: `docker compose down`
- **Ver logs**: `docker compose logs -f backend`
- **Reconstruir imágenes**: `docker compose up -d --build`

## Puertos y Servicios

| Servicio | Puerto Host (Tu PC) | Puerto Contenedor | Variable de Entorno |
| :--- | :--- | :--- | :--- |
| **API (Backend)** | `3004` | `3001` | `PORT` en `.env` |
| **Base de Datos** | `5432` | `5432` | - |

## Características Especiales

1. **Sincronización en Tiempo Real (Volumes)**:
   - Los archivos de tu computadora están conectados al contenedor.
   - Cualquier cambio que hagas en el código (ej: en `src/`) se reflejará automáticamente dentro de Docker.
   - El servidor se reiniciará solo gracias a `npm run start:dev`.

2. **Healthcheck (Conexión Segura)**:
   - El backend está configurado para esperar a que la base de datos esté **realmente lista** antes de intentar conectarse. Esto evita errores de arranque.

3. **CORS Flexible**:
   - El servidor acepta peticiones desde `localhost` en los puertos 3000, 3001, 3002 y 3003 para facilitar el desarrollo polyrepo.
