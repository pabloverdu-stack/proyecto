# Encargo original (copia literal)

> Pegado por el propietario el 15/09/2026. Es la fuente de verdad del proyecto. `CLAUDE.md` lo resume y registra los cambios acordados. La sección 12 recoge lo que el propietario añadió en el mismo mensaje.

---

# PROMPT PARA CLAUDE CODE: Landing de venta de la tarjeta NFC de reseñas de Google

> **Antes de pegarlo:** rellena lo que está entre [CORCHETES]. Si aún no sabes algo, déjalo tal cual; Claude Code te lo preguntará en la Fase 0.

---

## 1. Contexto y rol

Trabajas como un equipo de tres perfiles: diseñador/a de producto senior con criterio propio, desarrollador/a web full-stack y especialista en conversión (CRO) para e-commerce B2B pequeño.

**Proyecto:** la marca [NOMBRE DE MARCA] vende tarjetas NFC a negocios locales en España (restaurantes, peluquerías, clínicas, talleres, comercios). El producto de lanzamiento es uno solo: **la tarjeta NFC de reseñas de Google**. El cliente del negocio acerca el móvil a la tarjeta y se abre directamente la ventana para escribir una reseña de ese negocio en Google, sin instalar ninguna app.

**Objetivo de negocio:** vender. Métrica principal: conversión de visita a compra.

**Tráfico principal:** anuncios en ChatGPT (ChatGPT Ads). Los usuarios llegarán sobre todo desde móvil y desde una conversación del tipo "¿cómo consigo más reseñas en Google para mi negocio?". La landing debe continuar esa conversación: el titular responde a esa pregunta, no abre un tema nuevo.

**Hoja de ruta (NO construir ahora, pero la arquitectura debe permitirlo sin rehacer nada):** carta digital para restaurantes, lista de precios para tiendas, vídeo-reseña de producto y otros productos NFC.

**Datos del titular (para páginas legales):**
- Nombre o razón social: [ ]
- NIF/CIF: [ ]
- Domicilio: [ ]
- Email de contacto: [ ]
- Teléfono (opcional): [ ]
- Datos registrales (solo si es sociedad): [ ]

**Producto y oferta:**
- Formatos: [p. ej. tarjeta PVC 85×54 mm, soporte de mostrador]
- Packs y precios (indica si incluyen IVA): [PACK 1: … €] [PACK 2: … €] [PACK 3: … €]
- Envío: [coste, plazo, zonas]
- Incluye: tarjeta programada con el enlace del negocio, código QR impreso de respaldo para móviles sin NFC, [otros]
- Garantía o reposición: [ ]
- Prueba social disponible: [ninguna todavía / testimonios reales con permiso / fotos en negocios reales]

**Regla absoluta:** no inventes testimonios, número de clientes, reseñas conseguidas ni resultados. Si no hay dato real, la sección se diseña sin él.

---

## 2. Forma de trabajar (obligatorio)

1. Lee este documento completo. Antes de escribir código, hazme en un solo mensaje las preguntas que falten (máximo 8), ordenadas de más a menos bloqueante.
2. Crea `CLAUDE.md` en la raíz con: resumen del proyecto, stack, comandos, convenciones y decisiones tomadas. Actualízalo al cerrar cada fase.
3. Trabaja por fases (sección 11). Al terminar cada una: qué has hecho, cómo lo pruebo y espera mi OK antes de continuar.
4. Ningún secreto en el código. Todo en `.env`, con un `.env.example` que liste las variables vacías. Stripe siempre en modo test hasta que yo lo indique.
5. Soy principiante. Cuando tenga que hacer algo fuera del código (crear una cuenta, copiar una clave, configurar el dominio), dame pasos numerados y concretos.
6. Si una instrucción de este documento te parece mala para la conversión o el rendimiento, dilo y propón alternativa antes de ejecutar.

---

## 3. Stack

