(() => {
  const frame = document.getElementById('songSearchFrame');
  if (!frame) return;

  function patch(doc) {
    if (!doc) return;
    const fix = () => {
      doc.querySelectorAll('.copy-btn[data-copy]').forEach(btn => {
        const value = btn.getAttribute('data-copy') || '';
        btn.setAttribute('data-copy', value.replace(/^点歌\s*/, ''));
      });
    };
    fix();
    const observer = new MutationObserver(fix);
    observer.observe(doc.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-copy'] });
  }

  frame.addEventListener('load', () => {
    try { patch(frame.contentDocument); }
    catch (e) { console.warn('miyu song search copy patch skipped', e); }
  });
})();
