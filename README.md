# FIAVL Explora

Prototipo no oficial del Festival Internacional de Artes Vivas de Loja. La portada y el catálogo usan datos demo de la edición del **12 al 22 de noviembre de 2026**, con hora de Loja (America/Guayaquil). Las nueve secciones de integración muestran su disponibilidad.

## Inicio en Windows

Después de integrar Spec 1 en main, en Windows 10/11 x64 con Git, Windows PowerShell 5.1 y tar.exe del sistema, ejecuta:

```powershell
git clone https://github.com/magomez36/FIAVL_Arquitectura-de-Software.git
cd FIAVL_Arquitectura-de-Software
.\fiavl.cmd
```

Durante la revisión previa al merge, usa el checkout de `feature/spec-1` que contiene esta entrega. Abre [la portada](http://localhost:5173). Ctrl+C detiene el entorno. La primera preparación requiere internet y espacio de escritura en el perfil y el checkout.

| Comando | Resultado |
|---|---|
| `.\fiavl.cmd` | Prepara y arranca API y web |
| `.\fiavl.cmd setup` | Prepara runtime, dependencias y SQLite; termina sin servidores |
| `.\fiavl.cmd check` | Prepara, ejecuta lint, tipos, tests y build, instala o reutiliza Chromium y ejecuta E2E |
| `.\fiavl.cmd shell` | Abre cmd en el proyecto con el entorno exacto. Escribe `exit` para volver |

El bootstrap lee las versiones exactas de `package.json`. Reutiliza Node y npm compatibles del PATH o la copia portable de `%LOCALAPPDATA%\FIAVL\runtime`. Para señalar una copia propia, define `FIAVL_NODE_HOME` en la sesión con la carpeta que contiene node.exe. Cuando necesita Node, descarga el ZIP de nodejs.org y comprueba su SHA-256 contra SHASUMS256.txt. Si necesita otro npm, lo instala desde registry.npmjs.org con prefijo privado y scripts de instalación deshabilitados. El PATH se aplica al proceso y sus hijos. Si otra preparación está activa, espera a que termine y reintenta.

Cada checkout conserva su huella en `node_modules/.fiavl-install`. Cambiar el lockfile, los manifiestos, .npmrc, las versiones o la arquitectura dispara `npm ci`. En Codex usa `.\fiavl.cmd check` directamente; para comandos npm interactivos usa `shell`.

## Configuración y diagnóstico

Express escucha en 127.0.0.1:3001. Vite dev y preview usan 127.0.0.1:5173 y envían /api al backend. Los puertos y el host son parte del contrato local de la base. Si están ocupados, identifica el PID con `netstat -ano | findstr ":3001 :5173"` y cierra tu instancia anterior. El bootstrap informa el conflicto antes de arrancar.

La única variable de aplicación es `FIAVL_DB`. Por defecto se usa `apps/api/data/fiavl.sqlite`. Para personalizarla, define la variable en la sesión o copia [.env.example](.env.example) a .env. Las rutas relativas parten de la raíz. La variable del proceso tiene prioridad. El arranque aplica migraciones y solo carga la edición si el catálogo está vacío. El archivo .env es opcional y queda en manos del integrante.

Ante un fallo de red, comprueba acceso HTTPS a nodejs.org, registry.npmjs.org y, para check, al CDN de Playwright. Reintenta el mismo comando. Si tienes el runtime exacto por otra vía, verifica `node -v` y `npm -v` y utiliza los comandos npm siguientes.

## Linux, macOS y entorno manual

Selecciona Node con un gestor ya instalado (por ejemplo, `nvm install && nvm use`, que lee .nvmrc) o con el [archivo oficial de Node](https://nodejs.org/en/download). Para alinear npm dentro de tu cuenta en bash o zsh:

```sh
npm_version=$(node -p "require('./package.json').engines.npm")
prefix="$HOME/.local/share/fiavl/npm-$npm_version"
npm install --prefix "$prefix" --ignore-scripts --no-audit --no-fund "npm@$npm_version"
export PATH="$prefix/node_modules/.bin:$PATH"
node scripts/verify-runtime.mjs
npm --version
npm ci
npm run db:seed -- --if-empty
npm run dev
```

Con los servidores detenidos, usa `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npx playwright install chromium` y `npm run test:e2e`. En Ubuntu instala también las bibliotecas del navegador con `npx playwright install --with-deps chromium`. `npm run db:seed` sigue disponible para incorporar las fichas demo que falten. El build produce apps/api/dist y apps/web/dist. Para revisar el build local usa `node apps/api/dist/server.js` y en otra terminal `npx vite preview --config apps/web/vite.config.ts`. Un despliegue requiere configurar el servidor de estáticos para dirigir /api a Express. Esta entrega cubre la ejecución local. Los entornos probados figuran en la [validación](specs/001-base/validation.md).

## Desarrollo con Spec Kit

Git y el bootstrap bastan para ejecutar la aplicación en Windows. Para SDD, el checkout aporta .specify/, la constitución y las skills de .agents/skills/. Usa un agente que pueda leerlas y PowerShell para los helpers seleccionados en este proyecto. Comprueba `specify version`. Si necesitas instalar el CLI, con uv y Python ≥3.11 usa `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.4.3` y comprueba la versión de nuevo. Los presets que usan el helper Python de composición necesitan Python 3 con PyYAML.

Una vez integrada la base, cada agente prepara su rama desde main actualizado y establece en su sesión `$env:SPECIFY_FEATURE_DIRECTORY='specs/<directorio-propio>'`. Sigue [AGENTS.md](AGENTS.md) para la propiedad y el flujo SDD. Reutiliza la inicialización existente.

## Guías

- [Contratos REST, fixtures y claves del navegador](docs/contracts.md)
- [Arquitectura en cuatro vistas y un escenario](docs/architecture.md) y [decisiones ADR](docs/adr.md)
- [Mapa de propiedad](AGENTS.md), [contribución](docs/contributing.md) y [roadmap](docs/roadmap.md)
- [Procedencia de imágenes e iconos](docs/assets.md)
- [Constitución](.specify/memory/constitution.md), [Spec 1](specs/001-base/spec.md), [plan](specs/001-base/plan.md) y [tareas](specs/001-base/tasks.md)
- [Validación de entrega](specs/001-base/validation.md)

El flujo GitHub Actions repite la instalación y las puertas de calidad en Ubuntu y Windows. El equipo revisa los resultados antes del merge.
