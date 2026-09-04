(() => {
      'use strict';

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

      class PresentationController {
        constructor() {
          this.slides = Array.from(document.querySelectorAll('.slide'));
          this.currentIndex = 0;
          this.touchStartY = 0;
          this.touchStartScrollY = 0;
          this.touchTarget = null;
          this.rail = document.getElementById('chapterRail');
          this.currentLabel = document.querySelector('.chrome-current');
          this.currentNumber = document.getElementById('currentNumber');
          this.progress = document.querySelector('.progress-fill');
          this.progressTrack = document.querySelector('.progress-track');
          this.buildRail();
          this.bind();
          this.observe();
          this.update(0, false);
        }

        buildRail() {
          const fragment = document.createDocumentFragment();
          this.slides.forEach((slide, index) => {
            const button = document.createElement('button');
            button.className = 'chapter-dot';
            button.type = 'button';
            button.dataset.index = String(index);
            button.setAttribute('aria-label', `Ir para capítulo ${index + 1}: ${slide.dataset.title}`);
            button.innerHTML = `<span>${slide.dataset.title}</span>`;
            button.addEventListener('click', () => this.go(index));
            fragment.appendChild(button);
          });
          this.rail.appendChild(fragment);
          this.dots = Array.from(this.rail.querySelectorAll('.chapter-dot'));
        }

        bind() {
          /* Landing page: native scrolling remains untouched on keyboard and touch. */
        }

        observe() {
          let ticking = false;
          const sync = () => {
            ticking = false;
            const center = window.innerHeight / 2;
            let best = this.currentIndex;
            let bestDistance = Infinity;
            this.slides.forEach((slide, index) => {
              const rect = slide.getBoundingClientRect();
              const distance = Math.abs(rect.top + rect.height / 2 - center);
              if (distance < bestDistance) {
                bestDistance = distance;
                best = index;
              }
            });
            if (best !== this.currentIndex) this.update(best, true);
          };
          const request = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(sync);
          };
          window.addEventListener('scroll', request, { passive: true });
          window.addEventListener('resize', request);
          window.addEventListener('orientationchange', request);
          request();
        }

        update(index, dispatch = true) {
          this.currentIndex = Math.max(0, Math.min(this.slides.length - 1, index));
          this.slides.forEach((slide, i) => slide.classList.toggle('is-active', i === this.currentIndex));
          this.dots.forEach((dot, i) => dot.setAttribute('aria-current', i === this.currentIndex ? 'true' : 'false'));
          this.currentLabel.textContent = this.slides[this.currentIndex].dataset.title;
          this.currentNumber.textContent = String(this.currentIndex + 1).padStart(2, '0');
          const progress = (this.currentIndex + 1) / this.slides.length;
          this.progress.style.transform = `scaleX(${progress})`;
          this.progressTrack.setAttribute('aria-valuenow', String(this.currentIndex + 1));
          document.title = `${this.slides[this.currentIndex].dataset.title} · PHOTOMACHINE`;
          if (dispatch) {
            const detail = { index: this.currentIndex, slideId: this.slides[this.currentIndex].id };
            document.dispatchEvent(new CustomEvent('photomachine:slidechange', { detail }));
            document.dispatchEvent(new CustomEvent('photomachine:chapter-active', { detail }));
          }
        }

        go(index) {
          const bounded = Math.max(0, Math.min(this.slides.length - 1, index));
          this.slides[bounded].scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
          this.update(bounded, true);
        }
      }

      class MachineController {
        constructor() {
          this.stage = document.getElementById('machineStage');
          this.object = document.getElementById('machineObject');
          this.external = !this.object;
          if (this.external) return;
          this.cards = Array.from(document.querySelectorAll('.sd-card'));
          this.docks = Array.from(document.querySelectorAll('.card-dock'));
          this.state = document.getElementById('machineState');
          this.substate = document.getElementById('machineSubstate');
          this.stats = document.getElementById('machineStats');
          this.progress = document.getElementById('machineProgress');
          this.screen = this.object.querySelector('.machine-screen');
          this.rotation = { x: -7, y: -15 };
          this.target = { x: -7, y: -15 };
          this.dragging = false;
          this.visible = false;
          this.last = { x: 0, y: 0 };
          this.idleSince = performance.now();
          this.timeouts = [];
          this.runToken = 0;
          this.running = false;
          this.hasAutoPlayed = false;
          this.lastFrame = performance.now();
          this.raf = 0;
          this.bind();
          this.observe();
        }

        bind() {
          this.object.addEventListener('pointerdown', (event) => {
            this.dragging = true;
            this.last = { x: event.clientX, y: event.clientY };
            this.object.classList.add('is-dragging');
            this.object.setPointerCapture(event.pointerId);
          });

          this.object.addEventListener('pointermove', (event) => {
            if (!this.dragging) return;
            const dx = event.clientX - this.last.x;
            const dy = event.clientY - this.last.y;
            this.target.y += dx * .33;
            this.target.x = Math.max(-24, Math.min(18, this.target.x - dy * .24));
            this.last = { x: event.clientX, y: event.clientY };
          });

          const release = (event) => {
            if (!this.dragging) return;
            this.dragging = false;
            this.idleSince = performance.now();
            this.object.classList.remove('is-dragging');
            if (this.object.hasPointerCapture(event.pointerId)) this.object.releasePointerCapture(event.pointerId);
          };
          this.object.addEventListener('pointerup', release);
          this.object.addEventListener('pointercancel', release);

          document.getElementById('simulateButton').addEventListener('click', () => this.simulate());
          document.getElementById('resetMachineButton').addEventListener('click', () => this.reset());
          document.addEventListener('photomachine:slidechange', (event) => {
            if (event.detail.index === 3 && !this.hasAutoPlayed) {
              this.hasAutoPlayed = true;
              this.timeouts.push(setTimeout(() => this.simulate(), 450));
            }
          });
          document.addEventListener('visibilitychange', () => {
            this.lastFrame = performance.now();
            if (document.hidden) this.stopLoop();
            else this.startLoop();
          });
        }

        observe() {
          const observer = new IntersectionObserver(([entry]) => {
            this.visible = entry.isIntersecting;
            if (this.visible) this.startLoop();
            else this.stopLoop();
          }, { threshold: .15 });
          observer.observe(this.stage);
        }

        startLoop() {
          if (this.raf || !this.visible || document.hidden) return;
          this.lastFrame = performance.now();
          this.raf = requestAnimationFrame((time) => this.tick(time));
        }

        stopLoop() {
          if (this.raf) cancelAnimationFrame(this.raf);
          this.raf = 0;
        }

        tick(time) {
          this.raf = 0;
          const delta = Math.min(40, time - this.lastFrame);
          this.lastFrame = time;
          if (!this.visible || document.hidden) return;
          if (!this.dragging && !prefersReducedMotion.matches && time - this.idleSince > 2400) this.target.y += delta * .0013;
          this.rotation.x += (this.target.x - this.rotation.x) * .055;
          this.rotation.y += (this.target.y - this.rotation.y) * .055;
          this.object.style.transform = `rotateX(${this.rotation.x.toFixed(2)}deg) rotateY(${this.rotation.y.toFixed(2)}deg)`;
          this.raf = requestAnimationFrame((nextTime) => this.tick(nextTime));
        }

        clearTimers() {
          this.timeouts.forEach(clearTimeout);
          this.timeouts = [];
        }

        reset() {
          if (this.external) {
            window.fullMachine?.reset?.();
            return;
          }
          this.clearTimers();
          this.runToken += 1;
          this.running = false;
          this.cards.forEach((card) => card.classList.remove('is-inserted'));
          this.docks.forEach((dock) => dock.classList.remove('is-live', 'is-done'));
          this.screen.classList.remove('is-changing');
          this.state.textContent = 'Aguardando cartões';
          this.substate.textContent = 'Insira os cartões para iniciar a cadeia protegida.';
          this.stats.textContent = '0 cartões · 0 arquivos';
          this.progress.style.transform = 'scaleX(.04)';
        }

        setStage(title, description, progress, stats) {
          this.state.textContent = title;
          this.substate.textContent = description;
          this.stats.textContent = stats;
          this.progress.style.transform = `scaleX(${progress / 100})`;
          this.screen.classList.remove('is-changing');
          void this.screen.offsetWidth;
          this.screen.classList.add('is-changing');
        }

        simulate() {
          if (this.external) {
            window.fullMachine?.play?.();
            return;
          }
          this.reset();
          this.running = true;
          const token = this.runToken;
          const speed = prefersReducedMotion.matches ? .045 : 1;
          const later = (delay, callback) => {
            const timer = setTimeout(() => {
              if (token === this.runToken) callback();
            }, Math.max(20, delay * speed));
            this.timeouts.push(timer);
          };

          later(350, () => this.setStage('Recebendo cartões', 'Identificando câmera, fotógrafo e evento.', 8, 'Preparando 4 entradas · leitura segura'));
          this.cards.forEach((card, index) => {
            later(1000 + index * 1800, () => {
              card.classList.add('is-inserted');
              this.docks[index].classList.add('is-live');
              this.stats.textContent = `${index + 1} de 4 cartões · leitura segura`;
            });
          });
          later(8500, () => this.setStage('Copiando originais', 'Cada arquivo recebe identidade, hash e destino.', 28, '4 cartões · 12.846 arquivos'));
          later(14500, () => {
            this.setStage('Verificando cópias', 'Comparando origem e destinos antes de liberar o fluxo.', 44, '12.846 verificados · 0 divergências');
            this.docks.forEach((dock) => { dock.classList.remove('is-live'); dock.classList.add('is-done'); });
          });
          later(21000, () => this.setStage('Analisando imagens', 'Proxies, rajadas, foco, expressão e cobertura.', 61, '1.927 rajadas · 642 pessoas'));
          later(27500, () => this.setStage('Selecionando o ouro', 'Ranking contextual por momento e formando.', 76, '3.214 recomendadas · 186 dúvidas'));
          later(33000, () => this.setStage('Editando o lote', 'Receitas RAW por câmera, luz e ambiente.', 91, '3.028 previews · estilo Square 01'));
          later(39000, () => {
            this.setStage('Pronto para revisão', 'A equipe decide o lote antes de qualquer publicação.', 100, '3.214 fotos · aprovação humana pendente');
            this.running = false;
          });
        }
      }

      function bindSelectionDemo() {
        const cards = Array.from(document.querySelectorAll('.burst-card'));
        const title = document.getElementById('burstDecisionTitle');
        const verdict = document.getElementById('burstVerdict');
        const description = document.getElementById('burstDescription');
        const reasons = document.getElementById('burstReasons');
        cards.forEach((card) => {
          card.addEventListener('click', () => {
            cards.forEach((item) => { item.classList.toggle('is-selected', item === card); item.setAttribute('aria-selected', item === card ? 'true' : 'false'); });
            title.textContent = card.dataset.title;
            verdict.textContent = card.dataset.verdict;
            description.textContent = card.dataset.description;
            reasons.replaceChildren(...card.dataset.reasons.split('|').map((reason) => {
              const chip = document.createElement('span');
              chip.className = 'reason-chip';
              chip.textContent = reason;
              return chip;
            }));
          });
        });
      }

      function bindDoorsDemo() {
        const cards = Array.from(document.querySelectorAll('.door-card'));
        const title = document.getElementById('doorTitle');
        const verdict = document.getElementById('doorVerdict');
        const description = document.getElementById('doorDescription');
        const reasons = document.getElementById('doorReasons');
        if (!cards.length || !title || !verdict || !description || !reasons) return;
        cards.forEach((card) => {
          card.addEventListener('click', () => {
            cards.forEach((item) => { item.classList.toggle('is-selected', item === card); item.setAttribute('aria-selected', item === card ? 'true' : 'false'); });
            title.textContent = card.dataset.title;
            verdict.textContent = card.dataset.verdict;
            description.textContent = card.dataset.description;
            reasons.replaceChildren(...card.dataset.reasons.split('|').map((reason) => {
              const chip = document.createElement('span');
              chip.className = 'reason-chip';
              chip.textContent = reason;
              return chip;
            }));
          });
        });
      }

      function bindEditingDemo() {
        const comparator = document.getElementById('editComparator');
        const range = document.getElementById('editRange');
        const after = document.getElementById('editAfter');
        const styles = Array.from(document.querySelectorAll('[data-style]'));
        const update = () => comparator.style.setProperty('--split', `${range.value}%`);
        range.addEventListener('input', update);
        styles.forEach((button) => {
          button.addEventListener('click', () => {
            styles.forEach((item) => item.setAttribute('aria-pressed', item === button ? 'true' : 'false'));
            after.classList.remove('warm', 'clean');
            if (button.dataset.style !== 'signature') after.classList.add(button.dataset.style);
          });
        });
        update();
      }

      function bindApprovalDemo() {
        const thumbs = Array.from(document.querySelectorAll('.review-thumb'));
        const keep = document.getElementById('reviewKeepCount');
        const remove = document.getElementById('reviewRemoveCount');
        const message = document.getElementById('approvalMessage');
        const update = () => {
          const kept = thumbs.filter((thumb) => thumb.getAttribute('aria-pressed') === 'true').length;
          keep.textContent = String(kept);
          remove.textContent = String(thumbs.length - kept);
        };
        thumbs.forEach((thumb, index) => {
          thumb.addEventListener('click', () => {
            const next = thumb.getAttribute('aria-pressed') !== 'true';
            thumb.setAttribute('aria-pressed', next ? 'true' : 'false');
            thumb.setAttribute('aria-label', `Foto ${index + 1} ${next ? 'mantida' : 'removida'}`);
            thumb.querySelector('.thumb-check').textContent = next ? '✓' : '×';
            message.textContent = next ? 'Foto devolvida ao lote.' : 'Foto removida da recomendação. A ação pode ser desfeita.';
            update();
          });
        });
        document.getElementById('approveBatchButton').addEventListener('click', () => {
          const kept = thumbs.filter((thumb) => thumb.getAttribute('aria-pressed') === 'true').length;
          message.textContent = `Lote aprovado para a próxima etapa com ${kept} de ${thumbs.length} fotos nesta amostra. Nada foi publicado.`;
        });
      }

      function bindCalculator() {
        const events = document.getElementById('eventsInput');
        const photos = document.getElementById('photosInput');
        const people = document.getElementById('peopleInput');
        const hoursPerPerson = document.getElementById('hoursPerPersonInput');
        const cost = document.getElementById('costInput');
        const reduction = document.getElementById('reductionInput');
        const reductionOutput = document.getElementById('reductionOutput');
        const monthlyPhotos = document.getElementById('monthlyPhotos');
        const currentHours = document.getElementById('currentHours');
        const savedHours = document.getElementById('savedHours');
        const timeValue = document.getElementById('timeValue');
        const teamEquation = document.getElementById('teamEquation');
        const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
        const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

        const numeric = (input) => Math.max(0, Number(input.value) || 0);
        const update = () => {
          const eventCount = numeric(events);
          const photoCount = eventCount * numeric(photos);
          const peopleCount = numeric(people);
          const hoursPerPersonCount = numeric(hoursPerPerson);
          const teamHoursPerEvent = peopleCount * hoursPerPersonCount;
          const hoursCount = eventCount * teamHoursPerEvent;
          const redirected = hoursCount * (numeric(reduction) / 100);
          const value = redirected * numeric(cost);
          const peopleLabel = peopleCount === 1 ? 'pessoa' : 'pessoas';
          const hoursLabel = teamHoursPerEvent === 1 ? 'hora' : 'horas';
          reductionOutput.textContent = `${number.format(numeric(reduction))}%`;
          teamEquation.textContent = `${number.format(peopleCount)} ${peopleLabel} × ${number.format(hoursPerPersonCount)} h = ${number.format(teamHoursPerEvent)} ${hoursLabel} de equipe por evento`;
          monthlyPhotos.textContent = number.format(photoCount);
          currentHours.textContent = `${number.format(hoursCount)} h`;
          savedHours.textContent = `${number.format(redirected)} h`;
          timeValue.textContent = currency.format(value);
        };
        document.querySelectorAll('.step-button').forEach((button) => {
          button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.target);
            if (!input) return;
            const step = Number(input.step) || 1;
            const min = input.min === '' ? -Infinity : Number(input.min);
            const max = input.max === '' ? Infinity : Number(input.max);
            const next = (Number(input.value) || 0) + step * Number(button.dataset.dir);
            input.value = String(Math.min(max, Math.max(min, next)));
            update();
          });
        });
        [events, photos, people, hoursPerPerson, cost, reduction].forEach((input) => input.addEventListener('input', update));
        document.getElementById('calculatorForm').addEventListener('submit', (event) => event.preventDefault());
        update();
      }

      function bindGlobalControls(presentation, machine) {
        const fullscreenButton = document.getElementById('fullscreenButton');
        fullscreenButton.addEventListener('click', async () => {
          try {
            if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
            else await document.exitFullscreen();
          } catch (error) {
            fullscreenButton.title = 'Tela cheia não disponível neste navegador';
          }
        });

        document.addEventListener('fullscreenchange', () => {
          const active = Boolean(document.fullscreenElement);
          fullscreenButton.setAttribute('aria-label', active ? 'Sair da tela cheia' : 'Entrar em tela cheia');
          fullscreenButton.title = active ? 'Sair da tela cheia' : 'Tela cheia';
        });

        document.getElementById('restartButton').addEventListener('click', () => {
          machine.reset();
          document.getElementById('editRange').value = '58';
          document.getElementById('editComparator').style.setProperty('--split', '58%');
          document.querySelectorAll('.review-thumb').forEach((thumb, index) => {
            thumb.setAttribute('aria-pressed', 'true');
            thumb.setAttribute('aria-label', `Foto ${index + 1} mantida`);
            thumb.querySelector('.thumb-check').textContent = '✓';
          });
          document.getElementById('reviewKeepCount').textContent = '8';
          document.getElementById('reviewRemoveCount').textContent = '0';
          document.getElementById('approvalMessage').textContent = '';
          presentation.go(0);
        });
      }

      const presentation = new PresentationController();
      const machine = new MachineController();
      bindSelectionDemo();
      bindDoorsDemo();
      bindEditingDemo();
      bindApprovalDemo();
      bindCalculator();
      bindGlobalControls(presentation, machine);

      // Ensure a directly linked chapter lands on an exact viewport boundary.
      const requestedSlide = location.hash ? document.querySelector(location.hash) : null;
      if (requestedSlide && requestedSlide.classList.contains('slide')) {
        const requestedIndex = presentation.slides.indexOf(requestedSlide);
        const root = document.documentElement;
        const previousScrollBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        requestedSlide.scrollIntoView({ behavior: 'auto', block: 'start' });
        presentation.update(requestedIndex, true);
        requestAnimationFrame(() => {
          root.style.scrollBehavior = previousScrollBehavior;
        });
      } else {
        document.getElementById('slide-1').classList.add('is-active');
      }
    })();
