import { idSchema } from '@fiavl/contracts';
import { z } from 'zod';

const recorridoSchema = z.object({
  name: z.string().min(1),
  purpose: z.string().min(1),
  stops: z.array(idSchema).min(1)
});

export const itinerarios = z.array(recorridoSchema).min(2).parse([
  {
    name: 'Del ensayo a la escena',
    purpose: 'Sigue el trabajo escénico desde una sala de creación y ensayo hasta un teatro de caja negra.',
    stops: ['sala-la-trama', 'teatro-del-sur']
  },
  {
    name: 'Sonidos al aire libre',
    purpose: 'Parte de un taller de experimentación sonora y descubre cómo cambia el espacio de encuentro al pasar del patio a la plaza.',
    stops: ['casa-del-eco', 'patio-del-rio', 'plaza-del-viento']
  }
]);