- **Astro** con salida estática y JavaScript vanilla. Motivo: domino HTML, CSS, JS y GSAP, y Astro permite añadir páginas de producto más adelante con colecciones de contenido.
- **CSS propio con custom properties** (tokens de diseño). Sin Tailwind salvo que lo justifiques.
- **GSAP** solo para el momento de animación del hero. Respeta `prefers-reduced-motion`.
- **Pagos:** Stripe Checkout alojado (nunca formularios de tarjeta propios). Apple Pay y Google Pay activados.
- **Base de datos:** Supabase, región UE.
- **Endpoints de servidor** (sesión de checkout, webhook, redirección de tarjetas) con el adaptador de Astro para [Vercel / Netlify / mi VPS con Coolify].
- **Notificaciones:** [Resend u otro proveedor de email] y/o un webhook a mi n8n: [URL del webhook].
- **Búsqueda del negocio:** Google Places API (New) con Autocomplete. Clave restringida por dominio y por API.

---

## 4. Arquitectura de información

**Decisión:** una sola oferta. Sin menú "Productos" ni desplegable mientras solo haya un producto.

| Ruta | Función |
|---|---|
| `/` | Landing de la tarjeta de reseñas. Es la home y el destino de los anuncios |
| `/pedido` | Configurador en 3 pasos y salida a Stripe Checkout |
| `/pedido/confirmado` | Confirmación y próximos pasos |
| `/t/[codigo]` | Redirección de cada tarjeta física (sección 7) |
| `/aviso-legal`, `/privacidad`, `/cookies`, `/condiciones` | Legal |
| `/productos/[slug]` | Preparada para el futuro, alimentada por una colección `products` con un único ítem hoy |

La navegación lee la colección `products`: con 1 producto no muestra "Productos"; con 2 o más, el menú aparece automáticamente.

**Header escritorio:** logo, Cómo funciona, Precios, Preguntas y botón principal.
**Header móvil:** logo y botón principal. Sin menú hamburguesa si no es imprescindible.

---

## 5. Estructura y copy de la landing

### Regla de los 5 segundos
En el primer pantallazo de un móvil de 390×844 se tiene que entender: qué es, para quién es, qué gana el negocio, desde cuánto cuesta y dónde se compra. Prueba: alguien que vea solo el hero durante 5 segundos debe poder decir "es una tarjeta que acercas al móvil para que los clientes te dejen reseñas en Google".

### Secciones, en este orden (justifica cualquier cambio)

1. **Hero.** Titular orientado al resultado (más reseñas reales en Google). Subtítulo que explica el mecanismo en una frase (acercan el móvil, se abre la reseña, sin app). Botón principal. Precio "desde". Dos o tres garantías breves: funciona en iPhone y Android, envío en [X] días, llega lista para usar. Visual: la tarjeta física y el gesto de acercar el móvil.
2. **Cómo funciona.** Tres pasos (aquí sí hay una secuencia real): el cliente acerca el móvil, se abre la ventana de reseña de tu negocio, publica su opinión. Debajo, en una línea, el proceso de compra: eliges tu negocio, la programamos y te llega lista.
3. **Por qué importa.** La cadena de valor en el lenguaje del dueño del negocio: más reseñas recientes, mejor presencia en Google Maps, más confianza, más clientes. Sin estadísticas inventadas. Si usas un dato, debe tener fuente verificable enlazada; si no, no lo uses.
4. **Dónde se usa.** Ejemplos concretos: junto a la cuenta en un restaurante, en el mostrador de una peluquería, en la recepción de una clínica, al terminar un servicio a domicilio.
5. **Precios.** Máximo 3 packs, uno destacado como recomendado. Botón en cada uno.
6. **Preguntas frecuentes.** ¿Mis clientes necesitan una app? ¿Funciona con iPhone? ¿Y si el móvil no tiene NFC? (QR de respaldo) ¿Qué pasa si cambio de ficha o de local? ¿Cuánto tarda en llegar? ¿Hay cuotas mensuales? ¿Puedo pedir factura con NIF?
7. **Cierre.** Una frase y el botón.
8. **Footer.** Enlaces legales, contacto y este aviso: "[MARCA] no está afiliada ni patrocinada por Google. Google es una marca de Google LLC."

