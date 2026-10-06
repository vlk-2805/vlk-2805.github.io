document.getElementById('year').textContent = new Date().getFullYear();

// Hero portrait: fall back to the placeholder if the file is missing.
const portrait = document.querySelector('.portrait');
if (portrait) portrait.addEventListener('error', () => portrait.remove());

// Gallery: drop figures whose image is missing; hide the section if none remain.
const gallery = document.getElementById('gallery');
const hideIfEmpty = () => {
  if (gallery.querySelector('figure')) return;
  gallery.hidden = true;
  document.getElementById('nav-gallery').hidden = true;
};
gallery.querySelectorAll('figure img').forEach((img) => {
  img.addEventListener('error', () => { img.closest('figure').remove(); hideIfEmpty(); });
});
// Covers images that already failed before the listeners attached.
gallery.querySelectorAll('figure img').forEach((img) => {
  if (img.complete && img.naturalWidth === 0) img.closest('figure').remove();
});
hideIfEmpty();

// Lightbox
const box = document.getElementById('lightbox');
const boxImg = box.querySelector('img');
document.addEventListener('click', (e) => {
  const img = e.target.closest('.gallery figure img, .cert-embed img');
  if (!img) return;
  boxImg.src = img.src;
  boxImg.alt = img.alt;
  box.hidden = false;
});
box.addEventListener('click', () => { box.hidden = true; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') box.hidden = true; });

// Count-up animation for the proof numbers (skipped for reduced motion).
const counters = document.querySelectorAll('[data-count]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const runCounter = (el) => {
  const end = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  const duration = 1600;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (end * eased).toFixed(decimals);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
if (reduceMotion || !('IntersectionObserver' in window)) {
  counters.forEach((el) => { el.textContent = parseFloat(el.dataset.count).toFixed(parseInt(el.dataset.decimals || '0', 10)); });
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      runCounter(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => io.observe(el));
}

// Education card: click / Enter / Space flips between the degree and the GPA breakdown.
const eduCard = document.getElementById('edu-card');
if (eduCard) {
  const flip = () => {
    const on = eduCard.classList.toggle('is-flipped');
    eduCard.setAttribute('aria-pressed', String(on));
    eduCard.querySelector('.flip-front').setAttribute('aria-hidden', String(on));
    eduCard.querySelector('.flip-back').setAttribute('aria-hidden', String(!on));
  };
  eduCard.addEventListener('click', flip);
  eduCard.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });
}
