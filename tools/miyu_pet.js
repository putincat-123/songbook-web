(() => {
  const load = (src, key) => {
    if (document.querySelector(`script[data-${key}]`)) return;
    const s = document.createElement('script');
    s.src = `${src}?v=20260826-0915`;
    s.setAttribute(`data-${key}`, '1');
    document.head.appendChild(s);
  };
  load('./miyu_pet_pixel.js', 'miyu-pet-pixel');
  setTimeout(() => load('./miyu_pet_merit.js', 'miyu-pet-merit'), 250);
})();
