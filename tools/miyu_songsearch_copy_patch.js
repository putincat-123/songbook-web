(() => {
  const frame = document.getElementById('songSearchFrame');
  if (!frame) return;

  function patch(doc) {
    if (!doc || !doc.documentElement) return;

    const fix = root => {
      const scope = root && root.querySelectorAll ? root : doc;
      scope.querySelectorAll('.copy-btn[data-copy]').forEach(btn => {
        const value = btn.getAttribute('data-copy') || '';
        const clean = value.replace(/^点歌\s*/, '');
        if (clean !== value) btn.setAttribute('data-copy', clean);
      });
      if (scope.matches?.('.copy-btn[data-copy]')) {
        const value = scope.getAttribute('data-copy') || '';
        const clean = value.replace(/^点歌\s*/, '');
        if (clean !== value) scope.setAttribute('data-copy', clean);
      }
    };

    fix(doc);

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) fix(node);
          });
        } else if (mutation.type === 'attributes' && mutation.target) {
          fix(mutation.target);
        }
      }
    });

    observer.observe(doc.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-copy']
    });
  }

  frame.addEventListener('load', () => {
    try { patch(frame.contentDocument); }
    catch (e) { console.warn('miyu song search copy patch skipped', e); }
  });
})();
