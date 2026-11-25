# TEC-01 · Contención por el mismo aforo

Escenario técnico complementario de [CU-12](CU-12-reservar-plazas.md). Las referencias «Cliente A» y «Cliente B» son dos instancias del mismo rol Visitante.

<!-- diagram: TEC-01 -->

```mermaid
---
config:
  theme: neutral
  sequence:
    height: 96
    width: 145
---
sequenceDiagram
actor A as Cliente A
actor B as Cliente B
participant H as Express y servicio
participant R as Repositorio de reservas
participant D as SQLite
Note over A,B: Ambos solicitan 2 de las mismas 3 plazas visibles
par Solicitud de A
  A-)H: POST /api/reservations · eventId y quantity=2
and Solicitud de B
  B-)H: POST /api/reservations · mismo eventId y quantity=2
end
Note over H,R: Ejemplo: A se ejecuta primero. Cada handler usa llamadas síncronas
H->>H: Validar cantidad e ID de A
H->>R: atomically para A
R->>D: BEGIN IMMEDIATE
R->>D: Leer evento reservable, capacidad y SUM activas
D-->>R: Saldo 3
alt Inserción confirmada
  R->>D: INSERT activo de 2 plazas con hash
  R->>D: COMMIT
  H-->>A: HTTP 201, saldo 1
  H->>H: Validar cantidad e ID de B
  H->>R: atomically para B
  R->>D: BEGIN IMMEDIATE tras liberar el anterior
  R->>D: Releer evento y SUM activas
  D-->>R: Saldo 1
  R->>D: COMMIT sin INSERT
  H-->>B: HTTP 409, saldo insuficiente
else Excepción dentro de la transacción de A
  R->>D: ROLLBACK
  H-->>A: HTTP 500
  Note over H,D: B decide con saldo vigente al adquirir su turno
end
Note over R,D: En conexiones independientes al mismo archivo, SQLite serializa escrituras antes de leer el saldo
```

En el proceso habitual, los handlers y `DatabaseSync` ejecutan sus llamadas de forma síncrona. Dos solicitudes pueden llegar de forma concurrente, aunque sus operaciones de SQLite no se intercalan dentro de un mismo hilo. Con conexiones independientes al mismo archivo, `BEGIN IMMEDIATE` adquiere el bloqueo de escritura antes de leer el saldo. El `busy_timeout` está configurado en 5000 ms. Si falla el propio `BEGIN`, la excepción se propaga sin ejecutar rollback. Si falla una operación tras iniciarlo, el repositorio revierte y propaga la excepción. El middleware común responde 500 ante un fallo inesperado. Una consulta previa de disponibilidad es una instantánea. [Configuración de SQLite](../../../../apps/api/src/db.ts), [repositorio](../../../../apps/api/src/repositories/reservations.ts), [pruebas de una y dos conexiones](../../../../tests/reservations.test.ts).

La prueba versionada usa dos solicitudes en una conexión y seis solicitudes sobre dos plazas repartidas entre dos conexiones. Sus servidores de prueba conviven en un proceso Node.js. El diagrama expone la llegada concurrente y la regla de consistencia que se usa también entre conexiones. [Prueba de concurrencia](../../../../tests/reservations.test.ts).
