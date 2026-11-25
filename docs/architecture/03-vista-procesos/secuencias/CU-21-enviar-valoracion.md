# CU-21 · Enviar una valoración sobre la experiencia

**Actor** Visitante (ACT-01). **Spec** 10. Compartir una puntuación y un comentario opcional y recibir confirmación.

<!-- diagram: CU-21 -->

```mermaid
---
config:
  theme: neutral
---
sequenceDiagram
actor V as Visitante
participant U as Formulario Opiniones
participant A as Router de feedback
participant S as Servicio de feedback
participant R as Repositorio de feedback
participant D as SQLite
V->>U: Enviar puntuación y comentario opcional
U->>U: feedbackInputSchema.safeParse
alt Entrada inválida
  U-->>V: Solicitar corrección
else Entrada válida
  U-)A: POST /api/feedback con JSON
  A->>A: Analizar JSON hasta 8 KiB
  alt Malformado o demasiado grande
    A-->>U: 400 o 413
  else Cuerpo procesado
    A->>S: submit(body)
    S->>S: Validar puntuación y comentario
    alt No cumple el esquema
      S-->>A: false
      A-->>U: 400 INVALID_INPUT
    else Entrada válida
      S->>R: insert(input)
      R->>D: INSERT rating y comment o NULL
      D-->>R: Inserción efectiva o excepción
      R-->>S: Retorno o propagación de error
      A-->>U: 201 accepted o 500
    end
  end
  alt Recibo 201 válido
    U-->>V: Mostrar confirmación
    U->>U: Incrementar revision para que Summary recargue
  else Fallo HTTP, de red o de recibo
    U-->>V: Mostrar aviso de reintento
  end
end
```

SQLite feedback. Estado del formulario en memoria.

[Catálogo detallado](../../analysis/02-actores-y-casos-de-uso.md) · [Vista de procesos](../README.md).
