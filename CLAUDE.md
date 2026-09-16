# CLAUDE.md

Guía de trabajo para Claude Code en este proyecto. Se actualiza al cerrar cada fase.

- **Encargo completo (fuente de verdad):** [docs/brief-original.md](docs/brief-original.md)
- **Competencia, referencias y SEO:** [docs/analisis-referencias.md](docs/analisis-referencias.md)
- **Plan de diseño:** [docs/fase-1-plan-diseno.html](docs/fase-1-plan-diseno.html)
- **Guía para el propietario (instalación, servicios, despliegue, operaciones):** [README.md](README.md)

## Estado

El 15/09/2026 el propietario pidió terminar el proyecto sin más preguntas. Claude tomó las decisiones pendientes con sus recomendaciones (ver D9) y construyó las fases 2 a 4 y la QA local de la fase 5.

| Fase | Entregable | Estado |
|---|---|---|
| 0 | Preguntas y `CLAUDE.md` | Cerrada el 15/09/2026 |
| 1 | Plan de diseño, wireframes y copy del hero | Cerrada el 15/09/2026 (decisiones en D9) |
| 2 | Ficha de producto estática completa | Hecha el 15/09/2026 |
| 3 | Flujo de pedido, Stripe, webhook, Supabase y `/t/[codigo]` | Código hecho y probado en modo demo. Falta probar con cuentas reales (las crea el propietario) |
| 4 | Legales, cookies y medición | Hecha. Legales en borrador con [CORCHETES] |
| 5 | QA, rendimiento y despliegue | QA local hecha. Despliegue pendiente de las cuentas del propietario (README, sección 4) |

**QA del 15/09/2026:**
- `astro check` sin errores ni avisos.
- `npm run test:flujo`: pedido completo en demo, tarjetas creadas, 302 en `/t/código` y 404 en códigos inexistentes, sin errores de JS.
- Capturas a 390×844 y 1440×900 revisadas.
- Lighthouse móvil sobre la versión de producción (workerd):
  - Portada: 100 en las cuatro categorías; LCP 1,4 s, TBT 0 ms, CLS 0 y 102 KB en total.
  - Soporte: 99, 100, 100 y 100.
  - Condiciones: 100 en las cuatro.
  - `/pedido`: SEO 66 a propósito, porque lleva `noindex`.
- GSAP se descarga después de pintar y no se descarga con `prefers-reduced-motion`.

## El proyecto

Ficha Viva (nombre provisional) vende a negocios locales de España una **tarjeta NFC de reseñas de Google** y un **soporte NFC de mostrador**. El cliente del negocio acerca el móvil y se abre la ventana para escribir la reseña, sin app. QR impreso de respaldo.

- **Objetivo:** vender. Métrica principal: conversión de visita a compra.
- **Tráfico:** ChatGPT Ads (activo en España desde el 24/08/2026) y probablemente Google Ads, sobre todo desde móvil. El SEO y la velocidad de carga son prioritarios.
- **Hoja de ruta (no construir aún):** carta digital, lista de precios, vídeo-reseña y otros productos NFC. La arquitectura ya lo permite: colección `products`, `product_type` en `cards` y destino editable.
- **Fuera de alcance:** panel de cliente, suscripciones, nuevos productos NFC y multiidioma.

### Datos confirmados por el propietario (15/09/2026)

- Tecnología: Astro.
- Productos: tarjeta y soporte de mostrador.
- Tarjeta con IVA incluido: 1 ud a 30 €; pack de 2 a 52 € (26 € cada una); pack de 5 a 110 € (22 € cada una).
- Envío: gratis, solo península, 48 h.
- Fotos: no hay todavía.
- Canales: ChatGPT Ads seguro, Google Ads probable.
- Producción: tarjetas de un proveedor, que las personaliza si puede.

## Forma de trabajar

- El propietario domina HTML, CSS, JS y GSAP, pero es principiante con cuentas, claves, dominios y despliegues. Para todo lo que ocurra fuera del código: pasos numerados y concretos (README).
- Antes de construir algo nuevo, decir qué tecnología o formato se usará y esperar el OK, salvo que pida avanzar sin preguntar.
- Si una instrucción del brief perjudica la conversión o el rendimiento, avisar y proponer una alternativa.
- Antes de enseñar un cambio visual: `npm run shots` (390×844 y 1440×900), revisar y corregir.
- Nunca crear cuentas, introducir claves ni comprar nada por el propietario.

## Reglas innegociables

