# ACTV-04 · Restaurar y ajustar preferencias de lectura

**Casos** CU-19. Expone la recuperación de datos fuera de esquema, el restablecimiento y la posibilidad de aplicar un ajuste que no se pudo guardar.

<!-- diagram: ACTV-04 -->

```mermaid
flowchart TD
  I([Inicio]) --> R["Leer localStorage al abrir la guía"]
  R --> J{"¿Valor recuperado?"}
  J -->|Esquema válido| P["Aplicar y anunciar restauración"]
  J -->|JSON legible, esquema inválido| C["Aplicar predeterminados y avisar corrupción"]
  J -->|Ausente, no parseable o bloqueado| N["Aplicar predeterminados"]
  P --> E{"¿Acción en controles?"}
  C --> E
  N --> E
  E -->|Cambiar tamaño o contraste| A["Aplicar opción en data-*"]
  E -->|Restablecer habilitado| B["Aplicar tamaño y contraste predeterminados"]
  E -->|Salir| F([Fin])
  A --> W["Intentar guardar objeto versión 1"]
  B --> W
  W --> S{"¿Escritura correcta?"}
  S -->|Sí| O["Anunciar cambio y retirar aviso de corrupción"] --> E
  S -->|No| G["Anunciar bloqueo y mantener aviso previo si existe"] --> E
  classDef accent fill:#F5EDE0,stroke:#591C37,color:#302237
  class I,F,J,E,S accent
```

Las salidas de los rombos llevan condiciones y los nodos redondeados delimitan el inicio y el fin de la actividad. [apps/web/src/features/accesibilidad/index.tsx](../../../../apps/web/src/features/accesibilidad/index.tsx), [apps/web/src/lib/storage.ts](../../../../apps/web/src/lib/storage.ts), [tests/e2e/spec-09.spec.ts](../../../../tests/e2e/spec-09.spec.ts).
