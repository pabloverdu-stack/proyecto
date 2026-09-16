# Ficha Viva

Tienda de la tarjeta NFC de reseñas de Google (y del soporte de mostrador). Hecha con Astro, Stripe, Supabase y Cloudflare.

- **Encargo completo:** [docs/brief-original.md](docs/brief-original.md)
- **Decisiones y estado del proyecto:** [CLAUDE.md](CLAUDE.md)
- **Plan de diseño:** [docs/fase-1-plan-diseno.html](docs/fase-1-plan-diseno.html)

---

## Qué funciona ya

- Ficha de la tarjeta en la portada y ficha del soporte, página de productos, pedido, confirmación, redirección de tarjetas (`/t/código`), textos legales en borrador, aviso de cookies, medición y SEO.
- **Modo demo:** sin ninguna clave, en tu ordenador puedes hacer un pedido completo. El pago se simula, se crean las tarjetas y puedes abrir su `/t/código`. Nada se guarda al cerrar.
- Probado: flujo completo en demo, capturas en móvil y escritorio, y Lighthouse en móvil con 99-100 en rendimiento, accesibilidad, buenas prácticas y SEO.

## Qué te falta a ti antes de vender

Marca cada casilla cuando lo tengas:

- [ ] Confirmar o cambiar el nombre (**Ficha Viva** es provisional) y comprar el dominio.
- [ ] Confirmar el precio del soporte (**39 € es provisional**) y si las 48 h se cumplen con personalización.
- [ ] Rellenar los datos entre [CORCHETES] de los textos legales y que los revise tu asesor.
- [ ] Hacer fotos reales de la tarjeta y del soporte.
- [ ] Crear las cuentas: Stripe, Supabase, Google Cloud, Resend y Cloudflare (pasos abajo).
- [ ] Probar un pago de prueba de principio a fin con la web publicada.

---

## 1. Ver la web en tu ordenador

1. Instala **Node.js LTS**: entra en <https://nodejs.org>, descarga la versión «LTS» e instálala con las opciones por defecto.
2. Abre la carpeta del proyecto en el Explorador de archivos, haz clic derecho en un hueco vacío y elige **Abrir en Terminal**.
3. Instala las dependencias (solo la primera vez):

   ```bash
   npm install
   ```

4. Arranca la web:

   ```bash
   npm run dev
   ```

5. Abre <http://localhost:4321> en el navegador. Cada vez que guardes un archivo, la página se actualiza sola.
6. Para pararla:

   ```bash
   npx astro dev stop
   ```

> Durante el desarrollo usé una copia portátil de Node.js en la carpeta `.tools`. Cuando tengas Node.js instalado puedes borrarla.

### Probar un pedido en modo demo

1. Con `npm run dev` en marcha, en la portada elige un pack y pulsa **Pedir mi tarjeta**.
2. Escribe cualquier nombre de negocio (al menos 3 letras) y elige un resultado de ejemplo.
3. Pulsa **Pedir mis 2 tarjetas**. Irás a la confirmación con las URL de las tarjetas creadas.
4. Abre una de esas URL: te redirige a Google (en demo, a una ficha que no existe).

---

## 2. Cambiar textos, precios y nombre

| Qué quieres cambiar | Archivo |
|---|---|
| Nombre de la marca, email, zona de envío | `src/config/site.ts` |
| Titular, precios, packs, qué incluye | `src/content/products/*.json` |
| Preguntas frecuentes | `src/content/faq.ts` |
| Colores, tamaños de letra, espaciados | `src/styles/tokens.css` |
| Textos legales | `src/pages/aviso-legal.astro`, `privacidad.astro`, `cookies.astro`, `condiciones.astro` |

Si cambias un precio, hazlo **en el JSON y en Stripe**: después de editar el JSON ejecuta `npm run stripe:setup` (paso 3.2).

Para añadir un producto nuevo, copia uno de los JSON de `src/content/products`, cambia el nombre del archivo (será su URL) y sus datos. Aparecerá solo en «Productos».

---

## 3. Poner en marcha los servicios

Todas las claves van en un archivo `.env` que **nunca** se sube a internet.

1. Copia `.env.example` y llama a la copia `.env`.
2. Ve rellenando los valores con los pasos de abajo.

> Los menús de estas webs cambian a veces de nombre. Si no encuentras algo exactamente así, busca la opción con un nombre parecido.

### 3.1 Dominio

1. Compra el dominio (por ejemplo, `fichaviva.es`) en cualquier registrador acreditado.
2. **Activa la renovación automática** y paga varios años. Si el dominio caduca, todas las tarjetas vendidas dejan de funcionar.
3. En `.env`, pon `SITE_URL=https://tudominio.es`.

### 3.2 Stripe (pagos), en modo test

