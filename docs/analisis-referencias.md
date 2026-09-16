# Análisis de referencias, competencia y SEO

Fecha: 15/09/2026. Precios y textos tal como aparecían ese día.

**Método:** lectura completa de cada web, capturas de Justap en móvil (390×844) y escritorio (1440×900), y medición del peso de Justap y Tapstar desde el navegador. Las cifras de peso son mínimas, porque algunos recursos de terceros no informan de su tamaño. Se analizaron las cuatro webs que pasó el propietario y MontesTAP, que apareció en Google vendiendo "NFC + QR", el mismo planteamiento que el nuestro.

## 1. Comparativa

| | Justap | Tapstar | MontesTAP | TapReview | etiquetas-nfc.es |
|---|---|---|---|---|---|
| Plataforma | Shopify | Shopify | Shopify | WooCommerce | WordPress + Stripe |
| Producto principal | Tarjeta PVC negra | Expositor de mostrador | Tarjeta NFC + QR | Tarjeta, stand y placa | Tarjeta genérica |
| Precio 1 unidad | 24,90 € IVA incl. (tachado 31,90 €) | Tarjeta 32,90 €; expositor y placa 38,90 € (tachado 49,90 €) | 14,90 €, pero se vende desde 2 uds (29,80 €) | 15 € (agotado) | 7,99 € + IVA |
| Packs | 3 uds 59,90 €; 5 uds 89,90 €; 10 uds 129,90 € | Pack con descuento | 3 uds 39,90 €; 5 uds 59,90 €; 10 uds 99,90 € | No | 10 a 49 uds: 4,50 €/u; 50 o más: 3,99 €/u |
| Envío | Gratis, GLS 24 h, península | Gratis, 24 a 48 h, península | Gratis 24 a 48 h (salvo Baleares y Canarias); antes de las 14:00 sale el mismo día | Gratis desde 30 € | No lo indica |
| Datos del negocio | **Antes de pagar:** buscador de Google Maps obligatorio en la ficha; después confirman por email | **Después:** el cliente conecta el dispositivo al recibirlo | **Antes de pagar:** "Busca tu negocio aquí" | No visible | Después |
| Software | Panel MyJustap (estadísticas, cambiar enlace, pantalla con logo) | Plataforma con estadísticas y ranking de empleados | No | No | No |
| Garantía | No destacada | 30 días "si no duplicas tus reseñas" | 60 días | No visible | Devolución en 14 días |
| Prueba social | 48 reseñas (Loox) y logos de empresas | +20.000 negocios, +609.000 reseñas, 4,9/5 | +1.000 negocios, 3 reseñas | Ninguna | Ninguna |
| Peso medido | ≥ 2,6 MB, 274 peticiones, 28 dominios, ≥ 1,9 MB de JS | ≥ 6,4 MB, 324 peticiones, 29 dominios, ≥ 1,5 MB de JS y 3,8 MB de vídeo | No medido | No medido | No medido |

**Precio por unidad en el mercado:** etiquetas-nfc.es unos 9,67 € con IVA (genérica, sin configurar), MontesTAP 14,90 €, TapReview 15 €, Justap 24,90 € y Tapstar 32,90 €.

## 2. Justap: la referencia de arquitectura

**Orden en móvil:** galería (9 fotos), H1 "Tarjeta JUSTAP® con NFC para reseñas de Google", precio tachado y precio con "Ahorra 7 €", "IVA incluido. Envío gratis 24 H", estrellas (48), color, "Configura tu tarjeta: busca tu negocio en Google Maps", 4 packs, "Agregar al carrito", "Pagar con PayPal", descripción y 19 bloques más (modos, panel, especificaciones, envío, contenido, casos de uso, logos, FAQ y "Lo más vendido").

**En escritorio:** dos columnas, galería a la izquierda y zona de compra a la derecha. La página "Productos" es una rejilla de fotos con nombre y precio, sin nada más.

