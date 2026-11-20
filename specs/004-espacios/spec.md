# Espacios culturales · Spec 04

## Historias y aceptación

**US1 · Encontrar una sede (P1).** Dado el catálogo demo, cuando busco por parte del nombre o la dirección, entonces veo las sedes coincidentes y puedo abrir su ficha con teclado. Dada una consulta sin coincidencias, cuando borro la búsqueda, entonces recupero el directorio completo.

**US2 · Consultar una visita (P1).** Dada una sede, cuando abro su ficha, entonces veo su descripción, ilustración local, dirección y condiciones de acceso identificadas como demo. Dadas actividades de varias sedes, cuando consulto esa ficha, entonces veo exclusivamente las suyas en orden cronológico y hora de Loja. Si carece de actividades, veo un aviso.

**US3 · Recuperar la consulta (P2).** Dada una lectura pendiente, cuando visito el directorio, entonces veo el estado de carga. Dado un fallo, cuando reintento, entonces obtengo el catálogo actualizado o su estado vacío.

## Requisitos

- R1. Buscar sedes por nombre o dirección.
- R2. Ofrecer una ficha por sede con todos los datos de US2 y advertir que las condiciones reales requieren confirmación.
- R3. Asociar actividades por identidad de sede y ordenarlas por inicio.
- R4. Distinguir carga, fallo recuperable, directorio vacío, búsqueda vacía y sede sin actividades.
- R5. Permitir búsqueda y apertura por teclado y en móvil.

## Criterios de éxito

Las cinco sedes del catálogo demo aparecen al iniciar. La búsqueda por «Telón» devuelve Teatro del Sur. El 100 % de las actividades mostradas pertenece a la sede abierta. A 375 píxeles se puede abrir la ficha sin desplazamiento horizontal.

## Supuestos

La edición comparte un único catálogo. La visita se planifica con información demo, sin mapas ni geolocalización.
