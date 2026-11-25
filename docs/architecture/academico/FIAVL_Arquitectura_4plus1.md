# FIAVL Explora

## Arquitectura de software con el modelo 4+1

**Asignatura:** Arquitectura de Software<br/>

**Integrantes:** <br/>

- Valentina Samaniego
- Davide Manotoa
- Manuel Gomez

**Implementación de referencia** `ff11546da61896fc7f6d363f63ebb793aed2f3ea`

## Índice

1. [Introducción](#1-introducción)
2. [Estilo arquitectónico](#2-estilo-arquitectónico)
3. [Modelo arquitectónico 4+1](#3-modelo-arquitectónico-41)
4. [Vista lógica](#4-vista-lógica)
5. [Vista de desarrollo](#5-vista-de-desarrollo)
6. [Vista de procesos](#6-vista-de-procesos)
7. [Vista física](#7-vista-física)
8. [Vista de escenarios (+1)](#8-vista-de-escenarios-1)
9. [Matriz de trazabilidad](#9-matriz-de-trazabilidad)
10. [Conclusiones](#10-conclusiones)
11. [Referencias bibliográficas](#11-referencias-bibliográficas)

## 1. Introducción

FIAVL Explora es un prototipo académico para consultar una edición demostrativa del Festival Internacional de Artes Vivas de Loja. Permite explorar su programación, organizar una agenda, solicitar plazas demo y compartir opiniones. Este documento presenta la arquitectura de las diez especificaciones integradas.

## 2. Estilo arquitectónico

La aplicación emplea un modelo cliente-servidor y tres capas lógicas. La **presentación** incluye React y los adaptadores HTTP. La **lógica de negocio** aplica las reglas de validación, catálogo, reservas y opiniones. El **acceso a datos** encapsula las consultas a SQLite mediante repositorios. React y Express intercambian JSON mediante una API REST y comparten contratos Zod. SQLite se ejecuta dentro del proceso Node.js. [Decisión arquitectónica](../../adr.md).

## 3. Modelo arquitectónico 4+1

La vista lógica explica los datos y sus relaciones. Desarrollo describe las dependencias y la organización del código. Procesos muestra las interacciones y decisiones en ejecución. Física sitúa los procesos y la persistencia en el entorno local. Los escenarios vinculan estas vistas con los objetivos de los actores.

## 4. Vista lógica

### 4.1. LOG-01 · Dominio y estructuras relevantes

Cada evento se presenta en una sede y relaciona artistas mediante créditos. Una reserva pertenece a un evento. Las valoraciones son independientes. La figura también distingue los datos del navegador de los persistidos en SQLite.

![LOG-01 · Dominio y estructuras relevantes](../rendered/png/LOG-01.png)

## 5. Vista de desarrollo

### 5.1. DES-01 · Componentes y responsabilidades

Muestra las llamadas entre la web, la API, los servicios y los repositorios. La aplicación importa los esquemas Zod como biblioteca.

![DES-01 · Componentes y responsabilidades](../rendered/png/DES-01.png)

### 5.2. DES-02 · Paquetes y dependencias estáticas

Ubica los workspaces, sus módulos y las dependencias estáticas del código.

![DES-02 · Paquetes y dependencias estáticas](../rendered/png/DES-02.png)

## 6. Vista de procesos

Las secuencias distinguen la comunicación HTTP de las operaciones locales. La secuencia de concurrencia y las actividades detallan las decisiones que afectan a la persistencia o a la recuperación de errores.

### 6.1. CU-01 · Descubrir la edición demo

La portada presenta la edición, consulta una selección del catálogo y permite acceder a las secciones.

![CU-01 · Descubrir la edición demo](../rendered/png/CU-01.png)

### 6.2. CU-02 · Consultar el catálogo mediante la API pública

El integrante consulta listas o fichas por ID mediante la API. El catálogo devuelve datos o errores de validación y búsqueda.

![CU-02 · Consultar el catálogo mediante la API pública](../rendered/png/CU-02.png)

### 6.3. CU-03 · Explorar la programación cultural

Agenda carga el catálogo desde la API y aplica los filtros en el navegador.

![CU-03 · Explorar la programación cultural](../rendered/png/CU-03.png)

### 6.4. CU-04 · Consultar el detalle de un evento

El visitante abre la ficha a partir de los datos precargados de eventos, sedes y artistas.

![CU-04 · Consultar el detalle de un evento](../rendered/png/CU-04.png)

### 6.5. CU-05 · Explorar el catálogo de artistas

La página consulta el catálogo de artistas y filtra por nombre, país y disciplina.

![CU-05 · Explorar el catálogo de artistas](../rendered/png/CU-05.png)

### 6.6. CU-06 · Consultar la trayectoria y actuaciones de un artista

La ficha usa los datos cargados para mostrar la biografía y relacionar al artista con sus actuaciones.

![CU-06 · Consultar la trayectoria y actuaciones de un artista](../rendered/png/CU-06.png)

### 6.7. CU-07 · Encontrar una sede en el directorio demo

El directorio lee las sedes y aplica la búsqueda por nombre o dirección en el navegador.

![CU-07 · Encontrar una sede en el directorio demo](../rendered/png/CU-07.png)

### 6.8. CU-08 · Consultar una sede demo y sus actividades

La ficha muestra los datos de la sede y vincula los eventos a partir del catálogo cargado.

![CU-08 · Consultar una sede demo y sus actividades](../rendered/png/CU-08.png)

### 6.9. CU-09 · Armar mi agenda personal

El visitante agrega o quita eventos. La página mantiene la selección en memoria y, si es posible, la guarda localmente.

![CU-09 · Armar mi agenda personal](../rendered/png/CU-09.png)

### 6.10. CU-10 · Revisar mi programa y sus solapamientos

La página recupera los IDs guardados, resuelve el catálogo y avisa de los horarios que se solapan.

![CU-10 · Revisar mi programa y sus solapamientos](../rendered/png/CU-10.png)

### 6.11. CU-11 · Consultar plazas disponibles

Reservas combina los eventos con su disponibilidad. El servidor calcula las plazas restantes a partir de las reservas activas.

![CU-11 · Consultar plazas disponibles](../rendered/png/CU-11.png)

### 6.12. CU-12 · Reservar plazas demostrativas

El servicio valida el aforo y confirma la reserva en una transacción SQLite. El navegador muestra y guarda la referencia.

![CU-12 · Reservar plazas demostrativas](../rendered/png/CU-12.png)

### 6.13. CU-13 · Consultar mis reservas por referencia

La página consulta por HTTP el estado de las referencias guardadas. Puede quitar referencias obsoletas de la lista local.

![CU-13 · Consultar mis reservas por referencia](../rendered/png/CU-13.png)

### 6.14. CU-14 · Cancelar una reserva mediante referencia

El servicio localiza la reserva por su referencia y cancela de forma idempotente. La página consulta el saldo actualizado.

![CU-14 · Cancelar una reserva mediante referencia](../rendered/png/CU-14.png)

### 6.15. CU-15 · Explorar un recorrido cultural

La página combina el catálogo de sedes con itinerarios editoriales. El visitante cambia de recorrido o avanza entre paradas.

![CU-15 · Explorar un recorrido cultural](../rendered/png/CU-15.png)

### 6.16. CU-16 · Explorar la galería por categorías

La galería reúne sedes y recursos locales. El visitante filtra la colección y consulta sus créditos.

![CU-16 · Explorar la galería por categorías](../rendered/png/CU-16.png)

### 6.17. CU-17 · Ampliar y recorrer imágenes de la galería

El diálogo muestra la imagen ampliada, permite recorrer sus vecinos y devuelve el foco al cerrarse.

![CU-17 · Ampliar y recorrer imágenes de la galería](../rendered/png/CU-17.png)

### 6.18. CU-18 · Consultar condiciones demo de acceso a sedes

La guía consulta las sedes y filtra las condiciones de acceso y direcciones del catálogo demo.

![CU-18 · Consultar condiciones demo de acceso a sedes](../rendered/png/CU-18.png)

### 6.19. CU-19 · Personalizar la lectura de la guía

Los ajustes de tamaño y contraste se aplican en la guía. El navegador intenta conservarlos entre visitas.

![CU-19 · Personalizar la lectura de la guía](../rendered/png/CU-19.png)

### 6.20. CU-20 · Consultar la guía editorial del FIAVL 2026

La guía presenta obras, horarios y sedes a partir de fichas editoriales incluidas en la web.

![CU-20 · Consultar la guía editorial del FIAVL 2026](../rendered/png/CU-20.png)

### 6.21. CU-21 · Enviar una valoración sobre la experiencia

El formulario y el servicio validan la valoración. La API devuelve el recibo después de registrar la respuesta.

![CU-21 · Enviar una valoración sobre la experiencia](../rendered/png/CU-21.png)

### 6.22. CU-22 · Consultar el resumen de valoraciones

El servicio agrega las respuestas de SQLite. La página presenta el total, la distribución y el promedio.

![CU-22 · Consultar el resumen de valoraciones](../rendered/png/CU-22.png)

### 6.23. TEC-01 · Contención por el mismo aforo

Dos solicitudes compiten por el mismo aforo. Cada transacción adquiere el bloqueo de escritura antes de volver a comprobar las plazas.

![TEC-01 · Contención por el mismo aforo](../rendered/png/TEC-01.png)

### 6.24. ACTV-01 · Planificar la agenda y detectar conflictos

La agenda resuelve eventos guardados, detecta conflictos y avisa si falla la persistencia local.

![ACTV-01 · Planificar la agenda y detectar conflictos](../rendered/png/ACTV-01.png)

### 6.25. ACTV-02 · Validar y confirmar una reserva

La creación valida los datos, comprueba el saldo dentro de la transacción y confirma o revierte la escritura.

![ACTV-02 · Validar y confirmar una reserva](../rendered/png/ACTV-02.png)

### 6.26. ACTV-03 · Cancelar una reserva de forma idempotente

La cancelación cambia el estado de una reserva activa. Las solicitudes repetidas conservan el resultado anterior.

![ACTV-03 · Cancelar una reserva de forma idempotente](../rendered/png/ACTV-03.png)

### 6.27. ACTV-04 · Restaurar y ajustar preferencias de lectura

Los ajustes pueden restaurarse o cambiarse. Si falla el guardado, el ajuste se aplica durante la visita actual.

![ACTV-04 · Restaurar y ajustar preferencias de lectura](../rendered/png/ACTV-04.png)

### 6.28. ACTV-05 · Validar y confirmar una valoración

El envío distingue validación, escritura y confirmación de la respuesta.

![ACTV-05 · Validar y confirmar una valoración](../rendered/png/ACTV-05.png)

## 7. Vista física

### 7.1. FIS-01 · Despliegue local documentado

En el equipo anfitrión, Vite escucha en el puerto 5173 y redirige /api a Express en el puerto 3001. El backend accede al archivo SQLite local.

![FIS-01 · Despliegue local documentado](../rendered/png/FIS-01.png)

## 8. Vista de escenarios (+1)

- **ACT-01 · Visitante** usa la interfaz web para explorar la edición y realizar acciones personales.
- **ACT-02 · Integrante técnico** consulta la API pública para verificar los datos del catálogo.

### 8.1. ESC-01 · Casos de uso de FIAVL Explora

El límite de FIAVL Explora agrupa los objetivos de los actores. Cada línea identifica quién participa en el caso de uso correspondiente.

![ESC-01 · Casos de uso de FIAVL Explora](../rendered/png/ESC-01.png)

### 8.2. Tabla de casos de uso

| Código | Caso de uso | Actor | Spec |
|---|---|---|---|
| CU-01 | Descubrir la edición demo | ACT-01 | 1 |
| CU-02 | Consultar el catálogo mediante la API pública | ACT-02 | 1 |
| CU-03 | Explorar la programación cultural | ACT-01 | 2 |
| CU-04 | Consultar el detalle de un evento | ACT-01 | 2 |
| CU-05 | Explorar el catálogo de artistas | ACT-01 | 3 |
| CU-06 | Consultar la trayectoria y actuaciones de un artista | ACT-01 | 3 |
| CU-07 | Encontrar una sede en el directorio demo | ACT-01 | 4 |
| CU-08 | Consultar una sede demo y sus actividades | ACT-01 | 4 |
| CU-09 | Armar mi agenda personal | ACT-01 | 5 |
| CU-10 | Revisar mi programa y sus solapamientos | ACT-01 | 5 |
| CU-11 | Consultar plazas disponibles | ACT-01 | 6 |
| CU-12 | Reservar plazas demostrativas | ACT-01 | 6 |
| CU-13 | Consultar mis reservas por referencia | ACT-01 | 6 |
| CU-14 | Cancelar una reserva mediante referencia | ACT-01 | 6 |
| CU-15 | Explorar un recorrido cultural | ACT-01 | 7 |
| CU-16 | Explorar la galería por categorías | ACT-01 | 8 |
| CU-17 | Ampliar y recorrer imágenes de la galería | ACT-01 | 8 |
| CU-18 | Consultar condiciones demo de acceso a sedes | ACT-01 | 9 |
| CU-19 | Personalizar la lectura de la guía | ACT-01 | 9 |
| CU-20 | Consultar la guía editorial del FIAVL 2026 | ACT-01 | 10 |
| CU-21 | Enviar una valoración sobre la experiencia | ACT-01 | 10 |
| CU-22 | Consultar el resumen de valoraciones | ACT-01 | 10 |

## 9. Matriz de trazabilidad

| Spec | Casos de uso | Diagramas de proceso |
|---|---|---|
| 1 · Base | CU-01, CU-02 | CU-01, CU-02 |
| 2 · Agenda | CU-03, CU-04 | CU-03, CU-04 |
| 3 · Artistas | CU-05, CU-06 | CU-05, CU-06 |
| 4 · Espacios | CU-07, CU-08 | CU-07, CU-08 |
| 5 · Mi agenda | CU-09, CU-10 | CU-09, CU-10, ACTV-01 |
| 6 · Reservas | CU-11 a CU-14 | CU-11 a CU-14, TEC-01, ACTV-02, ACTV-03 |
| 7 · Recorridos | CU-15 | CU-15 |
| 8 · Galería | CU-16, CU-17 | CU-16, CU-17 |
| 9 · Accesibilidad | CU-18, CU-19 | CU-18, CU-19, ACTV-04 |
| 10 · Opiniones | CU-20 a CU-22, CU-01 para la portada transversal | CU-20 a CU-22, CU-01, ACTV-05 |

LOG-01, DES-01, DES-02 y FIS-01 representan la estructura compartida. ESC-01 reúne los 22 casos de uso. La [matriz del repositorio](../06-matriz-trazabilidad.md) vincula los requisitos con los archivos y pruebas.

## 10. Conclusiones

La separación en capas concentra las reglas de aforo y opiniones en el backend. El navegador gestiona la navegación y las preferencias locales. Los escenarios vinculan estas responsabilidades con los datos, las transacciones y el despliegue comprobables en el repositorio.

## 11. Referencias bibliográficas

- Kruchten, P. (1995). «The 4+1 View Model of Architecture». IEEE Software, 12(6), 42–50. [Texto del autor](https://arxiv.org/abs/2006.04975).
- Mermaid. [Referencia de sintaxis](https://mermaid.js.org/intro/syntax-reference.html).
- FIAVL Explora. [Implementación de referencia](https://github.com/magomez36/FIAVL_Arquitectura-de-Software/tree/ff11546da61896fc7f6d363f63ebb793aed2f3ea), [decisiones arquitectónicas](../../adr.md) y [contratos](../../contracts.md).
