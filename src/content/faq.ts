// Preguntas frecuentes compartidas por las fichas de producto.
export interface FaqItem {
  question: string;
  answer: string;
}

export const faq: FaqItem[] = [
  {
    question: '¿Mis clientes necesitan instalar una app?',
    answer:
      'No. Los móviles actuales leen NFC sin instalar nada: basta con desbloquear el móvil y acercarlo. Si no tiene NFC, escanea el código QR con la cámara.',
  },
  {
    question: '¿Funciona con iPhone?',
    answer:
      'Sí. En un iPhone XS o posterior basta con acercarlo. En modelos más antiguos y en móviles sin NFC, el cliente escanea el código QR y llega a la misma ventana.',
  },
  {
    question: '¿Y si el móvil de mi cliente no tiene NFC?',
    answer: 'Lleva un código QR impreso. Se escanea con la cámara y abre la misma ventana para escribir la reseña.',
  },
  {
    question: '¿Os tengo que dar la contraseña de Google?',
    answer:
      'No, nunca te la pediremos. Al hacer el pedido buscas tu negocio en Google, como lo haría cualquier cliente, y con eso basta.',
  },
  {
    question: '¿Qué pasa si cambio de local o de ficha de Google?',
    answer:
      'Escríbenos y cambiamos el enlace sin coste. No necesitas una tarjeta nueva: el destino se cambia desde nuestro sistema.',
  },
  {
    question: '¿Cuánto tarda en llegar?',
    answer:
      'Te llega en 48 h laborables a cualquier punto de la península, con el envío gratis. De momento no enviamos a Baleares, Canarias, Ceuta ni Melilla.',
  },
  {
    question: '¿Hay cuotas mensuales?',
    answer: 'No. Pagas una vez y ya está: sin suscripciones ni cuotas.',
  },
  {
    question: '¿Puedo pedir factura con mi NIF?',
    answer:
      'Sí. Durante el pago puedes añadir el nombre fiscal y el NIF o CIF de tu negocio, y te enviamos la factura.',
  },
  {
    question: '¿Puedo pedir para varios negocios?',
    answer:
      'Cada pedido va asociado a un negocio. Si tienes varios, haz un pedido por cada uno o escríbenos y lo preparamos juntos.',
  },
  {
    question: '¿La tarjeta consigue reseñas positivas?',
    answer:
      'La tarjeta hace que dejar una opinión sea fácil para cualquier cliente, sea cual sea su opinión. No filtra ni elige quién escribe: así lo exigen las normas de Google, y así debe ser.',
  },
];
