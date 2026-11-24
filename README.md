# Estilo Zona — Frontend

Interfaz del panel de reservas de Estilo Zona, desarrollada con Angular y TypeScript.

## Requisitos

- Node.js y npm compatibles con la versión de Angular indicada en `package.json`.
- Backend Spring Boot disponible para consultar datos reales.

## Ejecución local

```bash
npm ci
npm start
```

Abrir `http://localhost:4200`. Para generar una versión compilada: `npm run build`.

## Módulos

La aplicación incluye pantallas de clientes, empleados, reservas, salas, servicios, pagos y usuarios. Algunos módulos todavía están en desarrollo.

Los servicios HTTP actuales usan `http://localhost:8080/v1`, por lo que el backend debe estar disponible en esa dirección o las URL de servicio deberán adaptarse al entorno.

## Pruebas

```bash
npm test
```

Las pruebas unitarias no sustituyen las pruebas de integración con el backend. Antes de integrar cambios, ejecutar los comandos de compilación y pruebas y corregir los módulos incompletos si aparecen errores.
