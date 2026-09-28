/* =========================================================
   ITALISSIMO — interactions, animations & LV/EN language
   ========================================================= */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, s = localStorage) { try { return s.getItem(k); } catch (e) { return null; } },
    set(k, v, s = localStorage) { try { s.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };

  /* ---------------------------------------------------------
     1. Language (LV default, EN via data-en attributes)
     --------------------------------------------------------- */
  const LANG_KEY = 'italissimo-lang';
  let lang = store.get(LANG_KEY) === 'en' ? 'en' : 'lv';

  $$('[data-en]').forEach(el => { if (!el.hasAttribute('data-lv')) el.setAttribute('data-lv', el.innerHTML.trim()); });
  $$('[data-en-ph]').forEach(el => { el.dataset.lvPh = el.getAttribute('placeholder') || ''; });

  function applyLang(next, animate) {
    lang = next;
    document.documentElement.lang = lang;
    $$('[data-en]').forEach(el => { el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.lv; });
    $$('[data-en-ph]').forEach(el => { el.setAttribute('placeholder', lang === 'en' ? el.dataset.enPh : el.dataset.lvPh); });
    $$('.lang-switch').forEach(sw => {
      sw.dataset.lang = lang;
      $$('[data-lang-btn]', sw).forEach(b => b.classList.toggle('active', b.dataset.langBtn === lang));
    });
    $$('[data-split]').forEach(el => splitText(el, el.classList.contains('split-in')));
    if (animate) {
      const main = $('main');
      if (main) { main.classList.remove('lang-fade'); void main.offsetWidth; main.classList.add('lang-fade'); }
    }
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }
  window.ITA_LANG = () => lang;

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lang-btn]');
    if (!b || b.dataset.langBtn === lang) return;
    store.set(LANG_KEY, b.dataset.langBtn);
    applyLang(b.dataset.langBtn, true);
  });

  /* ---------------------------------------------------------
     2. Split text into animated characters
     --------------------------------------------------------- */
  function splitText(el, keepIn) {
    // Elements without data-en keep their own source so re-splitting starts clean
    if (!el.hasAttribute('data-en')) {
      if (el._src === undefined) el._src = el.innerHTML; else el.innerHTML = el._src;
    }
    let i = 0;
    const step = parseFloat(el.dataset.split) || 0.035;
    const walk = node => {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'word';
            part.split('').forEach(ch => {
              const c = document.createElement('span');
              c.className = 'char';
              c.textContent = ch;
              c.style.transitionDelay = (i++ * step).toFixed(3) + 's';
              w.appendChild(c);
            });
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
    el.setAttribute('aria-label', el.textContent);
    if (keepIn) { el.classList.remove('split-in'); void el.offsetWidth; el.classList.add('split-in'); }
  }

  applyLang(lang, false);

  /* ---------------------------------------------------------
     3. Preloader / page curtain
     --------------------------------------------------------- */
  const preloader = $('#preloader');
  const curtain = $('#curtain');
  const firstVisit = !store.get('ita-visited', sessionStorage);
  store.set('ita-visited', '1', sessionStorage);

  function start() {
    initReveal();
    document.dispatchEvent(new Event('ita:ready'));
  }

  if (firstVisit && preloader && !reduceMotion) {
    document.body.classList.add('is-locked');
    const minTime = new Promise(r => setTimeout(r, 1900));
    const loaded = new Promise(r => { if (document.readyState === 'complete') r(); else window.addEventListener('load', r); });
    const cap = new Promise(r => setTimeout(r, 3500));
    Promise.race([Promise.all([minTime, loaded]), cap]).then(() => {
      preloader.classList.add('done');
      document.body.classList.remove('is-locked');
      setTimeout(start, 350);
      setTimeout(() => preloader.remove(), 1300);
    });
  } else {
    if (preloader) preloader.remove();
    if (curtain && !reduceMotion) {
      curtain.style.transition = 'none';
      curtain.classList.add('in');
      curtain.style.transformOrigin = 'top';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        curtain.style.transition = '';
        curtain.classList.remove('in');
      }));
    }
    setTimeout(start, 150);
  }

  // Page transitions on internal links
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || !curtain || reduceMotion) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || a.target === '_blank' ||
        e.metaKey || e.ctrlKey || e.shiftKey || !/\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    curtain.style.transformOrigin = 'bottom';
    curtain.classList.add('in');
    setTimeout(() => { window.location.href = href; }, 650);
  });
  // Restore when navigating back (bfcache)
  window.addEventListener('pageshow', e => { if (e.persisted && curtain) curtain.classList.remove('in'); });

  /* ---------------------------------------------------------
     4. Reveal on scroll
     --------------------------------------------------------- */
  function initReveal() {
    const targets = $$('[data-reveal], .img-reveal, [data-split]');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      targets.forEach(el => el.classList.add('in', 'split-in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const d = el.dataset.delay;
        if (d) el.style.transitionDelay = d + 'ms';
        el.classList.add(el.hasAttribute('data-split') ? 'split-in' : 'in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------
     5. Header, mobile menu, progress, back-to-top
     --------------------------------------------------------- */
  const header = $('#site-header');
  const burger = $('#burger');
  const mobileMenu = $('#mobile-menu');
  const progress = $('#progress');
  const toTop = $('#to-top');
  let lastY = 0;

  function toggleMenu(force) {
    const open = typeof force === 'boolean' ? force : !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    mobileMenu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('is-locked', open);
    header.classList.remove('hidden-up');
  }
  if (burger) burger.addEventListener('click', () => toggleMenu());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && mobileMenu.classList.contains('open')) toggleMenu(false); });

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    const menuOpen = mobileMenu && mobileMenu.classList.contains('open');
    header.classList.toggle('hidden-up', !menuOpen && y > 500 && y > lastY);
    lastY = y;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    toTop.classList.toggle('show', y > 700);
    parallax();
    timelineFill();
  }

  // Gold line that fills the About-page timeline as you scroll
  const timeline = $('.timeline');
  const tlProgress = timeline && $('.progress', timeline);
  function timelineFill() {
    if (!tlProgress) return;
    const r = timeline.getBoundingClientRect();
    const p = Math.min(Math.max((window.innerHeight * 0.6 - r.top) / r.height, 0), 1);
    tlProgress.style.height = (p * 100).toFixed(2) + '%';
  }
  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------------------------------------------------------
     6. Parallax
     --------------------------------------------------------- */
  const parallaxEls = $$('[data-parallax]');
  function parallax() {
    if (reduceMotion) return;
    const vh = window.innerHeight;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const offset = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
  }
  onScroll();

  /* ---------------------------------------------------------
     7. Hero slider
     --------------------------------------------------------- */
  const slides = $$('.hero-slide');
  const dots = $$('.hero-dots button');
  if (slides.length) {
    let cur = 0, timer;
    const go = n => {
      slides[cur].classList.remove('active');
      dots[cur] && dots[cur].classList.remove('active');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('active');
      if (dots[cur]) { void dots[cur].offsetWidth; dots[cur].classList.add('active'); }
    };
    const auto = () => { clearInterval(timer); timer = setInterval(() => go(cur + 1), 6000); };
    dots.forEach((d, i) => d.addEventListener('click', () => { go(i); auto(); }));
    slides[0].classList.add('active');
    dots[0] && dots[0].classList.add('active');
    auto();
  }

  /* ---------------------------------------------------------
     8. Counters
     --------------------------------------------------------- */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target, target = parseFloat(el.dataset.count), dur = 2200, t0 = performance.now();
        const tick = t => {
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(2, -10 * p);
          el.textContent = Math.round(target * (p === 1 ? 1 : eased)).toLocaleString('lv-LV');
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------------------------------------------------------
     9. Testimonials slider
     --------------------------------------------------------- */
  const tWrap = $('#testimonials');
  if (tWrap) {
    const ts = $$('.t-slide', tWrap), tdots = $$('.t-dot-btn', tWrap);
    let ti = 0, tt;
    const show = n => {
      ts[ti].classList.remove('active'); tdots[ti].classList.remove('active');
      ti = (n + ts.length) % ts.length;
      ts[ti].classList.add('active'); tdots[ti].classList.add('active');
    };
    const autoT = () => { clearInterval(tt); tt = setInterval(() => show(ti + 1), 7000); };
    tdots.forEach((d, i) => d.addEventListener('click', () => { show(i); autoT(); }));
    $$('[data-t-prev]', tWrap).forEach(b => b.addEventListener('click', () => { show(ti - 1); autoT(); }));
    $$('[data-t-next]', tWrap).forEach(b => b.addEventListener('click', () => { show(ti + 1); autoT(); }));
    autoT();
  }

  /* ---------------------------------------------------------
     10. Tilt + magnetic hover (desktop)
     --------------------------------------------------------- */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    // Custom cursor
    const dot = $('.cursor-dot'), ring = $('.cursor-ring');
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', e => {
      ring.classList.toggle('hover', !!e.target.closest('a, button, [data-cursor], .g-item, input, select, textarea, label'));
    });
  } else {
    $$('.cursor-dot, .cursor-ring').forEach(el => el.remove());
  }

  /* ---------------------------------------------------------
     11. Menu tabs
     --------------------------------------------------------- */
  const tabs = $$('.menu-tab');
  if (tabs.length) {
    const activate = id => {
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === id));
      $$('.menu-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === id));
    };
    tabs.forEach(t => t.addEventListener('click', () => {
      activate(t.dataset.tab);
      history.replaceState(null, '', '#' + t.dataset.tab);
      t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }));
    const hash = location.hash.slice(1);
    activate(tabs.some(t => t.dataset.tab === hash) ? hash : tabs[0].dataset.tab);
  }

  /* ---------------------------------------------------------
     12. Gallery filter + lightbox
     --------------------------------------------------------- */
  const gItems = $$('.g-item');
  if (gItems.length) {
    $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
      const f = btn.dataset.filter;
      gItems.forEach(it => {
        const show = f === 'all' || it.dataset.cat === f;
        if (show) {
          it.classList.remove('hide');
          it.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.22,1,.36,1)' });
        } else it.classList.add('hide');
      });
    }));

    const lb = $('#lightbox'), lbImg = $('#lightbox img'), lbCap = $('#lb-caption'), lbCount = $('#lb-count');
    let li = 0;
    const visible = () => gItems.filter(i => !i.classList.contains('hide'));
    const openLb = idx => {
      const list = visible();
      li = (idx + list.length) % list.length;
      const img = $('img', list[li]);
      lbImg.style.opacity = 0;
      setTimeout(() => {
        lbImg.src = img.dataset.full || img.src;
        lbImg.alt = img.alt;
        lbImg.onload = () => { lbImg.style.opacity = 1; };
      }, 150);
      const cap = $('.cap span', list[li]);
      lbCap.textContent = cap ? cap.textContent : '';
      lbCount.textContent = `${li + 1} / ${list.length}`;
      lb.classList.add('open');
      document.body.classList.add('is-locked');
    };
    const closeLb = () => { lb.classList.remove('open'); document.body.classList.remove('is-locked'); };
    gItems.forEach(it => it.addEventListener('click', () => openLb(visible().indexOf(it))));
    $('#lb-close').addEventListener('click', closeLb);
    $('#lb-prev').addEventListener('click', () => openLb(li - 1));
    $('#lb-next').addEventListener('click', () => openLb(li + 1));
    lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') openLb(li - 1);
      if (e.key === 'ArrowRight') openLb(li + 1);
    });
    let sx = 0;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) openLb(li + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------------------------------------------------------
     13. Forms (reservation, contact, newsletter)
     --------------------------------------------------------- */
  const modal = $('#modal');
  const openModal = html => {
    if (!modal) return;
    if (html !== undefined) $('#modal-body').innerHTML = html;
    modal.classList.add('open');
    document.body.classList.add('is-locked');
  };
  const closeModal = () => { modal.classList.remove('open'); document.body.classList.remove('is-locked'); };
  if (modal) {
    $$('[data-close-modal]', modal).forEach(b => b.addEventListener('click', closeModal));
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
  }

  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  function validate(form) {
    let ok = true;
    $$('[data-required]', form).forEach(input => {
      const field = input.closest('.field') || input.parentElement;
      const v = input.value.trim();
      const bad = !v || (input.type === 'email' && !emailOk(v)) || (input.type === 'tel' && v.replace(/\D/g, '').length < 8);
      field.classList.toggle('error', bad);
      if (bad) ok = false;
    });
    const firstErr = $('.error', form);
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return ok;
  }
  $$('[data-required]').forEach(i => i.addEventListener('input', () => (i.closest('.field') || i.parentElement).classList.remove('error')));

  // Reservation
  const resForm = $('#reservation-form');
  if (resForm) {
    const dateInput = $('#r-date');
    const today = new Date();
    const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateInput.min = iso(today);
    dateInput.value = iso(new Date(today.getTime() + 86400000));

    // Guests picker
    const gOut = $('#guests-out'), gInput = $('#r-guests');
    const setGuests = n => { n = Math.max(1, Math.min(20, n)); gInput.value = n; gOut.textContent = n; gOut.animate([{ transform: 'scale(1.4)', color: '#e2c98f' }, { transform: 'scale(1)' }], { duration: 400 }); };
    $('#g-minus').addEventListener('click', () => setGuests(+gInput.value - 1));
    $('#g-plus').addEventListener('click', () => setGuests(+gInput.value + 1));

    // Time chips
    const tInput = $('#r-time');
    $$('.time-chip', resForm).forEach(c => c.addEventListener('click', () => {
      $$('.time-chip', resForm).forEach(x => x.classList.toggle('active', x === c));
      tInput.value = c.textContent.trim();
      tInput.closest('.field').classList.remove('error');
    }));

    resForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(resForm)) return;
      const d = new Date(dateInput.value + 'T12:00');
      const dateStr = d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'lv-LV', { weekday: 'long', day: 'numeric', month: 'long' });
      const name = $('#r-name').value.trim().split(' ')[0].replace(/[<>&"]/g, '');
      const g = gInput.value;
      const txt = lang === 'en'
        ? `Grazie, <span class="text-gold">${name}</span>! Your table for <strong>${g}</strong> on <strong>${dateStr}</strong> at <strong>${tInput.value}</strong> is requested. We'll confirm by phone or e-mail shortly.`
        : `Grazie, <span class="text-gold">${name}</span>! Jūsu galdiņš <strong>${g}</strong> ${g === '1' ? 'personai' : 'personām'} <strong>${dateStr}</strong> plkst. <strong>${tInput.value}</strong> ir pieprasīts. Drīzumā apstiprināsim pa tālruni vai e-pastu.`;
      openModal(txt);
      resForm.reset();
      dateInput.value = iso(new Date(today.getTime() + 86400000));
      setGuests(2);
      $$('.time-chip', resForm).forEach(x => x.classList.remove('active'));
    });
  }

  // Contact
  const cForm = $('#contact-form');
  if (cForm) {
    cForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(cForm)) return;
      openModal(lang === 'en'
        ? 'Thank you for your message! Our team will reply within 24 hours.'
        : 'Paldies par jūsu ziņu! Mūsu komanda atbildēs 24 stundu laikā.');
      cForm.reset();
    });
  }

  // Newsletter (footer)
  $$('.newsletter').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const inp = $('input', f);
    if (!emailOk(inp.value.trim())) { f.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 300, iterations: 2 }); return; }
    f.reset();
    const msg = f.nextElementSibling;
    msg.classList.remove('hidden');
    msg.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 500 });
  }));

  /* ---------------------------------------------------------
     14. Small things
     --------------------------------------------------------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // If an online image ever fails, swap in a safe fallback
  const FALLBACK = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=70';
  $$('img').forEach(img => img.addEventListener('error', function onErr() {
    img.removeEventListener('error', onErr);
    img.src = FALLBACK;
  }));
})();
