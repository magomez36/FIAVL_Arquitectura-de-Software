# Datos y contrato previo

POST /api/feedback acepta un objeto estricto con rating entero 1–5 y comment opcional de hasta 500 unidades UTF-16. Tras validar se recortan espacios exteriores. El envío válido responde 201 con {"accepted":true}. Entrada o JSON inválido responde 400 INVALID_INPUT y exceso de 8 KiB responde 413 INVALID_INPUT.

GET /api/feedback/summary devuelve 200 con total entero, distribution como lista fija de cinco frecuencias (índices de 1 a 5 estrellas en ese orden) y average a un decimal o null. Ejemplo vacío: {"total":0,"distribution":[0,0,0,0,0],"average":null}. El resumen excluye identificadores y texto libre.

Tabla feedback con clave entera, rating obligatorio y comment anulable. Sin referencia a reservas ni datos de identidad.

## Modelo editorial

festival2026.ts conserva obras (título, artista, día y horas locales, sede, fuente) y espacios (nombre, contexto y referencia). No usa IDs demo ni datos de aforo o reserva. La fotografía documental mantiene su autor, licencia y fecha de archivo en el pie visible. Los detalles curatoriales y discrepancias se registran en research.md.
