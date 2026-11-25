/* Portfolio interactions — Nishanth S */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---- Theme (persisted) ---- */
  const icon = $('#themeIcon');
  const applyTheme = t => { root.dataset.theme = t; icon.textContent = t === 'dark' ? '☾' : '☀'; };
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  applyTheme(saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  $('#themeBtn').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---- Loader + hero intro ---- */
  const startHero = () => {
    $('#loader').classList.add('done');
    $$('[data-split]').forEach(el => {
      const txt = el.textContent; el.textContent = ''; el.setAttribute('aria-label', txt);
      [...txt].forEach((c, i) => {
        const s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true');
        s.textContent = c === ' ' ? '\u00A0' : c; s.style.animationDelay = (i * 60 + 200) + 'ms'; el.appendChild(s);
      });
    });
    $$('.hero .reveal').forEach((el, i) => { el.style.setProperty('--d', (0.5 + i * 0.15) + 's'); el.classList.add('in'); });
    typer();
  };
  window.addEventListener('load', () => setTimeout(startHero, reduced ? 0 : 1500));

  /* ---- Typing effect ---- */
  function typer() {
    const words = ['full-stack web applications.', 'AI-powered products.', 'API-driven, cloud-backed systems.', 'solutions I can trace to the root cause.'];
    const el = $('#typed'); let w = 0, c = 0, del = false;
    if (reduced) { el.textContent = words[0]; return; }
    (function tick() {
      const word = words[w];
      el.textContent = word.slice(0, c += del ? -1 : 1);
      let d = del ? 28 : 60;
      if (!del && c === word.length) { del = true; d = 1700; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; d = 350; }
      setTimeout(tick, d);
    })();
  }

  /* ---- Scroll reveal with stagger, counters ---- */
  const countUp = el => {
    const target = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1600;
    (function step(t) {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toFixed(dec) + (p === 1 ? suf : '');
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target; el.classList.add('in');
      const n = $('[data-count]', el); if (n) countUp(n);
      io.unobserve(el);
    });
  }, { threshold: .15 });
  $$('.reveal').filter(el => !el.closest('.hero')).forEach(el => {
    const sib = [...el.parentElement.children].filter(x => x.classList.contains('reveal'));
    el.style.setProperty('--d', Math.max(sib.indexOf(el), 0) * 0.09 + 's');
    io.observe(el);
  });

  /* ---- Nav: scroll progress, active section, mobile menu ---- */
  const bar = $('#progress'), links = $$('#menu a'), burger = $('#burger'), menu = $('#menu');
  addEventListener('scroll', () => {
    const h = root.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
  }, { passive: true });
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => so.observe(s));
  const toggleMenu = open => {
    menu.classList.toggle('open', open); burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
  links.forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });

  /* ---- Project filters and expandable details ---- */
  $$('.fbtn').forEach(b => b.addEventListener('click', () => {
    $$('.fbtn').forEach(x => x.classList.toggle('active', x === b));
    $$('.card').forEach(c => c.classList.toggle('hide', b.dataset.f !== 'all' && !c.dataset.cat.includes(b.dataset.f)));
  }));
  $$('.more').forEach(b => b.addEventListener('click', () => {
    const d = b.nextElementSibling, open = !d.classList.contains('open');
    d.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
    b.firstChild.textContent = open ? 'Hide details' : 'Show details';
  }));

  /* ---- Card tilt + magnetic buttons (pointer devices only) ---- */
  if (!reduced && matchMedia('(hover: hover)').matches) {
    $$('.tilt').forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      });
      c.addEventListener('mouseleave', () => c.style.transform = '');
    });
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });
  }

  /* ---- Copy email ---- */
  $('#copyMail').addEventListener('click', async () => {
    const msg = $('#copyMsg'), mail = 'nishanth67923@gmail.com';
    try { await navigator.clipboard.writeText(mail); msg.textContent = 'Copied to clipboard'; }
    catch (e) { msg.textContent = mail; }
    setTimeout(() => msg.textContent = 'Click to copy address', 2200);
  });
  $('#year').textContent = new Date().getFullYear();

  /* ---- Particle network background ---- */
  const cv = $('#bg'), ctx = cv.getContext('2d'); let W, H, pts = [], mouse = { x: -999, y: -999 };
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
    pts = Array.from({ length: Math.min(70, Math.floor(innerWidth / 18)) }, () => ({
      x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35 * dpr, vy: (Math.random() - .5) * .35 * dpr, r: (Math.random() * 1.6 + .6) * dpr
    }));
  };
  addEventListener('resize', resize); resize();
  addEventListener('mousemove', e => { const d = Math.min(devicePixelRatio || 1, 2); mouse.x = e.clientX * d; mouse.y = e.clientY * d; });
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    const dark = root.dataset.theme === 'dark', col = dark ? '124,92,255' : '91,61,245', lim = 140 * (W / innerWidth);
    pts.forEach((p, i) => {
      if (!reduced) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = `rgba(${col},.7)`; ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < lim) { ctx.strokeStyle = `rgba(${col},${(1 - d / lim) * .22})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (md < lim * 1.2) { ctx.strokeStyle = `rgba(34,211,238,${(1 - md / (lim * 1.2)) * .35})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    });
    if (!reduced) requestAnimationFrame(draw);
  })();
})();
