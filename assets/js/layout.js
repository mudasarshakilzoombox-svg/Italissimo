/* =========================================================
   ITALISSIMO — shared layout (header, menu, footer, overlays)
   Injected on every page so navigation lives in one place.
   Latvian text is the default content; English is in data-en.
   ========================================================= */
(function () {
  const page = document.body.dataset.page || 'home';

  const NAV = [
    { id: 'home', href: 'index.html', lv: 'Sākums', en: 'Home' },
    { id: 'menu', href: 'menu.html', lv: 'Ēdienkarte', en: 'Menu' },
    { id: 'about', href: 'about.html', lv: 'Par mums', en: 'About' },
    { id: 'gallery', href: 'gallery.html', lv: 'Galerija', en: 'Gallery' },
    { id: 'reservations', href: 'reservations.html', lv: 'Rezervācija', en: 'Reservations' },
    { id: 'contact', href: 'contact.html', lv: 'Kontakti', en: 'Contact' },
  ];

  const ICON = {
    phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
    ig: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>',
    fb: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    ta: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="13.5" r="3.5"/><circle cx="17.5" cy="13.5" r="3.5"/><path d="M3 9h18M12 6c-3 0-6 1-8 3m8-3c3 0 6 1 8 3"/></svg>',
    up: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  };
  window.ITA_ICON = ICON;

  const logo = (size = 'text-3xl') => `
    <a href="index.html" class="group flex flex-col leading-none" aria-label="Italissimo">
      <span class="font-display ${size} tracking-[0.12em] text-cream group-hover:text-gold transition-colors duration-500">Italissimo</span>
      <span class="text-[0.58rem] tracking-[0.45em] uppercase text-gold/80 mt-1">Cucina Italiana · Rīga</span>
    </a>`;

  const langSwitch = `
    <div class="lang-switch" data-lang="lv" role="group" aria-label="Language">
      <span class="pill"></span>
      <button type="button" data-lang-btn="lv" class="active">LV</button>
      <button type="button" data-lang-btn="en">EN</button>
    </div>`;

  /* ---------- Overlays ---------- */
  const overlays = `
    <div id="preloader" aria-hidden="true">
      <div class="preloader-logo">
        <div class="word">${'Italissimo'.split('').map((c, i) => `<span style="animation-delay:${0.08 * i}s">${c}</span>`).join('')}</div>
        <div class="preloader-bar"><i></i></div>
        <p class="mt-4 font-script text-gold text-2xl opacity-0" style="animation: langFade 1s 1s forwards">Benvenuti</p>
      </div>
    </div>
    <div id="curtain"></div>
    <div id="progress"></div>
    <div class="cursor-dot"></div><div class="cursor-ring"></div>
    <button id="to-top" aria-label="Back to top">${ICON.up}</button>`;

  /* ---------- Header ---------- */
  const header = `
    <header id="site-header">
      <div class="header-inner px-4 sm:px-8 py-5">
        <div class="max-w-site mx-auto flex items-center justify-between gap-6">
          ${logo()}
          <nav class="hidden lg:flex items-center gap-8" aria-label="Main">
            ${NAV.map(n => `<a href="${n.href}" class="nav-link link-underline ${n.id === page ? 'active' : ''}" data-en="${n.en}">${n.lv}</a>`).join('')}
          </nav>
          <div class="flex items-center gap-3 sm:gap-5">
            ${langSwitch}
            <a href="reservations.html" class="btn !py-3 !px-5 hidden md:inline-flex" data-en="Book a table">Rezervēt galdiņu</a>
            <button class="burger lg:hidden" id="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
          </div>
        </div>
      </div>
    </header>

    <div id="mobile-menu" aria-hidden="true">
      <nav class="max-w-site mx-auto w-full">
        ${NAV.map((n, i) => `
          <a href="${n.href}" class="m-link ${n.id === page ? 'active' : ''}">
            <span style="transition-delay:${0.25 + i * 0.07}s"><small>0${i + 1}</small><span data-en="${n.en}">${n.lv}</span></span>
          </a>`).join('')}
      </nav>
      <div class="max-w-site mx-auto w-full mt-10 pt-8 border-t border-gold/20 grid gap-3 text-sm text-cream/70">
        <a href="tel:+37120000000" class="flex items-center gap-3 hover:text-gold">${ICON.phone} +371 2000 0000</a>
        <a href="mailto:info@italissimo.lv" class="flex items-center gap-3 hover:text-gold">${ICON.mail} info@italissimo.lv</a>
        <span class="flex items-center gap-3">${ICON.pin} Tērbatas iela 22, Rīga</span>
      </div>
    </div>`;

  /* ---------- Footer ---------- */
  const footer = `
    <footer class="relative bg-espresso border-t border-gold/15 overflow-hidden">
      <div class="absolute -right-24 -top-24 w-80 h-80 rounded-full border border-gold/10 spin-slow" aria-hidden="true"></div>
      <div class="max-w-site mx-auto px-4 sm:px-8 pt-20 pb-10 relative">
        <div class="grid gap-14 md:grid-cols-2 lg:grid-cols-4">
          <div data-reveal="up">
            ${logo('text-4xl')}
            <p class="mt-6 text-cream/60 leading-relaxed" data-en="Authentic Italian cuisine in the heart of Riga. Handmade pasta, wood-fired pizza and wines from every corner of Italy.">Autentiska itāļu virtuve Rīgas sirdī. Roku darba pasta, malkas krāsnī cepta pica un vīni no visiem Itālijas nostūriem.</p>
            <div class="flex gap-3 mt-7">
              ${['ig', 'fb', 'ta'].map(k => `<a href="#" class="icon-circle !w-11 !h-11 hover:bg-gold hover:text-ink" aria-label="${k}">${ICON[k]}</a>`).join('')}
            </div>
          </div>
          <div data-reveal="up" data-delay="100">
            <h4 class="eyebrow mb-6" data-en="Visit us">Apmeklējiet mūs</h4>
            <ul class="space-y-4 text-cream/70">
              <li class="flex gap-3">${ICON.pin}<span>Tērbatas iela 22,<br>Rīga, LV-1011</span></li>
              <li><a href="tel:+37120000000" class="flex gap-3 hover:text-gold transition">${ICON.phone}+371 2000 0000</a></li>
              <li><a href="mailto:info@italissimo.lv" class="flex gap-3 hover:text-gold transition">${ICON.mail}info@italissimo.lv</a></li>
            </ul>
          </div>
          <div data-reveal="up" data-delay="200">
            <h4 class="eyebrow mb-6" data-en="Opening hours">Darba laiks</h4>
            <ul class="space-y-3 text-cream/70">
              <li class="flex justify-between gap-4 border-b border-cream/10 pb-3"><span data-en="Mon – Thu">P. – C.</span><span class="text-cream">12:00 – 22:00</span></li>
              <li class="flex justify-between gap-4 border-b border-cream/10 pb-3"><span data-en="Fri – Sat">Pk. – S.</span><span class="text-cream">12:00 – 23:30</span></li>
              <li class="flex justify-between gap-4"><span data-en="Sunday">Svētdiena</span><span class="text-cream">12:00 – 21:00</span></li>
            </ul>
          </div>
          <div data-reveal="up" data-delay="300">
            <h4 class="eyebrow mb-6" data-en="Newsletter">Jaunumi</h4>
            <p class="text-cream/60 mb-5" data-en="Seasonal menus, wine evenings and special offers — straight to your inbox.">Sezonas ēdienkartes, vīna vakari un īpašie piedāvājumi — tieši jūsu e-pastā.</p>
            <form class="newsletter flex border-b border-cream/25 focus-within:border-gold transition" novalidate>
              <input type="email" required class="bg-transparent flex-1 py-3 outline-none placeholder-cream/40 min-w-0" placeholder="Jūsu e-pasts" data-en-ph="Your email">
              <button class="text-gold text-xs tracking-[0.25em] uppercase pl-3 hover:text-cream transition" data-en="Join">Pieteikties</button>
            </form>
            <p class="newsletter-msg text-sm text-gold mt-3 hidden" data-en="Grazie! You're on the list.">Grazie! Jūs esat sarakstā.</p>
          </div>
        </div>

        <div class="mt-20 font-display text-[18vw] lg:text-[13rem] leading-none text-center text-transparent select-none" style="-webkit-text-stroke:1px rgba(201,164,92,.18)" aria-hidden="true">Italissimo</div>

        <div class="mt-6 pt-8 border-t border-cream/10 flex flex-col md:flex-row gap-4 justify-between items-center text-xs text-cream/50 tracking-wider">
          <p>© <span data-year></span> Italissimo. <span data-en="All rights reserved.">Visas tiesības aizsargātas.</span></p>
          <nav class="flex flex-wrap justify-center gap-5">
            ${NAV.map(n => `<a href="${n.href}" class="hover:text-gold transition" data-en="${n.en}">${n.lv}</a>`).join('')}
          </nav>
        </div>
      </div>
    </footer>`;

  document.body.insertAdjacentHTML('afterbegin', overlays + header);
  document.body.insertAdjacentHTML('beforeend', footer);
})();
