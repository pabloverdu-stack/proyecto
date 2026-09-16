import { formatEuros } from '../config/site';
import { isGoogleMapsUrl, reviewUrlFor } from '../lib/codes';
import type { ClientCatalog } from '../lib/products';
import { getAttribution } from './attribution';
import { readConsent } from './consent';
import { track } from './track';

interface Business {
  placeId: string | null;
  name: string;
  address: string | null;
  mapsUrl: string | null;
}

interface SearchResult {
  placeId: string;
  name: string;
  address: string;
}

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;

const form = document.querySelector<HTMLFormElement>('[data-order-form]');
const catalogEl = document.getElementById('catalogo-pedido');

if (form && catalogEl) {
  const catalog = JSON.parse(catalogEl.textContent || '[]') as ClientCatalog;
  const params = new URLSearchParams(location.search);
  const product = catalog.find((p) => p.id === params.get('producto')) ?? catalog.find((p) => p.featured) ?? catalog[0]!;
  const pack =
    product.packs.find((p) => p.id === params.get('pack')) ?? product.packs.find((p) => p.recommended) ?? product.packs[0]!;

  const input = $<HTMLInputElement>('[data-search]');
  const searchField = input.closest<HTMLElement>('.field')!;
  const list = $<HTMLUListElement>('[data-results]');
  const status = $<HTMLElement>('[data-search-status]');
  const selectedBox = $<HTMLElement>('[data-selected]');
  const selectedName = $<HTMLElement>('[data-selected-name]');
  const selectedAddress = $<HTMLElement>('[data-selected-address]');
  const testLink = $<HTMLAnchorElement>('[data-test-link]');
  const testHint = $<HTMLElement>('[data-test-hint]');
  const manual = $<HTMLDetailsElement>('[data-manual]');
  const manualName = $<HTMLInputElement>('[data-manual-name]');
  const manualUrl = $<HTMLInputElement>('[data-manual-url]');
  const errorBox = $<HTMLElement>('[data-error]');
  const submit = $<HTMLButtonElement>('[data-submit]');
  const defaultTestHint = testHint.textContent ?? '';

  const plural = pack.units === 1 ? product.unit.singular : product.unit.plural;
  $<HTMLElement>('[data-summary-units]').textContent = `${pack.units} ${plural}`;
  $<HTMLElement>('[data-summary-price]').textContent = formatEuros(pack.priceCents);
  $<HTMLAnchorElement>('[data-summary-change]').href = `${product.url}?pack=${pack.id}`;
  const submitLabel = pack.units === 1 ? `Pedir mi ${product.unit.singular}` : `Pedir mis ${pack.units} ${product.unit.plural}`;
  submit.textContent = submitLabel;
  if (params.get('cancelado')) $<HTMLElement>('[data-cancelled]').hidden = false;

  track('checkout_step_1', { product: product.id, pack: pack.id, value: pack.priceCents / 100, currency: 'EUR' });

  const sessionToken = crypto.randomUUID();
  let selected: Business | null = null;
  let results: SearchResult[] = [];
  let active = -1;
  let timer: number | undefined;
  let controller: AbortController | undefined;
  let manualTracked = false;

  const showError = (message: string) => {
    errorBox.textContent = message;
    errorBox.hidden = false;
  };

  const setOpen = (open: boolean) => {
    list.hidden = !open;
    input.setAttribute('aria-expanded', String(open));
    if (!open) {
      active = -1;
      input.removeAttribute('aria-activedescendant');
    }
  };

  const highlight = (index: number) => {
    const options = [...list.children] as HTMLElement[];
    active = (index + options.length) % options.length;
    options.forEach((option, i) => option.setAttribute('aria-selected', String(i === active)));
    const current = options[active];
    if (current) {
      input.setAttribute('aria-activedescendant', current.id);
      current.scrollIntoView({ block: 'nearest' });
    }
  };

  const currentBusiness = (): Business | null => {
    if (selected) return selected;
    if (!manual.open) return null;
    const name = manualName.value.trim();
    const url = manualUrl.value.trim();
    return name && isGoogleMapsUrl(url) ? { placeId: null, name, address: null, mapsUrl: url } : null;
  };

  const refresh = () => {
    submit.disabled = !currentBusiness();
  };

  const choose = (result: SearchResult) => {
    selected = { placeId: result.placeId, name: result.name, address: result.address || null, mapsUrl: null };
    const demo = result.placeId.startsWith('DEMO-');
    selectedName.textContent = result.name;
    selectedAddress.textContent = result.address;
    testLink.href = demo ? '#' : reviewUrlFor(result.placeId);
    testLink.dataset.demo = demo ? '1' : '';
    testHint.textContent = demo
      ? 'Modo demo: sin clave de Google Places no hay ficha real que abrir.'
      : defaultTestHint;
    setOpen(false);
    selectedBox.hidden = false;
    searchField.hidden = true;
    manual.hidden = true;
    manual.open = false;
    errorBox.hidden = true;
    refresh();
    track('business_selected', { source: 'google_places', product: product.id });
    selectedName.setAttribute('tabindex', '-1');
    selectedName.focus();
  };

  const render = () => {
    list.replaceChildren(
      ...results.map((result, index) => {
        const option = document.createElement('li');
        option.id = `negocio-${index}`;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        const name = document.createElement('span');
        name.className = 'result-name';
        name.textContent = result.name;
        const address = document.createElement('span');
        address.className = 'result-address';
        address.textContent = result.address;
        option.append(name, address);
        option.addEventListener('mousedown', (event) => event.preventDefault());
        option.addEventListener('click', () => choose(result));
        return option;
      }),
    );
    setOpen(results.length > 0);
  };

  const search = async (query: string) => {
    controller?.abort();
    controller = new AbortController();
    status.textContent = 'Buscando…';
    try {
      const response = await fetch(`/api/places?${new URLSearchParams({ q: query, session: sessionToken })}`, {
        signal: controller.signal,
      });
      const data = (await response.json()) as { results?: SearchResult[]; error?: string };
      if (!response.ok) throw new Error(data.error);
      results = data.results ?? [];
      render();
      status.textContent = results.length
        ? `${results.length} resultados. Elige el tuyo.`
        : 'No lo encontramos. Prueba con el nombre y la ciudad, o usa la opción de pegar el enlace.';
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setOpen(false);
      status.textContent = (error as Error).message || 'No hemos podido buscar. Inténtalo de nuevo.';
    }
  };

  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    const query = input.value.trim();
    if (query.length < 3) {
      setOpen(false);
      status.textContent = '';
      return;
    }
    timer = window.setTimeout(() => void search(query), 250);
  });

  input.addEventListener('keydown', (event) => {
    if (list.hidden) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      highlight(active + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter' && active >= 0 && results[active]) {
      event.preventDefault();
      choose(results[active]!);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  });

  input.addEventListener('blur', () => window.setTimeout(() => setOpen(false), 120));

  testLink.addEventListener('click', (event) => {
    if (testLink.dataset.demo) event.preventDefault();
  });

  $<HTMLButtonElement>('[data-change-business]').addEventListener('click', () => {
    selected = null;
    selectedBox.hidden = true;
    searchField.hidden = false;
    manual.hidden = false;
    input.value = '';
    status.textContent = '';
    refresh();
    input.focus();
  });

  manual.addEventListener('toggle', refresh);
  [manualName, manualUrl].forEach((field) =>
    field.addEventListener('input', () => {
      errorBox.hidden = true;
      refresh();
      if (!manualTracked && currentBusiness()) {
        manualTracked = true;
        track('business_selected', { source: 'manual', product: product.id });
      }
    }),
  );
  manualUrl.addEventListener('blur', () => {
    const value = manualUrl.value.trim();
    if (value && !isGoogleMapsUrl(value)) showError('Ese enlace no parece de Google Maps. Cópialo desde el botón «Compartir» de tu ficha.');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const business = currentBusiness();
    if (!business) {
      showError('Elige tu negocio de la lista o pega el enlace de tu ficha de Google Maps.');
      return;
    }
    errorBox.hidden = true;
    submit.disabled = true;
    submit.textContent = 'Abriendo el pago…';
    const consent = readConsent();
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          packId: pack.id,
          business,
          attribution: getAttribution(),
          consent: consent ? { analytics: consent.analytics, marketing: consent.marketing } : null,
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error);
      track('checkout_redirect', { product: product.id, pack: pack.id, value: pack.priceCents / 100, currency: 'EUR' });
      location.assign(data.url);
    } catch (error) {
      showError((error as Error).message || 'No hemos podido abrir el pago. Inténtalo de nuevo.');
      submit.disabled = false;
      submit.textContent = submitLabel;
    }
  });

  // Al volver atrás desde Stripe, el navegador puede restaurar el botón en estado "Abriendo el pago…".
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    submit.textContent = submitLabel;
    refresh();
  });
}