1. **Nada inventado:** ni testimonios, ni número de clientes, ni reseñas conseguidas, ni resultados. Sin `AggregateRating` si no hay reseñas reales.
2. **Copy prohibido:** prometer estrellas o valoraciones positivas, sugerir que se filtra a los descontentos, urgencia falsa y precios tachados sin un precio anterior real (el más bajo de los 30 días previos).
3. **Marca Google:** ni su logo, ni estrellas amarillas, ni sus colores. Tampoco el símbolo contactless de EMVCo ni la N-Mark del NFC Forum. El aviso de no afiliación va en el pie.
4. **Secretos:** nunca en el código; todo en `.env` (y `wrangler secret` en producción). Stripe en test hasta orden expresa. La service_role de Supabase nunca llega al navegador.
5. **Precios:** se cobran los de Stripe (lookup keys). El JSON solo sirve para mostrarlos. Si no coinciden, `/api/checkout` lo avisa en el log.
6. **Consentimiento:** GA4, Google Ads y el píxel de OpenAI solo se cargan tras aceptar. Sin IDs configurados, no hay aviso de cookies.
7. **Calidad:** responsive desde 360 px, WCAG AA y Lighthouse ≥ 90 en las cuatro categorías.

## Stack

| Pieza | Elección |
|---|---|
| Framework | Astro 7.3 (`output: 'static'`, rutas de servidor con `prerender = false`), adaptador `@astrojs/cloudflare` 14 |
| Alojamiento | Cloudflare Workers (`wrangler.jsonc`). `astro dev` y `astro preview` ejecutan workerd |
| JS | Vanilla. GSAP 3.15 solo en la escena, con import dinámico |
| CSS | Tokens en `src/styles/tokens.css`, estilos con ámbito por componente |
| Tipografía | Chivo variable (`@fontsource-variable/chivo`), autoalojada |
| Pagos | Stripe Checkout alojado (SDK 22, API `2026-08-26.dahlia`, cliente fetch y SubtleCrypto) |
| Datos | Supabase (`@supabase/supabase-js`), RLS sin políticas, acceso solo con la service_role desde el servidor |
| Buscador | Google Places API (New) Autocomplete vía `/api/places` (la clave nunca va al navegador) |
| Emails | Resend por API REST, y webhook opcional de n8n |
| Variables | `astro:env` (esquema en `astro.config.mjs`) |
| QA | Playwright 1.63, Lighthouse 13.4 y `@astrojs/check` |

## Comandos

Node 24 LTS. En este equipo hay una copia portátil en `.tools/node`; en PowerShell, anteponer `$env:Path = "<proyecto>\.tools\node;" + $env:Path`.

```bash
npm run dev           # http://localhost:4321; modo demo si no hay claves
npx astro dev stop    # el dev server de Astro 7 corre en segundo plano
npm run build
npm run preview       # http://localhost:4322 (workerd)
npm run check
npm run test:flujo    # flujo demo completo (con dev en marcha)
npm run shots         # capturas en qa/capturas; --secciones para una por sección
npm run lighthouse    # con preview en marcha
npm run imagenes      # public/og.png y apple-touch-icon.png (con dev en marcha)
npm run stripe:setup  # productos y precios en Stripe (test; --live para producción)
npm run deploy        # astro build && wrangler deploy
```

**Ojo:** compilar o instalar paquetes con `npm run dev` encendido rompe la caché de Vite (error «optimize deps directory»). Solución: `npx astro dev stop`, borrar `node_modules/.vite` y volver a arrancar.

## Mapa del código

- `src/config/site.ts`: marca, email, zona de envío y prefijos postales excluidos.
- `src/content/products/*.json` y `src/content.config.ts`: productos (el nombre del archivo es el slug) y `featured` para la portada.
- `src/content/faq.ts`: preguntas frecuentes compartidas; también generan el JSON-LD `FAQPage` y `llms.txt`.
- `src/components/ProductPage.astro`: compone la ficha (hero, cómo funciona, por qué, dónde, qué incluye, venta cruzada, FAQ y cierre).
- `src/components/Scene.astro`: escena SVG con variantes `card`/`stand` y estados `open`/`approach`/`done`/`idle`. Sus colores van en hex porque los atributos SVG no leen custom properties (excepción a la regla de tokens).
- `src/scripts/`:
  - `order.ts`: lógica de `/pedido`.
  - `consent.ts`, `analytics.ts` y `track.ts`: cookies y medición.
  - `attribution.ts`: UTM y click IDs.
  - `scene.ts`: animación GSAP.
- `src/lib/`:
  - `store.ts`: Supabase o memoria (demo solo en DEV).
  - `orders.ts`: sesión de Stripe a pedido, y cumplimiento idempotente.
  - `notify.ts`: emails y n8n.
  - `stripe.ts`, `codes.ts` (códigos base62 y validación de enlaces de Google Maps), `products.ts` y `seo.ts` (JSON-LD).
- `src/pages/api/`:
  - `places.ts`: buscador.
  - `checkout.ts`: crea la sesión de Stripe, o simula el pago en demo.
  - `stripe-webhook.ts`.
