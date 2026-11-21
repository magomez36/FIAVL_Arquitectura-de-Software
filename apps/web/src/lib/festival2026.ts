/** Selección editorial contrastada el 20 de noviembre de 2026. Fuentes en el research del Spec 10. */
export const links = {
  festival: 'https://festivaldeloja.com/',
  program: 'https://cultura.ec/festival/artes-vivas-loja',
  free: 'https://cultura.ec/festival/artes-vivas-loja/entrada-libre'
} as const;

export const shows = [
  {
    title: 'Técnicos',
    date: '20 nov · 20:00',
    venue: 'Teatro Benjamín Carrión Mora',
    artist: 'Colectivo Independiente Técnicos de Cuenca',
    source: 'https://cultura.ec/evento/tecnicos'
  },
  {
    title: 'Monàs, la real sustancia de las cosas',
    date: '21 nov · 11:00 y 18:00',
    venue: 'Centro Cultural Alfredo Mora Reyes',
    artist: 'Teatringestazione',
    source: 'https://cultura.ec/evento/monas-la-verdadera-esencia-de-las-cosas'
  },
  {
    title: 'Monólogo La Escoba',
    date: '21 nov · 18:00',
    venue: 'Teatro Bolívar',
    artist: 'Juana Estrella',
    source: 'https://cultura.ec/evento/monologo-de-la-escoba'
  },
  {
    title: 'Nada era un misterio: El enigmático caso de la Continental Company',
    date: '22 nov · 11:00 y 19:00',
    venue: 'Teatro Benjamín Carrión Mora',
    artist: 'La Mona Ilustre',
    source: 'https://cultura.ec/evento/nada-era-un-misterio-el-enigmatico-caso-manana'
  }
] as const;

export const venues = [
  {
    name: 'Teatro Benjamín Carrión Mora',
    context: 'Aquí, los técnicos de iluminación, sonido y tramoya de Cuenca suben a escena para contar su oficio.',
    source: 'https://cultura.ec/evento/tecnicos'
  },
  {
    name: 'Teatro Bolívar',
    context: 'El teatro y su antigua casona forman parte del Centro Cultural Bernardo Valdivieso.',
    source: 'https://www.loja.gob.ec/noticia/2018-02/se-habilitan-mas-espacios-culturales-en-el-teatro-bolivar'
  },
  {
    name: 'Teatro Segundo Cueva Celi',
    context: 'El 20 de noviembre, Títeres Rompekabezas lleva a esta sala El fruto del amor.',
    source: 'https://cultura.ec/evento/el-fruto-del-amor'
  },
  {
    name: 'Centro Cultural Alfredo Mora Reyes',
    context: 'En Monàs, la compañía italiana Teatringestazione invita al público a moverse por un dispositivo escénico.',
    source: 'https://cultura.ec/evento/monas-la-verdadera-esencia-de-las-cosas'
  },
  {
    name: 'Museo de Loja',
    context: 'La exposición Buddy Bears acerca las artes visuales al festival en el Museo y Centro Cultural de Loja.',
    source: 'https://cultura.ec/evento/buddy-bears'
  }
] as const;
