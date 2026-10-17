/* Eltek Industries — site behaviour (vanilla JS, no dependencies) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { /* storage blocked: ignore */ }
    return null;
  }

  /* ---------------- Header shadow ---------------- */
  var header = $('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- Mobile menu ---------------- */
  var menu = $('#mobile-menu');
  var openBtn = $('[data-menu-open]');
  var closeBtn = $('[data-menu-close]');
  function setMenu(open) {
    if (!menu) return;
    menu.dataset.open = String(open);
    openBtn.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    // Wait a frame so the overlay is visible (focusable) before moving focus into it
    setTimeout(function () { (open ? closeBtn : openBtn).focus(); }, 30);
  }
  if (menu && openBtn) {
    menu.setAttribute('inert', '');
    openBtn.addEventListener('click', function () { menu.removeAttribute('inert'); setMenu(true); });
    closeBtn.addEventListener('click', function () { setMenu(false); menu.setAttribute('inert', ''); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { setMenu(false); menu.setAttribute('inert', ''); } });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.dataset.open === 'true') { setMenu(false); menu.setAttribute('inert', ''); }
      if (e.key === 'Tab' && menu.dataset.open === 'true') {
        var f = $$('a, button', menu);
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches && menu.dataset.open === 'true') setMenu(false); });
  }

  /* ---------------- Hero mode toggle (For Homes | For Industry) ---------------- */
  var hero = $('#hero');
  if (hero) {
    var buttons = $$('[data-set-mode]', hero);
    var apply = function (mode, save) {
      hero.dataset.theme = mode;
      document.documentElement.dataset.heroMode = mode;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.setMode === mode)); });
      if (save) store('eltek-mode', mode);
    };
    apply(hero.dataset.theme === 'industry' ? 'industry' : 'home', false);
    buttons.forEach(function (b) { b.addEventListener('click', function () { apply(b.dataset.setMode, true); }); });
  }

  /* ---------------- Reveal on scroll + counters ---------------- */
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = target.toLocaleString('en-IN'); return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))).toLocaleString('en-IN');
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var revealables = $$('[data-reveal], [data-count]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        if (en.target.dataset.count !== undefined) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); if (el.dataset.count !== undefined) countUp(el); });
  }

  /* ---------------- Parallax (About hero) ---------------- */
  var px = $$('[data-parallax]');
  if (px.length && !reduceMotion) {
    var ticking = false;
    var update = function () {
      px.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        el.style.setProperty('--py', (r.top * -0.25).toFixed(1) + 'px');
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------------- Lightbox ---------------- */
  var lb = $('#lightbox');
  if (lb && typeof lb.showModal === 'function') {
    var lbImg = $('img', lb), lbCap = $('figcaption', lb);
    $$('[data-lightbox]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var thumb = $('img', btn);
        lbImg.src = btn.dataset.lightbox;
        lbImg.alt = thumb ? thumb.alt : '';
        lbCap.textContent = btn.dataset.caption || '';
        lb.showModal();
      });
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('[data-lightbox-close]')) lb.close(); });
  }

  /* ---------------- Query-string prefill (quote form) ---------------- */
  var params = new URLSearchParams(window.location.search);
  $$('form[data-prefill]').forEach(function (form) {
    var product = params.get('product');
    var type = params.get('type');
    if (product) {
      var sel = form.elements.product;
      if (sel) {
        var match = Array.prototype.find.call(sel.options, function (o) { return o.value && product.toLowerCase().indexOf(o.value.toLowerCase()) === 0; });
        if (match) sel.value = match.value;
      }
      var msg = form.elements.message;
      if (msg && !msg.value) msg.value = 'I would like a quote for ' + product + '. Sizes and quantity: ';
    }
    if (type && form.elements.customer_type) {
      var t = Array.prototype.find.call(form.elements.customer_type.options, function (o) { return o.value === type; });
      if (t) form.elements.customer_type.value = type;
    }
  });

  /* ---------------- Forms: Formspree, with Netlify Forms fallback ---------------- */
  $$('form[data-ajax]').forEach(function (form) {
    var status = $('[data-form-status]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = $('[type="submit"]', form);
      var formspreeId = form.dataset.formspree;
      var useFormspree = formspreeId && formspreeId !== 'FORMSPREE_ID';
      var data = new FormData(form);
      var req = useFormspree
        ? fetch('https://formspree.io/f/' + formspreeId, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        : fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() });

      btn.disabled = true;
      status.className = 'mt-4 rounded-xl px-4 py-3 text-sm font-semibold bg-sunken text-ink';
      status.textContent = 'Sending…';
      req.then(function (res) {
        if (!res.ok) throw new Error(res.status);
        form.reset();
        status.className = 'mt-4 rounded-xl px-4 py-3 text-sm font-semibold bg-isi/10 text-isiink';
        status.textContent = 'Thank you! Your message has been sent. Our team will contact you shortly.';
      }).catch(function () {
        status.className = 'mt-4 rounded-xl px-4 py-3 text-sm font-semibold bg-orange/10 text-accent';
        status.innerHTML = status.dataset.error;
      }).then(function () { btn.disabled = false; });
    });
  });

  /* ---------------- Footer year ---------------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
