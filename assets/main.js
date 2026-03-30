// ── Form submit ──────────────────────────────────────────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  const note = document.getElementById('formNote');
  note.textContent = '✓ Message sent. We\'ll be in touch soon.';
  note.style.color = 'var(--gold)';
  e.target.reset();
}

// Attach to form if it exists on the page
const contactForm = document.querySelector('form');
if (contactForm) contactForm.addEventListener('submit', handleSubmit);


// ── Slider ────────────────────────────────────────────────────────────────────
const track         = document.getElementById('sliderTrack');
const outer         = document.getElementById('sliderOuter');
const slides        = track.querySelectorAll('.slide');
const dotsContainer = document.getElementById('sliderDots');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');

let current      = 0;
let visibleCount = 3;
const total      = slides.length;

function getVisibleCount() {
  const w = window.innerWidth;
  if (w < 600) return 1;
  if (w < 900) return 2;
  return 3;
}

function getSlideWidth() {
  // Always use the current visibleCount, not a stale closure value
  const gap = parseFloat(getComputedStyle(track).gap) || 25.6;
  return (outer.offsetWidth + gap) / visibleCount;
}

function maxIndex() {
  return Math.max(0, total - visibleCount);
}

function goTo(idx, animated = true) {
  current = Math.max(0, Math.min(idx, maxIndex()));
  track.style.transition = animated ? 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
  track.style.transform  = `translateX(-${current * getSlideWidth()}px)`;
  updateDots();
}

function buildDots() {
  dotsContainer.innerHTML = '';
  const count = maxIndex() + 1;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === current ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }
}

function updateDots() {
  dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === current);
  });
}

prevBtn.addEventListener('click', () => goTo(current - 1));
nextBtn.addEventListener('click', () => goTo(current + 1));


// ── Drag / swipe ─────────────────────────────────────────────────────────────
let startX     = 0;
let isDragging = false;

outer.addEventListener('mousedown', e => {
  startX     = e.clientX;
  isDragging = true;
  track.style.transition = 'none'; // disable transition while dragging
});

window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dx = e.clientX - startX;
  track.style.transform = `translateX(${-current * getSlideWidth() + dx}px)`;
});

window.addEventListener('mouseup', e => {
  if (!isDragging) return;
  isDragging = false;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 60) {
    goTo(dx < 0 ? current + 1 : current - 1);
  } else {
    goTo(current); // snap back with animation
  }
});

// Prevent click-through on drag release
outer.addEventListener('click', e => {
  if (Math.abs(e.clientX - startX) > 5) e.preventDefault();
});

outer.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
}, { passive: true });

outer.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
  else goTo(current);
}, { passive: true });


// ── Init + resize ─────────────────────────────────────────────────────────────
function init() {
  visibleCount = getVisibleCount();
  // Clamp current index in case visible count changed
  current = Math.min(current, maxIndex());
  buildDots();
  goTo(current, false); // no animation on init/resize
}

window.addEventListener('resize', init);
init();


// ── Keyboard ──────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  goTo(current - 1);
  if (e.key === 'ArrowRight') goTo(current + 1);
});

