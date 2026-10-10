const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Flying ring opening sequence: let the construct complete a full pass before revealing the page.
const loader = document.getElementById('site-loader');
if (loader) {
  const startedAt = performance.now();
  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    loader.classList.add('is-leaving');
    window.setTimeout(() => loader.remove(), 800);
  };
  const ready = () => window.setTimeout(dismiss, Math.max(0, 3200 - (performance.now() - startedAt)));
  if (reduceMotion) dismiss();
  else if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready, { once: true });
  window.setTimeout(dismiss, 5500);
}

document.getElementById('year').textContent = new Date().getFullYear();

// Navigation panel for compact screens.
const menuButton = document.querySelector('.menu-toggle');
const primaryNav = document.getElementById('primary-nav');
const closeMenu = () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  primaryNav?.classList.remove('is-open');
};
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  primaryNav.classList.toggle('is-open', open);
});
primaryNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

// Scroll progress and reveal-on-entry motion.
const progress = document.querySelector('.progress-line span');
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
};
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();
const revealItems = document.querySelectorAll('[data-reveal]');
if (reduceMotion || !('IntersectionObserver' in window)) revealItems.forEach((item) => item.classList.add('is-visible'));
else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

// Animated achievement counters.
const counters = document.querySelectorAll('[data-count]');
const runCounter = (element) => {
  const end = Number(element.dataset.count);
  const decimals = Number(element.dataset.decimals || 0);
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / 1400, 1);
    element.textContent = (end * (1 - (1 - t) ** 3)).toFixed(decimals);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
if (reduceMotion || !('IntersectionObserver' in window)) counters.forEach((el) => { el.textContent = Number(el.dataset.count).toFixed(Number(el.dataset.decimals || 0)); });
else {
  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      runCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.65 });
  counters.forEach((counter) => countObserver.observe(counter));
}

// Project focus filters and pointer-responsive construct panels.
const filterButtons = document.querySelectorAll('.filter-chip');
const projectCards = document.querySelectorAll('.project-card');
filterButtons.forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filterButtons.forEach((chip) => {
    const active = chip === button;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
  projectCards.forEach((card) => {
    const domains = card.dataset.category.split(/\s+/);
    card.hidden = filter !== 'all' && !domains.includes(filter);
  });
}));
projectCards.forEach((card) => card.addEventListener('pointermove', (event) => {
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
  card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
}));

// Flip education construct between degree and term-by-term results.
const eduCard = document.getElementById('edu-card');
const flipEducation = () => {
  const flipped = eduCard.classList.toggle('is-flipped');
  eduCard.setAttribute('aria-pressed', String(flipped));
  eduCard.querySelector('.edu-front').setAttribute('aria-hidden', String(flipped));
  eduCard.querySelector('.edu-back').setAttribute('aria-hidden', String(!flipped));
};
eduCard?.addEventListener('click', flipEducation);
eduCard?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); flipEducation(); }
});

// Activate the ring's willpower pulse on demand.
document.getElementById('ring-trigger')?.addEventListener('click', (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  document.documentElement.style.setProperty('--flash-x', `${rect.left + rect.width / 2}px`);
  document.documentElement.style.setProperty('--flash-y', `${rect.top + rect.height / 2}px`);
  document.body.classList.remove('energy-active');
  requestAnimationFrame(() => document.body.classList.add('energy-active'));
  window.setTimeout(() => document.body.classList.remove('energy-active'), 900);
});

// Click a photo or certificate to inspect it in the image chamber.
const lightbox = document.getElementById('lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('p');
const closeLightbox = () => { lightbox.hidden = true; lightboxImage.src = ''; };
document.addEventListener('click', (event) => {
  const image = event.target.closest('.gallery-track img, .cert-grid img');
  if (!image) return;
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.alt.toUpperCase();
  lightbox.hidden = false;
});
lightbox.querySelector('button').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !lightbox.hidden) closeLightbox(); });

// Drop unavailable gallery items and the navigation link if the whole archive is empty.
const gallery = document.getElementById('gallery');
const galleryImages = gallery.querySelectorAll('.gallery-track img');
const hideEmptyGallery = () => {
  if (gallery.querySelector('.gallery-track figure')) return;
  gallery.hidden = true;
  document.getElementById('nav-gallery').hidden = true;
};
galleryImages.forEach((image) => image.addEventListener('error', () => {
  image.closest('figure').remove();
  hideEmptyGallery();
}));
galleryImages.forEach((image) => { if (image.complete && image.naturalWidth === 0) image.closest('figure').remove(); });
hideEmptyGallery();
