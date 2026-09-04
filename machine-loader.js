(() => {
  'use strict';

  const stage = document.getElementById('machineStage');
  if (!stage) return;

  let requested = false;
  const load = () => {
    if (requested) return;
    requested = true;
    stage.dataset.runtime = 'loading';
    const script = document.createElement('script');
    script.src = './machine-runtime.js';
    script.async = true;
    script.addEventListener('load', () => { stage.dataset.runtime = 'ready'; });
    script.addEventListener('error', () => {
      stage.dataset.runtime = 'fallback';
      stage.setAttribute('data-fallback', 'true');
    });
    document.body.appendChild(script);
  };

  if (!('IntersectionObserver' in window)) {
    load();
    return;
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    load();
  }, { rootMargin: '900px 0px', threshold: 0 });
  observer.observe(stage);
})();
