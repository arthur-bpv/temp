(() => {
  'use strict';

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.progress');
  const menuButton = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  const closeMenu = () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    navLinks?.classList.remove('is-open');
  };

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('is-open', open);
  });
  navLinks?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav')) closeMenu();
  });

  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = max > 0 ? scrollY / max : 0;
    progress.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
    header.classList.toggle('is-scrolled', scrollY > 8);
  };
  addEventListener('scroll', updateScroll, { passive: true });
  addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    reveals.forEach((element) => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .08 });
    reveals.forEach((element) => observer.observe(element));
  }

  const activateChoice = (items, current) => {
    items.forEach((item) => item.setAttribute('aria-pressed', String(item === current)));
  };

  const burstCards = [...document.querySelectorAll('.burst-card')];
  const burstTitle = document.getElementById('burstTitle');
  const burstVerdict = document.getElementById('burstVerdict');
  const burstDescription = document.getElementById('burstDescription');
  const burstReasons = document.getElementById('burstReasons');
  burstCards.forEach((card) => card.addEventListener('click', () => {
    activateChoice(burstCards, card);
    burstTitle.textContent = card.dataset.title;
    burstVerdict.textContent = card.dataset.verdict;
    burstDescription.textContent = card.dataset.description;
    burstReasons.replaceChildren(...card.dataset.reasons.split('|').map((text) => {
      const chip = document.createElement('span');
      chip.className = 'reason-chip';
      chip.textContent = text;
      return chip;
    }));
  }));

  const comparator = document.getElementById('editComparator');
  const editRange = document.getElementById('editRange');
  const editAfter = document.getElementById('editAfter');
  editRange?.addEventListener('input', () => comparator.style.setProperty('--split', `${editRange.value}%`));
  const styles = [...document.querySelectorAll('[data-edit-style]')];
  styles.forEach((button) => button.addEventListener('click', () => {
    activateChoice(styles, button);
    editAfter.classList.remove('warm', 'clean');
    if (button.dataset.editStyle !== 'signature') editAfter.classList.add(button.dataset.editStyle);
  }));

  const thumbs = [...document.querySelectorAll('.review-thumb')];
  const keepCount = document.getElementById('keepCount');
  const removeCount = document.getElementById('removeCount');
  const approvalMessage = document.getElementById('approvalMessage');
  const updateReview = () => {
    const kept = thumbs.filter((thumb) => thumb.getAttribute('aria-pressed') === 'true').length;
    keepCount.textContent = kept;
    removeCount.textContent = thumbs.length - kept;
  };
  thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => {
    const keep = thumb.getAttribute('aria-pressed') !== 'true';
    thumb.setAttribute('aria-pressed', String(keep));
    thumb.setAttribute('aria-label', `Foto ${index + 1} ${keep ? 'mantida' : 'removida'}`);
    thumb.querySelector('.thumb-check').textContent = keep ? '✓' : '×';
    approvalMessage.textContent = keep ? 'Foto devolvida ao lote.' : 'Foto removida da recomendação. A ação pode ser desfeita.';
    updateReview();
  }));
  document.getElementById('approveButton')?.addEventListener('click', () => {
    const kept = thumbs.filter((thumb) => thumb.getAttribute('aria-pressed') === 'true').length;
    approvalMessage.textContent = `Lote aprovado para a próxima etapa com ${kept} de ${thumbs.length} fotos nesta amostra. Nada foi publicado.`;
  });

  const businessOptions = [...document.querySelectorAll('.option')];
  const businessTitle = document.getElementById('businessTitle');
  const businessVerdict = document.getElementById('businessVerdict');
  const businessDescription = document.getElementById('businessDescription');
  const businessReasons = document.getElementById('businessReasons');
  businessOptions.forEach((option) => option.addEventListener('click', () => {
    activateChoice(businessOptions, option);
    businessTitle.textContent = option.dataset.title;
    businessVerdict.textContent = option.dataset.verdict;
    businessDescription.textContent = option.dataset.description;
    businessReasons.replaceChildren(...option.dataset.reasons.split('|').map((text) => {
      const chip = document.createElement('span');
      chip.className = 'reason-chip';
      chip.textContent = text;
      return chip;
    }));
  }));

  const inputs = {
    events: document.getElementById('eventsInput'), photos: document.getElementById('photosInput'),
    people: document.getElementById('peopleInput'), hours: document.getElementById('hoursInput'),
    cost: document.getElementById('costInput'), reduction: document.getElementById('reductionInput')
  };
  const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const value = (input) => Math.max(0, Number(input.value) || 0);
  const calculate = () => {
    if (!inputs.events) return;
    const events = value(inputs.events);
    const photos = events * value(inputs.photos);
    const teamHoursPerEvent = value(inputs.people) * value(inputs.hours);
    const currentHours = events * teamHoursPerEvent;
    const redirected = currentHours * value(inputs.reduction) / 100;
    document.getElementById('reductionOutput').textContent = `${number.format(value(inputs.reduction))}%`;
    document.getElementById('teamEquation').textContent = `${number.format(value(inputs.people))} ${value(inputs.people) === 1 ? 'pessoa' : 'pessoas'} × ${number.format(value(inputs.hours))} h = ${number.format(teamHoursPerEvent)} ${teamHoursPerEvent === 1 ? 'hora' : 'horas'} de equipe por evento`;
    document.getElementById('savedHours').textContent = `${number.format(redirected)} h`;
    document.getElementById('monthlyPhotos').textContent = number.format(photos);
    document.getElementById('currentHours').textContent = `${number.format(currentHours)} h`;
    document.getElementById('timeValue').textContent = currency.format(redirected * value(inputs.cost));
  };
  Object.values(inputs).forEach((input) => input?.addEventListener('input', calculate));
  calculate();
})();
