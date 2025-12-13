const counters = document.querySelectorAll('.counter');
let animated = false; // flag to ensure animation runs only once

// Animate all counters simultaneously so they start and finish together.
function animateAllCounters(duration = 1500) {
  if (!counters || counters.length === 0) return;
  if (animated) return; // prevent re-animation
  animated = true;

  const targets = Array.from(counters).map((el) => Number(el.getAttribute('data-target')) || 0);
  // default per-counter start values (index order)
  const defaultStarts = [0, 100, 1000, 200000];
  const starts = Array.from(counters).map((el, i) => {
    const ds = el.getAttribute('data-start');
    if (ds !== null) return Number(ds);
    return defaultStarts[i] !== undefined ? defaultStarts[i] : (targets[i] >= 2 ? 2 : 0);
  });

  // set initial visible values
  counters.forEach((el, i) => (el.innerText = starts[i].toLocaleString()));
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);

    counters.forEach((el, i) => {
      const s = starts[i];
      const value = Math.floor(s + (targets[i] - s) * progress);
      el.innerText = value.toLocaleString();
    });

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // ensure final exact targets
      counters.forEach((el, i) => (el.innerText = targets[i].toLocaleString()));
    }
  }

  requestAnimationFrame(step);
}

// Use Intersection Observer to trigger animation when counter section scrolls into view
function setupScrollTrigger() {
  const counterCot = document.querySelector('.counter-cot');
  if (!counterCot) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateAllCounters();
          observer.unobserve(counterCot); // stop observing after animation triggers
        }
      });
    },
    { threshold: 0.3 } // trigger when 30% of the element is visible
  );

  observer.observe(counterCot);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupScrollTrigger);
} else {
  setupScrollTrigger();
}
