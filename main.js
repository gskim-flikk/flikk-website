/* flikk — motion & interaction (no dependencies) */
(() => {
  const doc = document.documentElement;
  doc.classList.add('js');

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let vw = innerWidth, vh = innerHeight;

  /* ---------- header ---------- */
  const header = $('.site-header');
  const toggle = $('.nav-toggle');
  const navList = $('#nav-list');
  let lastY = scrollY;
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', open);
    navList.classList.toggle('open', open);
  });
  navList.addEventListener('click', e => {
    if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); navList.classList.remove('open'); }
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach(el => reduced ? el.classList.add('in') : io.observe(el));

  /* ---------- hero logo: games ⇄ studio, eyes follow pointer ---------- */
  const heroLogo = $('.hero-logo');
  const heroEyes = $('.hero-logo .spark-eyes');
  const heroSpark = $('.hero-logo .lg-spark');
  let sub = 'games';
  const setSub = s => { sub = s; heroLogo.dataset.sub = s; };
  setTimeout(() => setSub('games'), reduced ? 0 : 1500);
  let subTimer = setInterval(() => setSub(sub === 'games' ? 'studio' : 'games'), 3200);
  heroLogo.addEventListener('click', () => {
    clearInterval(subTimer);
    setSub(sub === 'games' ? 'studio' : 'games');
    subTimer = setInterval(() => setSub(sub === 'games' ? 'studio' : 'games'), 3200);
  });

  const eyeSets = $$('.spark-eyes');
  setInterval(() => {
    eyeSets.forEach(e => { e.classList.remove('blink-now'); void e.getBBox(); e.classList.add('blink-now'); });
  }, 3700);

  /* ---------- hero parallax ---------- */
  const hero = $('.hero');
  const floaters = $$('[data-depth]');
  const buddy = $('.buddy');
  if (!reduced) {
    addEventListener('pointermove', e => {
      // eyes look toward the pointer
      const r = heroSpark.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 300);
      heroEyes.style.transform = `translate(${(dx / d) * 9 * k}px, ${(dy / d) * 10 * k}px)`;
      // floating decor drifts against the pointer
      if (scrollY < vh) {
        const mx = e.clientX / vw - 0.5, my = e.clientY / vh - 0.5;
        floaters.forEach(f => {
          const dpt = +f.dataset.depth;
          f.style.setProperty('--px', `${-mx * dpt * 40}px`);
          f.style.setProperty('--py', `${-my * dpt * 40}px`);
        });
      }
    }, { passive: true });
  }
  buddy.addEventListener('click', () => {
    buddy.classList.remove('boing'); void buddy.offsetWidth; buddy.classList.add('boing');
    setTimeout(() => buddy.classList.remove('boing'), 720);
  });

  /* ---------- counters ---------- */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      countIO.unobserve(en.target);
      const el = en.target, end = +el.dataset.count;
      if (reduced) { el.textContent = end; return; }
      const start = end > 1000 ? end - 60 : 0, t0 = performance.now(), dur = 1600;
      const tick = now => {
        const p = clamp((now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(start + (end - start) * e);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- scrub text (word by word) ---------- */
  const scrub = $('[data-scrub-text]');
  const words = scrub.textContent.trim().split(/\s+/);
  scrub.innerHTML = words.map(w =>
    `<span class="w${/즐거움|게임|재미/.test(w) ? ' hl' : ''}">${w}</span>`).join(' ');
  const wordEls = $$('.w', scrub);

  /* ---------- careers split title ---------- */
  const split = $('[data-split]');
  let ci = 0;
  split.innerHTML = split.innerHTML.split(/(<br>)/).map(part => part === '<br>' ? part :
    [...part].map(c => c === ' ' ? ' ' : `<span class="ch" style="--ci:${ci++}">${c}</span>`).join('')).join('');
  new IntersectionObserver((ents, obs) => ents.forEach(en => {
    if (en.isIntersecting) { split.classList.add('in'); obs.disconnect(); }
  }), { threshold: 0.4 }).observe(split);

  /* ---------- footer logo ---------- */
  const footLogo = $('.foot-logo');
  const footLetters = $$('.fl', footLogo);
  new IntersectionObserver((ents, obs) => ents.forEach(en => {
    if (en.isIntersecting) { footLogo.classList.add('in'); obs.disconnect(); }
  }), { threshold: 0.3 }).observe(footLogo);
  footLogo.addEventListener('animationend', e => e.target.style.animation = 'none');
  if (!reduced) setInterval(() => {
    const l = footLetters[Math.floor(Math.random() * footLetters.length)];
    l.classList.add('jump'); setTimeout(() => l.classList.remove('jump'), 300);
  }, 1800);

  /* ---------- studio product mock: inbox → AI draft → quote → split ---------- */
  const mock = $('.mock');
  const total = $('[data-mock-total]');
  let mockStep = 0, mockTimer = null;
  const runTotal = () => {
    const end = 4860000, t0 = performance.now();
    const tick = now => {
      const p = clamp((now - t0) / 1100), e = 1 - Math.pow(1 - p, 3);
      total.textContent = Math.round(end * e).toLocaleString('ko-KR');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const mockTick = () => {
    mockStep = (mockStep + 1) % 9; // 1–6 build up, 7–8 hold, 0 resets
    for (let i = 1; i <= 6; i++) mock.classList.toggle(`s${i}`, mockStep >= i);
    if (mockStep === 5) runTotal();
    if (mockStep === 0) total.textContent = '0';
  };
  if (reduced) { for (let i = 1; i <= 6; i++) mock.classList.add(`s${i}`); total.textContent = '4,860,000'; }
  else new IntersectionObserver(ents => ents.forEach(en => {
    if (en.isIntersecting && !mockTimer) { mockTick(); mockTimer = setInterval(mockTick, 1300); }
    else if (!en.isIntersecting && mockTimer) { clearInterval(mockTimer); mockTimer = null; }
  }), { threshold: 0.3 }).observe(mock);

  /* ---------- tilt cards & magnetic buttons ---------- */
  if (finePointer && !reduced) {
    $$('.tilt').forEach(card => {
      const inner = $('.tilt-inner', card);
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        inner.style.setProperty('--ry', `${x * 10}deg`);
        inner.style.setProperty('--rx', `${-y * 10}deg`);
      });
      card.addEventListener('pointerleave', () => { inner.style.setProperty('--rx', '0deg'); inner.style.setProperty('--ry', '0deg'); });
    });
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', `${(e.clientX - r.left - r.width / 2) * 0.25}px`);
        btn.style.setProperty('--my', `${(e.clientY - r.top - r.height / 2) * 0.35}px`);
      });
      btn.addEventListener('pointerleave', () => { btn.style.setProperty('--mx', '0px'); btn.style.setProperty('--my', '0px'); });
    });
  }

  /* ---------- marquees (speed follows scroll velocity) ---------- */
  const marquees = $$('.marquee').map(m => {
    const track = $('.marquee-track', m);
    const html = track.innerHTML;
    track.innerHTML = html + html;
    return { m, track, html, x: 0, w: 0, speed: +m.dataset.speed };
  });
  const measureMarquees = () => marquees.forEach(q => {
    q.track.innerHTML = q.html + q.html;
    q.w = q.track.scrollWidth / 2;
    let copies = 2;
    while (q.track.scrollWidth < vw + q.w && copies < 8) { q.track.innerHTML += q.html; copies++; }
  });

  /* ---------- games: pinned horizontal scroll ---------- */
  const games = $('.games');
  const track = $('.games-track');
  const progress = $('.games-progress');
  let gamesDist = 0;
  const pinOn = () => vw > 760;
  const measureGames = () => {
    if (!pinOn()) { games.style.removeProperty('--games-h'); track.style.transform = ''; return; }
    gamesDist = Math.max(0, track.scrollWidth - vw);
    games.style.setProperty('--games-h', `${gamesDist + vh}px`);
  };

  /* ---------- process path ---------- */
  const wrap = $('.path-wrap');
  const svg = $('.path-svg', wrap);
  const pBg = $('.path-bg', svg), pFg = $('.path-fg', svg), rider = $('.path-rider', svg);
  const steps = $$('.steps li', wrap);
  const STEP_T = [0.1, 0.37, 0.64, 0.9];
  let pathLen = 0;
  const buildPath = () => {
    const w = wrap.clientWidth, h = wrap.clientHeight, mobile = w < 700;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const cx = mobile ? 30 : w / 2, amp = mobile ? 14 : Math.min(w * 0.16, 190);
    const pt = t => [cx + amp * Math.sin(t * Math.PI * 4 + Math.PI / 2 * 0), 40 + t * (h - 80)];
    let d = '';
    for (let i = 0; i <= 160; i++) { const [x, y] = pt(i / 160); d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; }
    pBg.setAttribute('d', d); pFg.setAttribute('d', d);
    pathLen = pFg.getTotalLength();
    pFg.style.strokeDasharray = pathLen;
    steps.forEach((li, i) => {
      const [x, y] = pt(STEP_T[i]);
      li.style.top = `${y - li.offsetHeight / 2}px`;
      if (mobile) { li.style.left = '68px'; li.style.right = '0'; return; }
      li.style.right = 'auto';
      const lw = li.offsetWidth;
      // sit just outside the curve's bulge at this step
      li.style.left = `${x >= cx ? Math.min(w - lw, x + 56) : Math.max(0, x - 56 - lw)}px`;
    });
  };

  /* ---------- the scroll/raf loop ---------- */
  const careersSparks = $$('.c-spark');
  const careers = $('.careers');
  let velocity = 0, smoothV = 0, lastT = performance.now(), dir = 1;

  const onScrollFrame = () => {
    const y = scrollY;
    // header
    header.classList.toggle('scrolled', y > 20);
    header.classList.toggle('hide', y > lastY && y > 500 && !navList.classList.contains('open'));
    velocity = y - lastY;
    if (velocity) dir = Math.sign(velocity);
    lastY = y;

    // hero hills sink as you scroll
    if (y < vh * 1.2) hero.style.setProperty('--hills-y', `${y * 0.18}px`);

    // scrub text
    const sr = scrub.getBoundingClientRect();
    const sp = reduced ? 1 : clamp((vh * 0.82 - sr.top) / (sr.height + vh * 0.3));
    const on = Math.round(sp * wordEls.length);
    wordEls.forEach((w, i) => w.classList.toggle('on', i < on));

    // games pin
    if (pinOn() && gamesDist) {
      const gr = games.getBoundingClientRect();
      const gp = clamp(-gr.top / gamesDist);
      track.style.transform = `translate3d(${-gp * gamesDist}px,0,0)`;
      progress.style.setProperty('--p', gp.toFixed(4));
    }

    // process path
    const wr = wrap.getBoundingClientRect();
    if (wr.top < vh && wr.bottom > 0 && pathLen) {
      const pp = clamp((vh * 0.62 - wr.top) / wr.height);
      pFg.style.strokeDashoffset = pathLen * (1 - pp);
      const p = pFg.getPointAtLength(pathLen * pp);
      rider.setAttribute('transform', `translate(${p.x} ${p.y})`);
      steps.forEach((li, i) => li.classList.toggle('on', pp >= STEP_T[i] - 0.02));
    }

    // careers sparks parallax
    const cr = careers.getBoundingClientRect();
    if (cr.top < vh && cr.bottom > 0 && !reduced) {
      careersSparks.forEach((s, i) => s.style.setProperty('--cy', `${(cr.top - vh / 2) * (0.12 + i * 0.08)}px`));
    }
  };

  const loop = now => {
    const dt = Math.min(64, now - lastT); lastT = now;
    onScrollFrame();
    if (!reduced) {
      smoothV += (Math.abs(velocity) - smoothV) * 0.08;
      const boost = 1 + Math.min(smoothV, 80) / 8;
      marquees.forEach(q => {
        if (!q.w) return;
        q.x -= q.speed * dir * 0.06 * dt * boost;
        if (q.x <= -q.w) q.x += q.w;
        if (q.x > 0) q.x -= q.w;
        q.track.style.transform = `translate3d(${q.x}px,0,0)`;
      });
    }
    requestAnimationFrame(loop);
  };

  /* ---------- click → spark burst ---------- */
  const COLORS = [['#2455E8', '#F7F2E8'], ['#FFE58A', '#2455E8'], ['#18213A', '#FFE58A']];
  if (!reduced) addEventListener('click', e => {
    if (e.target.closest('a, button, input, textarea')) return;
    for (let i = 0; i < 9; i++) {
      const [c, eye] = COLORS[i % COLORS.length];
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('class', 'burst');
      s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      s.style.setProperty('--spark', c); s.style.setProperty('--eye', eye);
      s.innerHTML = '<use href="#spark"/>';
      document.body.appendChild(s);
      const a = (Math.PI * 2 * i) / 9 + Math.random() * 0.5, dist = 60 + Math.random() * 70;
      const size = 0.6 + Math.random() * 0.9;
      s.animate([
        { transform: `translate(0,0) scale(0) rotate(0)`, opacity: 1 },
        { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist}px) scale(${size}) rotate(${(Math.random() - .5) * 360}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${Math.cos(a) * dist * 1.1}px, ${Math.sin(a) * dist + 40}px) scale(0) rotate(0)`, opacity: 0 }
      ], { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => s.remove();
    }
  });

  /* ---------- layout ---------- */
  const layout = () => {
    vw = innerWidth; vh = innerHeight;
    measureMarquees(); measureGames(); buildPath(); onScrollFrame();
  };
  addEventListener('resize', () => { clearTimeout(layout.t); layout.t = setTimeout(layout, 120); });
  layout();
  document.fonts?.ready.then(layout);
  addEventListener('load', layout);
  requestAnimationFrame(loop);
})();
