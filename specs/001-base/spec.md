# Feature Specification: Base de FIAVL Explora

Rama `feature/spec-1` · 2026-11-19 · Prioridad de entrega P0 · Responsable Manuel.
Objetivo: abrir al público una edición demostrativa de las artes vivas de Loja y dar al equipo una base verificable para ampliarla.

## User Scenarios & Testing

### User Story 1 – Consultar el catálogo (P1)

Un integrante necesita consultar información consistente para presentar la programación. Prueba independiente: comparar listas y fichas con el inventario de la edición.

1. Dado el catálogo inicial, cuando consulto eventos, artistas y espacios, entonces obtengo 12, 6 y 5 fichas con identidades estables y relaciones resolubles.
2. Dada una ficha conocida, cuando consulto su identidad, entonces recibo el mismo contenido que en la lista. Dada una identidad desconocida, cuando la consulto, entonces recibo un error identificable.
3. Dada la edición instalada, cuando vuelvo a cargar los datos de demostración y reinicio, entonces conservo los identificadores, cantidades y relaciones originales.

### User Story 2 – Descubrir la edición (P1)

Una visitante necesita reconocer la edición, consultar una selección y distinguir qué secciones puede utilizar. Prueba independiente: abrir la portada y recorrer el menú con teclado.

1. Dado cualquier día del año, cuando abro el inicio, entonces veo el carácter no oficial, los datos demo, las fechas del 12 al 22 de noviembre de 2026 y una selección de la programación.
2. Dada una sección pendiente, cuando consulto el menú o entro por su dirección directa, entonces identifico su disponibilidad y puedo regresar al inicio. Dada una sección que su responsable ya activó, cuando la abro, entonces veo su contenido y el resto de las secciones conserva su estado.
3. Dado un catálogo lento, vacío o temporalmente inaccesible, cuando abro la portada, entonces distingo la espera, ausencia de eventos o error y puedo reintentar tras un fallo.

### User Story 3 – Integrar una contribución (P2)

Un integrante necesita instalar la base desde cero y conocer su área antes de aportar una página. Prueba independiente: seguir la guía desde una copia limpia y localizar la entrada de cada sección.

1. Dada una copia limpia, cuando sigo la guía sin credenciales, entonces verifico salud, catálogo y portada.
2. Dados los responsables de reservas y opiniones, cuando localizan sus entradas, entonces cada uno encuentra un archivo propio y una operación pendiente se comunica como indisponible.

### Edge Cases

Los eventos simultáneos siguen siendo distintos. Un evento gratuito puede requerir reserva.
La edición conserva sus fechas aun después del festival. Un fallo de lectura se distingue
de una lista vacía y los datos de navegador de distintas funciones usan espacios independientes.

## Requirements

### Functional Requirements

- FR-001. Exponer salud y lectura por lista e identidad de los tres tipos de ficha, con errores uniformes.
- FR-002. Conservar un inventario persistente de 12 eventos, 6 artistas y 5 sedes, con horarios de Loja, solapamiento, reserva opcional según evento y al menos un evento reservable con 1–3 plazas.
- FR-003. Mostrar una portada en español con identidad visual original, selección real, estados de carga, error y vacío, y señalización de edición demo no oficial.
- FR-004. Mantener navegación común por teclado y acceso directo a las nueve secciones. Identificar las pendientes y permitir que cada sección muestre su contenido al activarse de forma independiente.
- FR-005. Separar las contribuciones por sección, las preferencias locales y los futuros servicios de reservas y opiniones.
- FR-006. Entregar guía de instalación, contratos con ejemplos, decisiones, vistas de arquitectura, propiedad, plan de integración y comprobaciones automatizadas reproducibles.

### Key Entities

Evento describe una actividad con horario, precio, cupo, artistas y sede. Artista describe nombre, país, disciplina y trayectoria. Sede identifica dirección, descripción y accesibilidad. Cada ficha incluye una imagen local.

## Success Criteria

### Measurable Outcomes

- SC-001. Las 23 fichas se pueden recuperar individualmente y dos cargas consecutivas conservan el inventario.
- SC-002. Una visitante alcanza la programación desde la portada con teclado y reconoce la disponibilidad de las nueve secciones.
- SC-003. Una instalación limpia permite verificar la portada y sus datos sin cuentas ni configuración propia de un equipo.

## Assumptions

La selección de portada muestra los primeros tres eventos en orden cronológico. La moneda es USD.
Las operaciones transaccionales y las páginas funcionales 2–10 corresponden a entregas posteriores.

## Ampliación de US3 · incorporación con un comando

1. Dado Windows con Git y acceso a internet, cuando ejecuto fiavl.cmd en una copia limpia, entonces puedo abrir la portada sin instalar servicios ni modificar herramientas globales.
2. Dado un entorno preparado, cuando repito setup, entonces conservo configuración y datos y reutilizo las dependencias. Si cambia el lockfile o el entorno, se reinstalan.
3. Dado un puerto ocupado o una descarga fallida, cuando inicio la aplicación, entonces recibo un diagnóstico y código de fallo; puedo reintentar y los procesos existentes continúan.

- FR-007. Resolver las versiones exactas del manifiesto, verificar el archivo oficial de Node y aislar el entorno en el perfil del usuario.
- FR-008. Ofrecer inicio, setup, check con Chromium y shell, con los mismos comandos npm del equipo.
- FR-009. Conservar datos, preferencias locales y límites de integración; documentar la configuración y los prerrequisitos de SDD por separado.
- SC-004. Una copia limpia inicia con un comando y una segunda preparación omite npm ci. Verificar los modos y registrar los escenarios A–K.
