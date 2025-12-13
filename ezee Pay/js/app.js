(function () {
  const carousel = document.getElementById("carousel");
  const track = document.getElementById("track");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const dotsWrap = document.getElementById("dots");

  const originalSlides = Array.from(track.children);
  const countReal = originalSlides.length;

  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[countReal - 1].cloneNode(true);

  track.insertBefore(lastClone, track.firstChild);
  track.appendChild(firstClone);

  const slides = Array.from(track.children);
  let index = 1;

  track.style.transform = `translateX(${-index * 100}%)`;

  for (let i = 0; i < countReal; i++) {
    const d = document.createElement("div");
    d.className = "dot" + (i === 0 ? " active" : "");
    d.dataset.slide = i;
    dotsWrap.appendChild(d);
  }

  const dots = Array.from(dotsWrap.children);

  let isMoving = false;

  function update() {
    track.style.transition = "transform 450ms cubic-bezier(.22,.9,.12,1)";
    track.style.transform = `translateX(${-index * 100}%)`;
    updateDots();
  }

  function updateDots() {
    let dotIndex = index - 1;
    if (dotIndex < 0) dotIndex = countReal - 1;
    if (dotIndex >= countReal) dotIndex = 0;

    dots.forEach((d, i) => d.classList.toggle("active", i === dotIndex));
  }

  function goNext() {
    if (!isMoving) {
      isMoving = true;
      index++;
      update();
    }
  }
  function goPrev() {
    if (!isMoving) {
      isMoving = true;
      index--;
      update();
    }
  }

  nextBtn.onclick = goNext;
  prevBtn.onclick = goPrev;

  dots.forEach((d) => {
    d.onclick = () => {
      if (isMoving) return;
      index = Number(d.dataset.slide) + 1;
      update();
    };
  });

  track.addEventListener("transitionend", () => {
    if (slides[index] === firstClone) {
      track.style.transition = "none";
      index = 1;
      track.style.transform = `translateX(${-index * 100}%)`;
    }
    if (slides[index] === lastClone) {
      track.style.transition = "none";
      index = countReal;
      track.style.transform = `translateX(${-index * 100}%)`;
    }
    isMoving = false;
  });

  setInterval(goNext, 3500);
})();