### Reglas de copy
- Español de España, tuteo, frases cortas, voz activa, verbos concretos.
- El botón dice exactamente lo que ocurre: "Pedir mi tarjeta". El mismo verbo se mantiene en todo el flujo.
- Se escribe desde el problema del dueño: sus clientes satisfechos no dejan reseña porque buscar la ficha es un engorro.
- **Prohibido:** prometer estrellas o valoraciones positivas ("5 estrellas garantizadas"), sugerir que la tarjeta filtra a los clientes descontentos, testimonios o cifras inventadas, urgencia falsa (contadores, "últimas unidades").
- Entrega **3 variantes de titular y subtítulo del hero** con el razonamiento de cada una para que yo elija.

---

## 6. Dirección de diseño

**Objetivo:** minimalista, premium y con identidad propia. No debe parecer una plantilla ni una web generada por IA.

### Proceso obligatorio antes de programar
1. Propón un plan de diseño compacto:
   - Paleta de 4 a 6 colores con nombre y hex.
   - Tipografías (una o dos familias) y la función de cada una, con escala tipográfica.
   - Concepto de layout con wireframes ASCII del hero y de la página completa en móvil y escritorio. Indica la alineación.
   - Tres principios que hacen única esta página.
2. Revisa el plan contra la lista de patrones genéricos de abajo. Si alguna decisión coincide sin un motivo específico de este proyecto, cámbiala y explícame qué cambiaste y por qué.
3. Espera mi aprobación.

### De dónde sale la identidad
Del propio objeto (una tarjeta física con un chip), del gesto de acercar el móvil y del mostrador de un negocio de barrio. Un único elemento memorable (propuesta: la animación del hero en la que el móvil se acerca a la tarjeta y aparece la ventana de reseña). Todo lo demás, silencioso y disciplinado.

### Jerarquía orientada a la compra
- Un solo color de acento, reservado exclusivamente para las acciones de compra.
- Un botón principal por pantalla. Las acciones secundarias, como enlaces de texto.
- Mucho espacio en blanco. Una idea por sección.
- Botón de compra fijo en móvil a partir del segundo pantallazo.

### Patrones a evitar (salvo motivo concreto y explicado)
- Fondo crema cálido con serif de alto contraste y acento terracota.
- Fondo casi negro con un único acento verde ácido o bermellón.
- Contenido troceado en tarjetas redondeadas idénticas con la misma sombra gris y degradados decorativos.
- Etiquetas en mayúsculas espaciadas encima de cada título.
- Destacar una sola palabra del titular en otro color, negrita o cursiva.
- Flechas añadidas al texto de los botones y separadores con punto medio.
- Numeración 01/02/03 donde no hay una secuencia real.
- Animación de entrada en cada sección y efecto hover en cada tarjeta.
- Tipografías por defecto (Inter, Roboto, Poppins, Montserrat, Open Sans). Elige con intención.
- Estrellas amarillas, logotipo de Google o sus colores corporativos como recurso gráfico principal (además supone riesgo de marca).

### Calidad mínima
- Responsive desde 360 px.
- Foco de teclado visible y contraste WCAG AA.
- Imágenes AVIF/WebP con dimensiones declaradas.
- LCP inferior a 2,5 s en móvil 4G.
- Lighthouse igual o superior a 90 en las cuatro categorías.

### Referencias para analizar (inspiración, nunca copiar)
- Claridad de producto físico: apple.com (página de AirTag), nothing.tech, bellroy.com
- Sobriedad y jerarquía: stripe.com, linear.app
- Competencia directa, para diferenciarse: tapstar.es, justap.es, tapreview.es, nfcw.es
- Galerías de landings: land-book.com, godly.website, lapa.ninja, onepagelove.com
- Webs que me gustan a mí: [pega aquí 2 o 3 enlaces]

---

## 7. Flujo de compra y datos

### Configurador `/pedido` (3 pasos, con indicador de progreso)
1. **Elige tu pack.**
2. **Busca tu negocio** con Google Places Autocomplete. Muestra una vista previa con nombre y dirección, y un botón "Probar enlace" que abre la ventana real de reseña para que el comprador confirme que es su ficha. Alternativa si no aparece: campo para pegar el enlace de su ficha de Google, marcado para validación manual.
3. **Confirmar**, que crea la sesión de Stripe Checkout desde el servidor.

