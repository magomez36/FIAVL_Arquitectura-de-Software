# CU-19 · Personalizar la lectura de la guía

**Actor** Visitante (ACT-01). **Spec** 9. Ajustar y conservar tamaño y contraste o recuperar los valores predeterminados.

<!-- diagram: CU-19 -->

```mermaid
---
config:
  theme: neutral
---
sequenceDiagram
actor V as Visitante
participant U as Guía de accesibilidad
participant H as readLocal y writeLocal
participant L as localStorage
participant C as CSS de la guía
V->>U: Abrir la guía
U->>H: restore · readLocal(accessibility)
H->>L: getItem
alt JSON válido y esquema correcto
  H-->>U: Preferencias restauradas
else JSON legible fuera de esquema
  H-->>U: undefined, marcar corrupción
  U-->>V: Usar predeterminados con aviso
else Sin valor, JSON no parseable o lectura bloqueada
  H-->>U: undefined, aplicar predeterminados
end
loop Ajustar texto, contraste o restablecer
  V->>U: Elegir una opción
  U->>C: Aplicar data-text-size y data-contrast
  U->>H: writeLocal con objeto versión 1
  H->>L: setItem
  alt Escritura correcta
    H-->>U: true
    U-->>V: Anunciar cambio y retirar aviso de corrupción
  else Escritura bloqueada
    H-->>U: false
    U-->>V: Avisar que se aplica solo en la vista actual
  end
end
```

El objetivo se completa con datos o estado del navegador. `fiavl:accessibility:v1`, `{version:1,textSize,contrast}`.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
