// Animación de la escena principal. GSAP se descarga solo después de que la página se ha pintado
// y nunca si el visitante pidió reducir el movimiento.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

async function play(svg: Element) {
  const phone = svg.querySelector('.js-phone');
  const sheet = svg.querySelector('.js-sheet');
  const pulse = svg.querySelector('.js-pulse');
  if (!phone || !sheet) return;

  const { gsap } = await import('gsap');
  gsap.killTweensOf([phone, sheet, pulse].filter(Boolean));
  gsap.set(phone, { x: 0, y: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  tl.to(sheet, { opacity: 0, y: 24, duration: 0.35 })
    .to(phone, { x: 150, y: -18, duration: 0.7 }, '<')
    .to({}, { duration: 0.35 })
    .to(phone, { x: 0, y: 0, duration: 0.9, ease: 'power3.out' });
  if (pulse) {
    tl.fromTo(
      pulse,
      { opacity: 0.5, scale: 1, transformOrigin: '50% 50%' },
      { opacity: 0, scale: 2.4, duration: 0.7, ease: 'power1.out' },
      '-=0.15',
    );
  }
  tl.to(sheet, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, pulse ? '<0.1' : '>');
}

function init() {
  const scenes = document.querySelectorAll('[data-scene-animated]');
  if (!scenes.length || reduceMotion.matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        void play(entry.target);
      }
    },
    { threshold: 0.4 },
  );
  scenes.forEach((svg) => observer.observe(svg));

  document.querySelectorAll<HTMLButtonElement>('[data-scene-replay]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const target = document.getElementById(button.getAttribute('aria-controls') || '');
      if (target) void play(target);
    });
  });
}

const start = () => window.setTimeout(init, 500);
if (document.readyState === 'complete') start();
else window.addEventListener('load', start, { once: true });