1. Crea tu cuenta en <https://dashboard.stripe.com/register>.
2. Activa el **modo de prueba** (interruptor «Test mode» o «Entorno de prueba»).
3. Ve a **Desarrolladores > Claves de API** y copia la **clave secreta** (`sk_test_…`) en `STRIPE_SECRET_KEY`.
4. En la terminal, crea los productos y precios:

   ```bash
   npm run stripe:setup
   ```

5. Ve a **Configuración > Detalles públicos de la empresa** y rellena la **URL de las condiciones del servicio** con `https://tudominio.es/condiciones`. Sin esto, el pago da error.
6. En **Configuración > Métodos de pago**, comprueba que están activados tarjeta, Apple Pay y Google Pay.
7. En **Configuración > Emails de clientes**, activa los recibos de pagos correctos.
8. El webhook se configura después de publicar la web (paso 4, punto 6).

### 3.3 Supabase (base de datos)

1. Crea una cuenta en <https://supabase.com> y un proyecto nuevo. En la región, elige una de la **Unión Europea** (por ejemplo, Frankfurt).
2. Abre **SQL Editor > New query**, pega todo el archivo `supabase/migrations/0001_inicial.sql` y pulsa **Run**.
3. Ve a **Project Settings > API** y copia:
   - la **Project URL** en `SUPABASE_URL`;
   - la clave **service_role** (secreta) en `SUPABASE_SERVICE_ROLE_KEY`.

### 3.4 Google Places (buscador de negocios)

1. Entra en <https://console.cloud.google.com> y crea un proyecto.
2. Activa la **facturación**. Google la exige, pero tiene un uso gratuito mensual; un negocio pequeño normalmente no llega a pagar.
3. En **APIs y servicios > Biblioteca**, busca **Places API (New)** y actívala.
4. En **APIs y servicios > Credenciales**, crea una **clave de API**.
5. Edita la clave y en **Restricciones de API** deja marcada solo **Places API (New)**.
6. Copia la clave en `GOOGLE_PLACES_API_KEY`.

### 3.5 Resend (emails)

1. Crea una cuenta en <https://resend.com>.
2. Añade tu dominio y copia los registros DNS que te indica en tu registrador (o en Cloudflare, si ya lo usas).
3. Crea una **API key** y cópiala en `RESEND_API_KEY`.
4. Rellena `EMAIL_FROM` (por ejemplo, `Ficha Viva <pedidos@tudominio.es>`) y `OWNER_EMAIL` (tu email, donde te llegará cada pedido con las URL que hay que grabar).
5. Opcional: si usas n8n, pon la URL de tu webhook en `N8N_WEBHOOK_URL`. Recibirá cada pedido pagado.

---

## 4. Publicar en Cloudflare

1. Crea una cuenta en <https://dash.cloudflare.com/sign-up>.
2. Conecta tu ordenador con tu cuenta (se abrirá el navegador para dar permiso):

   ```bash
   npx wrangler login
   ```

3. Guarda las claves secretas en Cloudflare. Ejecuta este comando una vez por cada clave; te pedirá que pegues su valor:

   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY
   ```

   Repite con `STRIPE_WEBHOOK_SECRET` (cuando lo tengas, punto 6), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_PLACES_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAIL` y, si lo usas, `N8N_WEBHOOK_URL`.

4. Publica la web (`SITE_URL` y las variables `PUBLIC_…` se leen de tu `.env` al compilar):

   ```bash
   npm run deploy
   ```

5. Conecta tu dominio:
   1. En Cloudflare, **Añade tu dominio** y sigue los pasos. Te dará dos servidores de nombres.
   2. En tu registrador, sustituye los servidores de nombres por los de Cloudflare (tarda unas horas).
   3. En **Workers y Pages > ficha-viva > Configuración > Dominios y rutas**, añade tu dominio como **dominio personalizado**.
6. Configura el webhook de Stripe (en modo test):
   1. En Stripe, **Desarrolladores > Webhooks > Añadir destino**.
   2. URL: `https://tudominio.es/api/stripe-webhook`.
   3. Eventos: `checkout.session.completed` y `checkout.session.async_payment_succeeded`.
   4. Copia el **secreto de firma** (`whsec_…`) y guárdalo con `npx wrangler secret put STRIPE_WEBHOOK_SECRET`.
7. Haz un pedido de prueba en tu dominio con estas tarjetas de test de Stripe (cualquier fecha futura y cualquier CVC):
   - Pago correcto: `4242 4242 4242 4242`
   - Pago rechazado: `4000 0000 0000 0002`
   - Con verificación 3D Secure: `4000 0025 0000 3155`

   Comprueba que llega el email, que el pedido aparece en Supabase y que su `/t/código` abre la reseña. En Stripe, dentro del webhook, puedes **reenviar** el evento para comprobar que no se duplica nada.
8. Cuando todo funcione y quieras cobrar de verdad, repite los pasos 3.2 y 4.6 con las claves **live** y ejecuta `npm run stripe:setup -- --live`.