- `src/pages/t/[codigo].astro`: 302 `no-store` al destino, `tap_events` con `waitUntil`, 404 si no existe o está inactiva, 503 si no hay base de datos.
- SEO: `robots.txt.ts`, `llms.txt.ts`, `feeds/google-merchant.xml.ts`, `@astrojs/sitemap` (excluye `/pedido`, `/t` y `/api`) y `public/_headers`.
- `supabase/migrations/0001_inicial.sql`: esquema, RLS, triggers y vista `pending_orders`.

## Decisiones

### D1. La portada es la ficha de producto, al estilo Justap (propietario)

`/` muestra la tarjeta (producto `featured`). Arriba van la escena y la zona de compra (titular, subtítulo, 3 packs con el de 2 preseleccionado como recomendado, IVA y envío, botón y garantías). El botón envía un GET a `/pedido?producto&pack` más los parámetros de campaña, y `/pedido` pide el negocio y lleva a Stripe. La barra fija de compra en móvil aparece al pasar la zona de compra y se oculta en el cierre; en escritorio, el botón de la cabecera aparece al pasar la zona de compra.

### D2. Rutas

| Ruta | Tipo | Función |
|---|---|---|
| `/` | estática | Ficha de la tarjeta |
| `/productos` | estática | Rejilla de productos (en el menú si hay 2 o más) |
| `/productos/[slug]` | estática | Fichas no destacadas (el soporte) |
| `/pedido` | estática, noindex | Negocio y salida a Stripe (lee la URL en el cliente) |
| `/pedido/confirmado` | servidor | Recupera la sesión de Stripe y dispara `purchase` una vez |
| `/t/[codigo]` | servidor | Redirección de tarjetas |
| `/api/places`, `/api/checkout`, `/api/stripe-webhook` | servidor | APIs |
| `/aviso-legal`, `/privacidad`, `/cookies`, `/condiciones`, `/404` | estáticas | Legal y error |
| `/robots.txt`, `/llms.txt`, `/feeds/google-merchant.xml`, `/sitemap-index.xml` | estáticas | Buscadores |

### D3. Presupuesto de rendimiento (cumplido)

- LCP ≤ 2,0 s, CLS ≤ 0,05, JS inicial ≤ 50 KB comprimido y peso ≤ 500 KB.
- Real en la portada: unos 6 KB de JS propio sin comprimir, 33 KB de fuente y 102 KB en total.
- La escena SVG va en línea, sin peticiones de imagen. GSAP (69 KB) solo se descarga para animar.

### D4. SEO, SEM y buscadores de IA (implementado)

- `title` y `description` por página, canonical, Open Graph con `og.png`, `lang="es-ES"` y un único H1.
- JSON-LD: Organization, WebSite, Product con una Offer por pack (envío 0 € a ES), FAQPage, BreadcrumbList e ItemList.
- `robots.txt` permite `OAI-SearchBot`; `llms.txt` resume la oferta.
- Feed de Merchant Center listo, pero **no darlo de alta sin fotos reales**.
- Sin `hasMerchantReturnPolicy` hasta que se decida la política de devoluciones.
- `shippingDestination` es ES, así que las islas se excluyen en la configuración de envío de Merchant Center.

### D5. Medición (implementado)

- Eventos: `hero_cta_click`, `pricing_view`, `checkout_step_1`, `business_selected`, `checkout_redirect` y `purchase`. Van a `dataLayer` y a `gtag` si hay consentimiento.
- Los UTM, `gclid`, `gbraid`, `wbraid`, `oppref` y el consentimiento viajan en la URL hasta `/api/checkout` y se guardan en la metadata de Stripe y en `orders.attribution`. Con consentimiento de marketing se recuerdan en sessionStorage.
- El OpenAI Pixel tiene un hueco marcado en `src/scripts/analytics.ts`, porque su fragmento oficial no está documentado públicamente.
- **Pendiente:** conversiones desde el servidor (Conversions API de OpenAI y conversiones offline de Google Ads) en el webhook. El pedido ya guarda los identificadores necesarios; mientras tanto, el webhook de n8n recibe el pedido completo.

### D6. Tarjeta física

- URL grabada: `https://[DOMINIO]/t/[código]`. El dominio no puede caducar.
- El código tiene 8 caracteres base62 con `crypto.getRandomValues` y rechazo de sesgo, y es único en la base de datos.
- Por decisión D9 se genera **un código por tarjeta al pagar**. El email al propietario lista las URL para grabar (a mano con NFC Tools o por el proveedor), y después hay que **bloquear** el chip.

### D7. Posicionamiento

