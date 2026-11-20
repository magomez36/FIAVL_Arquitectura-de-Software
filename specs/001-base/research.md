# Decisiones de diseño

| Decisión | Motivo | Alternativa considerada |
|---|---|---|
| Node 24.22.3, npm 11.17.0 y workspaces | Runtime observado en Windows, SQLite incluido y lock raíz | Driver nativo adicional requiere compilación |
| DatabaseSync, FK, tablas STRICT, escrituras en transacciones | 23 fichas y un proceso local. El commit conjunto preserva integridad | Datos en memoria perderían persistencia |
| React Router con módulos de ruta propios y menú derivado | Permite a cada spec activar su propia entrada | Registro central editado por nueve ramas |
| SVG originales servidos desde public | Las mismas URL funcionan en Vite y dist sin servicios externos | Imágenes remotas con disponibilidad variable |
| Playwright Chromium por versión y CI en dos sistemas | El mismo smoke verifica proxy y navegador | Ruta fija a Chrome local sería específica de la máquina |

Fuentes primarias: [SQLite en Node 24](https://nodejs.org/docs/latest-v24.x/api/sqlite.html), [assets de Vite](https://vite.dev/guide/assets.html#the-public-directory), [Chromium de Playwright](https://playwright.dev/docs/browsers), [instalación con lockfile](https://docs.npmjs.com/cli/v11/commands/npm-ci/).