Enlace de reseña: `https://search.google.com/local/writereview?placeid={PLACE_ID}`

### Stripe Checkout
- Precios definidos en Stripe (Products y Prices), nunca calculados en el navegador.
- Recoger: email, nombre, teléfono, dirección de envío ([España peninsular / países]), NIF/CIF opcional mediante tax ID collection y nombre fiscal.
- `metadata`: place_id, business_name, pack y parámetros UTM.
- IVA y gastos de envío visibles antes de pagar.
- Aceptación obligatoria de condiciones enlazando a `/condiciones`.
- Recibos de Stripe activados.

### Webhook `checkout.session.completed`
- Verifica la firma y es idempotente (reenviar el mismo evento no duplica nada).
- Crea el pedido en Supabase.
- Genera un código único de tarjeta (8 caracteres base62, no adivinable) y registra la tarjeta con destino igual al enlace de reseña.
- Notifica: email al cliente con próximos pasos y aviso para mí (email o webhook de n8n).

### Esquema de Supabase (propuesta: ajústalo y justifica los cambios)
- `businesses`: id, place_id, name, address, review_url, created_at
- `orders`: id, stripe_session_id (único), customer_email, customer_name, phone, tax_id, shipping_address (jsonb), pack, amount_total, currency, status (paid, programmed, shipped, delivered, refunded), utm (jsonb), created_at
- `cards`: id, code (único), order_id, business_id, product_type (por defecto `google_review`), destination_url, active, created_at
- `tap_events` (opcional): card_code, created_at. Sin IP, sin user agent completo, sin ningún dato personal.
- RLS activado en todas las tablas. Solo el servidor escribe. La clave service role nunca llega al navegador.

### Redirección `/t/[codigo]`
- Tarjeta activa: redirección 302 a `destination_url`. Inexistente o inactiva: página sencilla con un mensaje claro.
- Respuesta rápida. Cuidado con la caché, porque el destino puede cambiar.
- **Esta es la URL que se graba en el chip NFC y en el QR.** Así puedo cambiar el destino sin reimprimir y, en el futuro, reutilizar la misma tarjeta para otros productos (carta, precios, vídeo) cambiando `product_type`.

### Sin panel de administración en el MVP
Gestiono pedidos desde Stripe y Supabase. Documenta en `CLAUDE.md` cómo marcar un pedido como enviado y cómo cambiar el destino de una tarjeta.

---

## 8. Legal (España): borradores para revisión profesional

Genera las páginas con texto base y todos los datos variables entre [CORCHETES]. Muestra un aviso "PENDIENTE DE REVISIÓN PROFESIONAL" solo en entorno de desarrollo. No las presentes como definitivas.

- **Aviso legal** (LSSI-CE, Ley 34/2002): identificación completa del titular.
- **Política de privacidad** (RGPD y LOPDGDD): responsable, finalidades (pedido, facturación, envío, atención), base jurídica, plazos de conservación, encargados del tratamiento (Stripe, Supabase, proveedor de email, mensajería, Google), transferencias internacionales si las hay, derechos y cómo ejercerlos, derecho a reclamar ante la AEPD.
- **Política de cookies y banner:** nada no esencial (analítica, píxeles de anuncios) se carga antes del consentimiento. "Aceptar" y "Rechazar" con el mismo peso visual en la primera capa, opción de configurar y enlace en el footer para cambiar la elección.
- **Condiciones generales de contratación:** proceso de compra, precios con IVA, envío y plazos, garantía, devoluciones, desistimiento, atención al cliente y ley aplicable. Sobre el desistimiento, redacta con placeholders las dos situaciones para que decida mi asesor: venta dirigida a empresas y autónomos, y producto personalizado para cada negocio.
- **Formularios:** casillas nunca premarcadas. Si hay casilla de comunicaciones comerciales, separada y opcional. No se piden datos que no se usen.

---

## 9. Medición

