# Validar la base

En Windows ejecutar en la raíz `.\fiavl.cmd`. Abrir http://localhost:5173 y consultar /api/health por proxy. Esperar 12 eventos, 6 artistas y 5 sedes. Navegar por teclado hasta la selección y abrir /reservas. Detener con Ctrl+C.

Una segunda ejecución de `.\fiavl.cmd setup` debe informar «Dependencias vigentes». `.\fiavl.cmd shell` permite comprobar node -v y npm -v. Con ambos puertos libres ejecutar `.\fiavl.cmd check`. Esperar lint, typecheck, pruebas Node, build y pruebas Chromium de portada, navegación, disponibilidad mixta y estados del catálogo.

Para repetir la matriz aislada en Windows, dentro de shell ejecutar `node tests/bootstrap/windows.mjs` desde la raíz de un checkout Git. Crea su propio perfil y copia temporal. El [README](../../README.md) describe Linux, macOS, la configuración opcional y los comandos npm individuales.
