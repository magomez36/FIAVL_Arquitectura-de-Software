# La ciudad abre el telón

FIAVL Explora combina una entrada fotográfica oscura, cartelera marfil y señalización dorada. La marca del prototipo y la indicación «Prototipo no oficial» acompañan al menú. Usar Georgia para títulos y la sans del sistema para lectura y controles.

| Token CSS | Valor | Uso |
|---|---|---|
| --stage-night | #160E1C | Fondo de escenario y shell |
| --stage-wine | #591C37 | Acciones y panel editorial |
| --stage-curtain | #852D45 | Acento sobre marfil |
| --stage-gold | #E2B567 | Luz y CTA con texto noche |
| --stage-ivory | #F5EDE0 | Papel y texto sobre noche |
| --stage-ink | #302237 | Texto sobre claro |
| --stage-rose | #D97693 | Acento secundario sobre noche |
| --stage-surface | #FFF9F0 | Fichas |
| --stage-line | #D8C7B7 | Separadores |

Los alias --ink, --paper, --accent y --line mantienen los módulos anteriores. --stage-gap adapta el espaciado entre 18 y 38 px y --stage-radius define esquinas de 8 px.

## Componentes

StageSection agrupa contenido y admite className y atributos de sección. StageHeading presenta un h2; StageCard envuelve un article; StageBadge identifica la disciplina sobre una imagen. StageButton conserva atributos nativos, incluidos type y disabled. El carrusel de Home recibe agendaAvailable para elegir el destino de la programación.

```tsx
<StageSection aria-labelledby="programa">
  <StageHeading id="programa">En cartelera</StageHeading>
  <StageCard><StageBadge>Danza</StageBadge><h3>Umbral de luz</h3></StageCard>
</StageSection>
<StageButton type="submit" disabled={sending}>Enviar valoración</StageButton>
```

Usar StageBadge dentro de un contenedor posicionado, como .stage-art en Home. Para formularios, agrupar radios con fieldset y legend, enlazar label e input y conservar el contenido tras un fallo. Carga y vacío usan Status; los errores recuperables se anuncian como alerta y ofrecen una acción. El estado disabled bloquea la acción nativa. El indicador activo del carrusel usa aria-current y cambia de grosor y color. Mantener los contornos focus-visible al personalizar un control.

```css
.agenda-panel {
  background: var(--stage-surface);
  color: var(--stage-ink);
  padding: var(--stage-gap);
  border-radius: var(--stage-radius);
}
```

La entrada de luz dura 1,1 s, la lámina aparece en 480 ms y el cartel se eleva en 250 ms. Con movimiento reducido se desactivan las animaciones y el autoavance. La persona puede recorrer las escenas manualmente. El foco, el puntero, la pestaña oculta y la pausa manual suspenden el reloj. Las fotografías son ambientación; conservar el crédito junto a la escena y la ficha de licencia en [recursos](assets.md).

## Checklist para Specs 2, 3, 5, 6, 8 y 9

- Importar componentes desde components/Stage.tsx dentro de la entrada propia y consumir los tokens desde sus estilos locales.
- Conservar títulos, etiquetas, foco, estados de datos y comportamiento con teclado. Probar 375 y 1440 px y movimiento reducido.
- Consultar al responsable antes de editar el shell, los tokens o la API común. Mantener la prueba funcional en el archivo del spec.

En pantallas táctiles el carrusel también reconoce un desplazamiento horizontal desde el contenido. Los controles nativos siguen disponibles y el gesto vertical conserva el scroll. Contrastes de los pares sólidos: oro/noche 9,91:1; marfil/vino 10,98:1; tinta/superficie 14,23:1; telón/marfil 7,35:1.

## Guía cultural de Loja

FestivalProgram y FestivalVenues consumen una selección editorial fechada, independiente de los contratos HTTP. Reservar fotografías documentales para la sede identificada y conservar el pie con año, autor, obra y licencia. En fichas demo, rotular la fotografía genérica como «Ambientación». La lista de obras usa fecha y sede verificadas y enlaza a la ficha externa. Los bloques entran una vez al llegar al viewport y se leen desde el primer render con movimiento reducido.

En el carrusel la línea dorada representa el intervalo de siete segundos. La etiqueta explica si el foco, puntero o preferencia de movimiento ha suspendido la reproducción. Al salir del control comienza un intervalo completo. El aviso académico permanece en la cabecera del shell.
