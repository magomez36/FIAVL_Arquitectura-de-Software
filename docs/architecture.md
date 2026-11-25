# Arquitectura de FIAVL Explora · Modelo 4+1

**Implementación modelada** `ff11546da61896fc7f6d363f63ebb793aed2f3ea` de `main`, con las diez especificaciones integradas.

FIAVL Explora emplea arquitectura en capas dentro de un modelo cliente-servidor. React y los adaptadores HTTP componen la presentación. Los servicios de catálogo, reservas y feedback aplican las reglas de negocio. Los repositorios acceden a SQLite embebido en Node.js. Web y API comparten contratos Zod mediante npm workspaces e intercambian JSON por HTTP. [ADR](adr.md), [contratos](contracts.md), [constitución](../.specify/memory/constitution.md).

| Vista | Alcance | Diagramas |
|---|---|---:|
| [01 Lógica](architecture/01-vista-logica.md) | Dominio, relaciones, DTO y datos del navegador | 1 |
| [02 Desarrollo](architecture/02-vista-desarrollo.md) | Responsabilidades de componentes, paquetes y dependencias | 2 |
| [03 Procesos](architecture/03-vista-procesos/README.md) | 22 secuencias funcionales, 1 técnica de concurrencia y 5 actividades | 28 |
| [04 Física](architecture/04-vista-fisica.md) | Despliegue local, Vite, Express, SQLite y arranque | 1 |
| [05 Escenarios (+1)](architecture/05-vista-escenarios.md) | Dos roles, límite del sistema y catálogo de 22 objetivos | 1 |
| | **Total** | **33** |

- [Matriz definitiva de trazabilidad](architecture/06-matriz-trazabilidad.md).
- [Análisis de base](architecture/analysis/01-inventario-arquitectonico.md), [actores y casos detallados](architecture/analysis/02-actores-y-casos-de-uso.md), [base de trazabilidad](architecture/analysis/03-matriz-trazabilidad.md), [inventario de diagramas y rutas](architecture/analysis/04-inventario-diagramas.md) y [hallazgos](architecture/analysis/05-hallazgos-y-limitaciones.md).
- [Documento académico en Markdown](architecture/academico/FIAVL_Arquitectura_4plus1.md) y [PDF académico](architecture/academico/FIAVL_Arquitectura_4plus1.pdf).
- [Originales Mermaid](architecture/diagrams), [diagramas SVG](architecture/rendered/svg) y [respaldo PNG](architecture/rendered/png).
- [Validación documental y reproducción del render](architecture/validation.md).

La [arquitectura preliminar](https://github.com/magomez36/FIAVL_Arquitectura-de-Software/blob/ff11546da61896fc7f6d363f63ebb793aed2f3ea/docs/architecture.md) se conserva en el historial del repositorio. El [modelo de vistas de Philippe Kruchten](https://arxiv.org/abs/2006.04975) organiza la documentación actual.
