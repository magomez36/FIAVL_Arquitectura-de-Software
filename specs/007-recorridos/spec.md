# Recorridos culturales · Spec 07

## Historias y aceptación

### US1 · Elegir y explorar un recorrido (P1)

Dado el catálogo de la edición, cuando elijo un recorrido, entonces leo su propósito y sus paradas en orden editorial desde la primera. Cuando avanzo o retrocedo con teclado, entonces veo nombre, ilustración, descripción, dirección demo y notas de acceso de la sede correspondiente. Al cambiar de recorrido comienzo por su primera parada.

### US2 · Consultar un catálogo incompleto (P1)

Dado que falta una sede, cuando consulto su parada, entonces conservo su posición, leo un aviso y puedo continuar a la siguiente. Dado un catálogo vacío, cuando abro la sección, entonces veo un aviso de ausencia de sedes.

### US3 · Recuperar una lectura (P2)

Dada una consulta pendiente, cuando abro la página, entonces veo la carga. Dado un fallo de lectura, cuando reintento con el catálogo disponible, entonces puedo consultar las paradas.

## Requisitos

- R1. Ofrecer al menos dos recorridos temáticos con nombre, propósito y secuencia de sedes.
- R2. Mostrar los detalles publicados de la sede asociada a cada parada y señalar el carácter demo de direcciones y condiciones.
- R3. Permitir avanzar y retroceder dentro de los límites desde teclado o móvil y reiniciar la posición al cambiar la selección.
- R4. Distinguir sede ausente, catálogo vacío, carga y fallo recuperable.
- R5. Presentar una selección cultural independiente de Espacios, sin cálculo de trayectos, distancias o tiempos.

Entidades: recorrido editorial, parada ordenada y sede del catálogo.

## Éxito medible

Con el catálogo demo se pueden completar los dos recorridos y el 100 % de sus paradas coincide con la sede prevista. A 375 píxeles de ancho se puede leer cada ficha sin desplazamiento horizontal. Retirar una sede conserva la longitud y el orden del recorrido.

## Supuestos

La secuencia expresa una relación temática. El visitante confirma las condiciones de acceso reales con la sede.