### Qué tomamos
- Abrir la web y estar ya comprando: foto, nombre del producto con la keyword, precio con IVA y envío juntos, y la compra en la misma pantalla.
- El negocio se elige dentro de la compra, de forma obligatoria y con una ayuda breve ("Selecciona tu negocio de la lista de Google").
- Packs como opciones seleccionables, con el ahorro visible y uno recomendado.
- Las objeciones que resuelve su FAQ y que debemos cubrir: no hay que configurar nada; **nunca pedimos contraseñas ni acceso a tu cuenta de Google**; se pueden pedir varias unidades para negocios distintos; no lleva batería; funciona en iPhone y Android; no hay cuotas.
- "Llega configurada y bloqueada".
- Casos de uso sin local: fontaneros, entrenadores, limpieza a domicilio, repartidores. La tarjeta se lleva encima, cosa que un expositor no permite.
- Una página de productos mínima para cuando haya catálogo.

### Qué no tomamos
- **El botón de compra no aparece en el primer pantallazo del móvil.** Antes van el color, el buscador y 4 packs, así que no cumple nuestra regla de los 5 segundos.
- **La jerarquía de botones está al revés:** "Agregar al carrito" lleva un borde fino y "Pagar con PayPal" va en amarillo, que llama más.
- **Descuentos permanentes** ("ÚLTIMAS UNIDADES -20%", precios tachados). Es urgencia falsa, prohibida en el brief y arriesgada según la normativa de precios.
- Logo de Google y estrellas amarillas en el producto y en las fotos.
- Un aviso de cookies que tapa la zona de compra en móvil.
- Texto desordenado: 19 titulares H2 en una ficha, muchos en mayúsculas, y listas con emojis.
- El peso: casi 2 MB de JavaScript repartidos en 28 dominios distintos.

## 3. Tapstar

- **Tomar:** "Conecta en 20 segundos" como mensaje de sencillez; fotos del producto en locales reales ("Así se ve en tu local"); "pago único, sin suscripciones" bien visible; la sección "¿Por qué necesito más reseñas?".
- **Evitar:** promesas de resultado ("Aparece el primero en Google Maps", "si no duplicas tus reseñas, te devolvemos el dinero"), cifras imposibles de verificar, un vídeo de 3,8 MB en la home y emojis en el `title`.
- **Modelo distinto:** el dispositivo sale genérico y el cliente lo conecta al recibirlo, lo que permite fabricar en lote. Nuestra `/t/[codigo]` podría adoptar ese modelo en el futuro sin cambiar las tarjetas.
- **Hoja de ruta:** su plataforma (estadísticas, ranking de empleados) confirma que `tap_events` tendrá valor para un futuro panel.

## 4. MontesTAP (el competidor más parecido a nuestra oferta)

- **Tomar:** "NFC + QR" en el H1 y en el `title`; el precio por unidad dentro de cada pack; la hora de corte del envío ("antes de las 14:00 sale el mismo día"), que es concreta y creíble; "La configuramos nosotros antes del envío"; la pregunta "¿Tengo que configurarla yo?".
- **Evitar:** precios "antes" tachados y vender desde 2 unidades sin dejarlo claro.

## 5. TapReview y etiquetas-nfc.es

- **TapReview:** tienda WooCommerce con todo agotado, pero con blog. Existe competencia por el contenido informativo, aunque es floja.
- **etiquetas-nfc.es:** precio sin IVA (confuso para autónomos), estrellas en el `title` y la frase "dejar reseñas positivas", que choca con las políticas de Google. Sus descuentos por volumen (10 y 50 uds) indican que hay demanda de agencias y cadenas, una posible línea B2B en el futuro.

## 6. Oportunidades para [MARCA]

1. **Velocidad:** una ficha de menos de 500 KB frente a 2,6 y 6,4 MB. Mejor posición en Google y mejor nivel de calidad en Google Ads.
2. **Honestidad visible:** precio real, sin tachados ni cifras infladas. En un mercado lleno de "últimas unidades", la sobriedad es lo que transmite calidad.
3. **Comprobar antes de pagar:** "Probar enlace" abre la ventana real de reseña de tu negocio. Justap lo confirma por email después del pago.
4. **Un primer pantallazo que vende:** producto, precio y botón visibles en móvil sin hacer scroll.
5. **Pensada para autónomos:** factura con NIF, dicha claramente.
6. **Cambio de destino gratis** (mudanza o ficha nueva) sin comprar otra tarjeta, gracias a `/t/[codigo]`.
7. **Estética propia**, sin el cliché de logo de Google y estrellas amarillas que usan todos.