---

## 5. El día a día, sin panel de administración

### Ver los pedidos pendientes

En Supabase, **Table Editor > pending_orders**. Muestra los pedidos pagados y sin enviar, con el negocio, los datos de envío y los códigos de sus tarjetas.

### Programar y bloquear una tarjeta

Cada pedido te llega por email con una URL por tarjeta, del tipo `https://tudominio.es/t/Ab3dE9xZ`.

1. Instala en tu móvil la app **NFC Tools**.
2. **Escribir > Añadir un registro > URL**, pega la URL de la tarjeta y pulsa **Escribir**. Acerca la tarjeta.
3. Comprueba que al acercar el móvil se abre la reseña del negocio.
4. Bloquéala: **Otros > Bloquear la etiqueta**. Es irreversible, así que hazlo después de comprobarla. Sin bloquear, cualquiera podría cambiarle el enlace.
5. El QR impreso debe llevar **la misma URL**.

Si el proveedor graba y bloquea las tarjetas por ti, pásale esas URL.

### Marcar un pedido como enviado

En Supabase, **Table Editor > orders**, busca el pedido y cambia `status` a `shipped`. La fecha de envío se guarda sola.

### Cambiar el destino de una tarjeta

1. En Supabase, **Table Editor > cards**, busca la fila por su `code`.
2. Cambia `destination_url` por el nuevo enlace de reseña: `https://search.google.com/local/writereview?placeid=ID_DEL_SITIO`.
3. Guarda. El cambio funciona al instante, sin tocar la tarjeta.

Para desactivar una tarjeta perdida, pon `active` en `false`.

### Pedidos que hay que revisar

Si un pedido tiene `status = needs_review`, lee la columna `notes`. Aparece cuando el cliente pegó el enlace a mano o la dirección está fuera de la península (en ese caso, contacta o reembolsa desde Stripe y pon `status = refunded`).

---

## 6. Medición, anuncios y buscadores

- **Google Analytics 4:** crea una propiedad y pon su ID (`G-…`) en `PUBLIC_GA4_ID`.
- **Google Ads:** pon el ID de conversión (`AW-…`) en `PUBLIC_GOOGLE_ADS_ID` y la etiqueta de la conversión de compra en `PUBLIC_GOOGLE_ADS_PURCHASE_LABEL`.
- **ChatGPT Ads:** pon el ID del píxel en `PUBLIC_OPENAI_PIXEL_ID` y pega el fragmento oficial de Ads Manager en el hueco marcado de `src/scripts/analytics.ts`.
- Con cualquiera de esos IDs aparece el aviso de cookies y **nada se carga sin consentimiento**. Tras cambiarlos, vuelve a publicar con `npm run deploy`.
- **Google Search Console** y **Bing Webmaster Tools** (la búsqueda de ChatGPT se apoya en parte en Bing): da de alta tu dominio y envía `https://tudominio.es/sitemap-index.xml`.
- **Google Merchant Center:** el feed de productos está en `https://tudominio.es/feeds/google-merchant.xml`. **No lo des de alta hasta tener fotos reales**; ahora usa la imagen para compartir en redes y Google la rechazaría.

---

## 7. Comandos

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Web en tu ordenador, en <http://localhost:4321> |
| `npm run build` | Compilar la versión de producción |
| `npm run preview` | Probar la versión de producción en <http://localhost:4322> |
| `npm run deploy` | Compilar y publicar en Cloudflare |
| `npm run check` | Buscar errores de código |
| `npm run stripe:setup` | Crear o actualizar productos y precios en Stripe |
| `npm run test:flujo` | Probar el pedido completo en modo demo (con `npm run dev` en marcha) |
| `npm run shots` | Capturas de todas las páginas en `qa/capturas` (con `npm run dev` en marcha) |
| `npm run lighthouse` | Auditoría Lighthouse en `qa/lighthouse` (con `npm run preview` en marcha) |
| `npm run imagenes` | Regenerar la imagen para redes y el icono (con `npm run dev` en marcha) |

---

## 8. Problemas frecuentes

- **Error «The file does not exist … optimize deps directory»:** pasa si instalas algo o compilas con `npm run dev` encendido. Para la web con `npx astro dev stop`, borra la carpeta `node_modules/.vite` y vuelve a ejecutar `npm run dev`.
- **Al pedir sale «No podemos cobrar este pack ahora mismo»:** falta crear los precios en Stripe. Ejecuta `npm run stripe:setup`.
- **El pago da error nada más pulsar el botón:** revisa que pusiste la URL de las condiciones en Stripe (paso 3.2, punto 5).
- **Los pedidos no aparecen en Supabase:** revisa el webhook en Stripe (paso 4, punto 6) y que `STRIPE_WEBHOOK_SECRET` está guardado en Cloudflare.
