# Validación de Mi agenda · 22 de noviembre de 2026

macOS (Darwin 24.6), rama `feature/spec-5` creada desde `main` en `10384a5` (incluye Spec 2). Node 24.22.3, npm 11.17.0, Chromium headless.

## Matriz de impacto (available=true de `/mi-agenda`)
| Consumidor | Cambio | Cobertura |
|---|---|---|
| Menú (`main.tsx`) | Desaparece «No disponible» en Mi agenda | e2e spec-05 (entrada directa) |
| Ruta `/mi-agenda` | Deja de mostrar `Unavailable` | e2e spec-05 |
| Home / carrusel | No cambia: el CTA de la primera escena ya apunta a `/agenda` (Spec 2) y no se tocó | spec-10 (suite completa) |
| `/agenda` y otras features | Sin cambios; Mi agenda no escribe en su estado ni depende de su UI | spec-02/04/07/10 en la suite completa |
| Persistencia | Solo `fiavl:agenda:v1` vía `readLocal/writeLocal` | tests/storage.test.ts + spec-05 |

## Resultados reales
| Comando | Salida | Detalle |
|---|---:|---|
| `npm run lint` | 0 | sin avisos |
| `npm run typecheck` | 0 | sin errores |
| `npm test` | 0 | 17 pruebas, 17 pasan |
| `npm run build` | 0 | api y web compilan |
| `npm run test:e2e` | 0 | 25 de 25 pasan (4 de spec-05) |
| `playwright test spec-10 -g "escena automática" --repeat-each=8` | 0 | 8 de 8 pasan |

## Escenarios probados
Añadir, duplicado (botón deshabilitado y `addId` idempotente), quitar, orden, solapamiento real (`umbral-de-luz`/`el-rio-suena`), extremos contiguos (solo unitaria: el catálogo demo no tiene un par contiguo), recarga, ID inexistente, almacenamiento corrupto, almacenamiento bloqueado (aviso), error con reintento, 375 px y 1440 px sin desbordamiento horizontal.

## Límites
- Los helpers `.ps1` de Spec Kit no se ejecutaron (no hay `pwsh` en macOS); los artefactos SDD se redactaron a mano.
- NO VERIFICADO: revisión visual manual, lector de pantalla, movimiento reducido en navegador (solo comprobación estática del CSS), otros sistemas operativos.
- CI remoto NO consultado. El test intermitente de Spec 10 («escena automática…») falló una vez en una corrida local y una vez en CI en una rama anterior; su causa no está demostrada. Las 8 repeticiones de hoy pasaron, lo que no demuestra que esté resuelto. No se tocó.
- Prueba ajena modificada: ninguna.