## 7. SEO

### Qué está pasando en Google
- Para "tarjeta nfc reseñas google" aparecen fichas de producto (Tapstar, TapReview, MontesTAP, Justap, etiquetas-nfc.es, Prelux Labs) y algún artículo de blog. Es una búsqueda de compra, así que una home que funciona como ficha de producto es la forma correcta de competir.
- Los enlaces de Justap y etiquetas-nfc.es llevaban `?srsltid=`, el parámetro que Google añade a las tiendas conectadas a Google Merchant Center. Parte de su tráfico viene de las fichas de producto gratuitas de Google: hay que estar ahí desde el lanzamiento.

### Mapa inicial de keywords (hipótesis; validar volúmenes con Keyword Planner)

| Intención | Ejemplos | URL |
|---|---|---|
| Compra del producto principal | tarjeta nfc reseñas google; tarjeta reseñas google; tarjeta nfc google maps; tarjeta nfc qr reseñas | `/` |
| Compra de otros formatos (futuro) | placa nfc reseñas google; expositor reseñas google; pegatina nfc reseñas | `/productos/[slug]` |
| Compra por sector | tarjeta reseñas google restaurante, peluquería o clínica | Primero, el bloque "Dónde se usa" de `/`. Landings propias solo con contenido útil |
| Informativa | cómo conseguir más reseñas en google; cómo pedir reseñas a mis clientes; enlace para reseñas de google; qr reseñas google | Propuesta: `/guias/...` y herramienta gratuita de enlace y QR |
| Marca | [marca]; [marca] opiniones | `/` |

## 8. ChatGPT Ads (situación a 15/09/2026)

- Disponible en España desde el 24/08/2026 (31 mercados europeos) y con autoservicio en Ads Manager desde el 31/08/2026. Sigue en beta, así que el acceso puede variar según la cuenta.
- Solo se muestra a usuarios de los planes Free y Go. Se paga por CPM o por CPC.
- Se segmenta con "context hints" (descripciones de la situación del usuario), no con palabras clave exactas. El inicio de la ficha tiene que responder a la pregunta de la conversación.
- Medición: parámetro `oppref` en la URL de destino, OpenAI Pixel (cookie propia, requiere consentimiento) y Conversions API desde el servidor, deduplicados con un identificador de evento común.
- Piden landings coherentes con la conversación, no homes genéricas. Una ficha específica encaja.

## Fuentes

- Webs analizadas el 15/09/2026: [justap.es](https://justap.es/products/tarjeta-justap-con-nfc-para-resenas-de-google), [tapstar.es](https://tapstar.es/), [montestap.com](https://montestap.com/products/tarjeta-nfc-resenas-google), [tapreview.es](https://tapreview.es/tienda/), [etiquetas-nfc.es](https://www.etiquetas-nfc.es/producto/tarjeta-nfc-resenas-de-google/)
- ChatGPT Ads en Europa: [Search Engine Land](https://searchengineland.com/chatgpt-ads-are-expanding-to-31-european-countries-485468), [Digiday](https://digiday.com/marketing/openais-ads-business-hits-europe-at-the-six-month-mark/)
- ChatGPT Ads en España (acceso, costes y medición): [Elevam](https://elevam.es/en/blog/chatgpt-ads-spain-guide/)
- Parámetro `srsltid` y Merchant Center: [Search Engine Land](https://searchengineland.com/google-srsltid-parameter-seo-attribution-448077), [Search Engine Journal](https://www.searchenginejournal.com/googles-srsltid-parameter-appears-in-organic-urls-creating-confusion/549967/)
- Cloudflare compra Astro (16/01/2026): [nota de prensa de Cloudflare](https://www.cloudflare.com/press/press-releases/2026/cloudflare-acquires-astro-to-accelerate-the-future-of-high-performance-web-development/)
- Uso comercial en los planes gratuitos de Vercel y Netlify: [Northflank](https://northflank.com/blog/vercel-vs-netlify-choosing-the-deployment-platform-in-2026), [zPlatform](https://zplatform.ai/guides/is-vercel-free/)