- Los parámetros UTM se conservan hasta el checkout y se guardan en la metadata de Stripe.
- Eventos: `hero_cta_click`, `pricing_view`, `checkout_step_1`, `business_selected`, `checkout_redirect`, `purchase` (disparado en `/pedido/confirmado` y validado contra el webhook).
- Hueco preparado para la etiqueta de conversión de ChatGPT Ads y para [Plausible / GA4], cargados según el consentimiento.

---

## 10. QA y entrega

- Con Playwright, captura cada sección a 390×844 y 1440×900. Revisa tú las capturas y corrige lo que no cumpla este documento antes de enseñármelo.
- Prueba el flujo completo con tarjetas de test de Stripe: pago correcto, pago rechazado, abandono y reenvío del webhook.
- Checklist final:
  - [ ] Regla de los 5 segundos superada en móvil
  - [ ] Color de acento usado solo en acciones de compra
  - [ ] Ningún patrón de la lista a evitar sin justificar
  - [ ] Lighthouse ≥ 90 y accesibilidad AA
  - [ ] Páginas legales enlazadas en footer y checkout
  - [ ] Banner de cookies bloqueando scripts no esenciales
  - [ ] `.env.example` completo
  - [ ] README con despliegue paso a paso para principiante

---

## 11. Fases

| Fase | Entregable | Espera mi OK |
|---|---|---|
| 0 | Preguntas pendientes y `CLAUDE.md` | Sí |
| 1 | Plan de diseño, wireframes y 3 variantes de copy del hero | Sí |
| 2 | Landing estática completa con contenido real | Sí |
| 3 | Configurador, Stripe en test, webhook, Supabase y `/t/[codigo]` | Sí |
| 4 | Páginas legales, banner de cookies y medición | Sí |
| 5 | QA, rendimiento y despliegue en [plataforma] con el dominio [dominio] | Sí |

**Fuera de alcance ahora:** panel de cliente, suscripciones, nuevos productos NFC y multiidioma.

---

## 12. Añadido por el propietario en el mismo mensaje

### Texto literal

> quiero que te inspieres y que conjas informacion de varias webs que te voy a pasar si hace falta y si tu crees correpondiente guiate mas de las web de inspiracion si tu lo crees conveniento y mejor para el negocio
> https://tapstar.es/
> https://tapreview.es/tienda/
> https://justap.es/products/tarjeta-justap-con-nfc-para-resenas-de-google?srsltid=AU7gw4UHXBQyN_HLguKbUd7a4kUTztY_6AodNVPrKEDvFPU8EnYYPl89 (esta arquitectura es de mis preferidas directo a vender abres la pagina y temete en a tarjeta con los pagos y la explicacion del producto facil sencillo y te leva directo a la comra con las imagenes del producto quiero algo explicitamente de este estilo no me acaba de gustar ni los colores ni la organizacion del texto pero quiero algo con este enfoque 100% 100% luego tiene otra pagina que lleva a mas producto con su imagenes y precio no tiene paja sencillo par el ciente) no tiene basura visual
> https://www.etiquetas-nfc.es/producto/tarjeta-nfc-resenas-de-google/?srsltid=AU7gw4WyJ9CrydkdjfwP3LbSBU5SGp40ZsxywF9aTIIFnykFdpP08TdP
> me olvidado que te esmeren en el posicinamiento seo sem con copy es lo funcamental para un ben posicionamiento junto con unos buenos tiempos de carga

### Interpretación
- Referencias de inspiración: tapstar.es, tapreview.es/tienda, la ficha de la tarjeta de justap.es y la ficha de la tarjeta de etiquetas-nfc.es. Hay libertad para apoyarse más en ellas si es mejor para el negocio.
- **Justap es la referencia principal de arquitectura, "100 %":** abres la web y estás en la ficha de la tarjeta, con fotos del producto, precio, compra y explicación. Directo a comprar, fácil, sin paja ni basura visual. No gustan sus colores ni la organización del texto. Además tiene una página con más productos (foto y precio), también sencilla.
- **SEO y SEM con buen copy, y tiempos de carga rápidos, son fundamentales.**