Rapidez, honestidad (precio real, sin cifras infladas y una FAQ que explica que la tarjeta no filtra opiniones), comprobar tu ficha antes de pagar («Probar enlace»), factura con NIF, cambio de destino gratis y estética propia.

### D8. Dirección de diseño (aplicada)

- **Paleta:** Papel #F4F5F2, Mostrador #E7E9E4, Tinta #17191A, Grafito #5B6166 y Línea #CFD3CD. Verde pedido #0A6B52 (hover #085A45) solo en acciones de compra. Error #A1260D.
- **Tipografía:** Chivo; H1 de 28 px en móvil y 46 px en escritorio. Todo alineado a la izquierda.
- **Primer pantallazo móvil:** producto, precio y botón visibles; el botón termina hacia los 600 px en 390×844. Subtítulo de 2 líneas como máximo.
- `[hidden]` lleva `display: none !important` en `global.css`, porque los componentes definen `display`.

### D9. Decisiones tomadas por Claude sin consulta (15/09/2026, a petición del propietario)

Todas reversibles. Dónde cambiarlas entre paréntesis.

1. **Nombre provisional «Ficha Viva»** y dominio `fichaviva.es`, que parecía libre en DNS (`src/config/site.ts`, `SITE_URL`). Email provisional `hola@fichaviva.es`.
2. **Titular B:** «Más reseñas en Google de los clientes que ya tienes» (JSON de producto).
3. **Diseño del plan de la Fase 1** aprobado tal cual.
4. **Soporte a 39 €, un único pack. PRECIO PROVISIONAL**, marcado con `provisionalPrice: true`; en desarrollo se ve un aviso (`src/content/products/soporte-nfc-resenas-google.json`).
5. **Especificaciones de la tarjeta:** PVC de 85 × 54 mm, bloqueada contra escritura. Confirmar con el proveedor.
6. **48 h laborables** en toda la web; confirmar que se cumplen con personalización.
7. **Un código por tarjeta generado al pagar** (no lotes pregrabados). Si el proveedor entrega lotes con códigos ya grabados, habría que importar esos códigos a `cards` y asignarlos al preparar el pedido.
8. **Un negocio por pedido.**
9. **Alojamiento en Cloudflare Workers:** gratis con uso comercial, respuesta rápida en `/t/` y dueño de Astro.
10. **Emails con Resend**; n8n opcional.
11. **GA4, Google Ads y OpenAI Pixel** preparados, pero sin IDs no se carga nada.
12. **Límite de envío:** Stripe solo restringe por país. Los códigos postales 07, 35, 38, 51 y 52 marcan el pedido como `needs_review` con una nota para el propietario (no hay reembolso automático).
13. **Guías SEO y herramienta gratuita de enlace y QR:** no construidas; quedan para después del lanzamiento.

### D10. Cambios en el esquema respecto al brief

- `orders.utm` pasa a `orders.attribution`, que también guarda los click IDs y el consentimiento.
- Se añaden `billing`, `notes`, `notified_at`, `shipped_at` (trigger) y `updated_at`.
- Nuevo estado `needs_review`, para enlaces manuales o direcciones fuera de zona.
- En `businesses`: `maps_url` y `needs_manual_review`; `place_id` puede ser null en pedidos manuales.
- Vista `pending_orders` para trabajar desde el panel de Supabase.
- **Idempotencia del webhook:**
  - `stripe_session_id` es único; si falla la inserción por duplicado, se devuelve el pedido existente.
  - Las tarjetas se crean si el pedido es nuevo, o si pasó 1 minuto sin crearlas (recuperación).
  - Los avisos solo se envían si `notified_at` es null.

## Operaciones sin panel

Detalladas para el propietario en README, sección 5: pedidos pendientes (vista `pending_orders`), programar y bloquear con NFC Tools, marcar como enviado (`status = shipped`), cambiar el destino (`cards.destination_url`), desactivar una tarjeta (`active = false`) y revisar pedidos `needs_review`.

## Pendiente del propietario

1. Confirmar o cambiar el nombre y comprar el dominio con renovación automática.
2. Confirmar el precio del soporte (39 € provisional) y sus packs.
3. Confirmar las 48 h con personalización y las especificaciones de la tarjeta con el proveedor.
4. Saber si el proveedor graba y bloquea el chip con la URL única, o si lo hace el propietario.
5. Fotos reales de tarjeta y soporte, antes de Merchant Center y para la galería.
6. Datos del titular y revisión profesional de los legales, incluida la opción de desistimiento.
7. Crear cuentas y claves: Stripe, Supabase, Google Cloud, Resend y Cloudflare (README, secciones 3 y 4).
8. Probar con tarjetas de test en el dominio real: pago correcto, rechazado, abandono y reenvío del webhook.
9. Decidir si se construyen las guías SEO y la herramienta gratuita de enlace y QR.
