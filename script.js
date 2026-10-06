/* ═══════════════════════════════════════════════════════
   ROMANTIC PROPOSAL — script.js
   Journey: Universe → Heart Constellation → Envelope → Letter → YES!
═══════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────
   LOVE LETTER CONTENT
   ───────────────────────────────────────────────────────── */
const LETTER = `My Dearest Niti,

I don't know the exact moment it happened —
maybe it was the way you laugh,
or how your eyes light up when you talk
about things you love.

Maybe it was the quiet moments,
the ones that felt completely ordinary,
but somehow stayed with me for days.

Somewhere between all of it —
the little things, the ordinary days,
the small glances and the silences —
I realized something extraordinary:

You are the first person I want to tell
when something good happens.
You are why I smile at a thought
mid-conversation and say "never mind."

You are the calm I didn't know I needed,
and the adventure I never knew I wanted.

I've written this letter a thousand times
in my head — never quite finding
the perfect words.

But today, I'm done waiting for perfect.

Because what I feel for you is real,
and it is worth every risk,
every word,
every heartbeat.

So here I am, Niti —
with my whole heart open —
asking you the most important question
I have ever asked anyone…`;

/* ─────────────────────────────────────────────────────────
   STATE
   ───────────────────────────────────────────────────────── */
let bgCanvas, bgCtx;
let stars = [];
let constellationStars = [];
let animFrameId = null;
let currentMode = 'universe';   // universe | constellation | envelope | letter
let isMuted = false;
let noMoveCount = 0;
let petalTimer = null;
let lastHeartTs = 0;

/* ─────────────────────────────────────────────────────────
   BOOTSTRAP
   ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initCursor();
  initHearts();
  initMusicBtn();
  buildStars(220);
  runUniverse();
});

/* ═══════════════════════════════════════════════════════
   CANVAS  ─ star / particle system
═══════════════════════════════════════════════════════ */
function initCanvas() {
  bgCanvas = document.getElementById('bg-canvas');
  bgCtx    = bgCanvas.getContext('2d');
  fitCanvas();
  window.addEventListener('resize', fitCanvas, { passive: true });
}

function fitCanvas() {
  bgCanvas.width  = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}

function buildStars(n) {
  // Use fewer stars on mobile to keep 60fps
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? Math.floor(n * 0.42) : n;
  stars = Array.from({ length: count }, makeStar);
}

function makeStar() {
  // Pre-compute RGB so the render loop never does string parsing or hsl conversion
  const t = Math.random();
  let rr, gg, bb;
  if (t < 0.10)      { rr = 245; gg = 160; bb = 215; }  // rose-pink star
  else if (t < 0.18) { rr = 240; gg = 210; bb = 135; }  // gold star
  else               {                                    // blue-white star
    rr = 190 + Math.floor(Math.random() * 65);
    gg = 195 + Math.floor(Math.random() * 60);
    bb = 225 + Math.floor(Math.random() * 30);
  }
  return {
    x:  Math.random() * (bgCanvas?.width  ?? window.innerWidth),
    y:  Math.random() * (bgCanvas?.height ?? window.innerHeight),
    r:  Math.random() * 1.4 + 0.3,
    a:  Math.random(),
    da: (Math.random() * 0.012 + 0.003) * (Math.random() < 0.5 ? 1 : -1),
    rr, gg, bb,          // pre-stored RGB — no hsl() in hot path
    tx: 0, ty: 0, inHeart: false,
  };
}

/* ─── drawing helpers ─── */
function drawBg(color1 = '#1a082e', color2 = '#060310') {
  const g = bgCtx.createRadialGradient(
    bgCanvas.width / 2, bgCanvas.height / 2, 0,
    bgCanvas.width / 2, bgCanvas.height / 2, bgCanvas.width * 0.85
  );
  g.addColorStop(0, color1);
  g.addColorStop(1, color2);
  bgCtx.fillStyle = g;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
}

function drawStar(s) {
  // Simple filled circle — no per-star gradient, keeps render loop fast
  bgCtx.beginPath();
  bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
  bgCtx.fillStyle = `rgba(${s.rr},${s.gg},${s.bb},${clamp(s.a, 0, 1).toFixed(2)})`;
  bgCtx.fill();
}



/* ═══════════════════════════════════════════════════════
   SCENE 1 — UNIVERSE
═══════════════════════════════════════════════════════ */
function runUniverse() {
  showScene('s-universe');
  currentMode = 'universe';
  cancelAF();

  const phrases = [
    'Close your eyes for a moment…',
    'Feel your heartbeat…',
    'This moment is just for you…',
  ];
  let pi = 0;
  const phraseEl = document.getElementById('universe-phrase');
  const subEl    = document.getElementById('universe-sub');

  function cyclePhrases() {
    if (currentMode !== 'universe') return;
    phraseEl.style.opacity = 0;
    setTimeout(() => {
      phraseEl.textContent = phrases[pi % phrases.length];
      phraseEl.style.opacity = '';
      pi++;
    }, 600);
  }
  const phraseTimer = setInterval(cyclePhrases, 3000);

  // Start twinkling loop
  (function loop() {
    if (currentMode !== 'universe') return;
    drawBg('#12062a', '#040210');
    const now = Date.now() / 1000;
    stars.forEach(s => {
      s.a += s.da;
      if (s.a <= 0 || s.a >= 1) s.da *= -1;
      drawStar(s);
    });
    // occasional shooting star
    if (Math.random() < 0.004) shootingStar();
    animFrameId = requestAnimationFrame(loop);
  })();

  // Transition to constellation after ~3.8 s
  setTimeout(() => {
    clearInterval(phraseTimer);
    runConstellation();
  }, 3800);
}

function shootingStar() {
  const sx   = Math.random() * bgCanvas.width * 0.7;
  const sy   = Math.random() * bgCanvas.height * 0.4;
  const len  = rand(80, 200);
  const ang  = deg2rad(rand(25, 50));

  const g = bgCtx.createLinearGradient(
    sx, sy,
    sx + len * Math.cos(ang),
    sy + len * Math.sin(ang)
  );
  g.addColorStop(0, 'rgba(255,248,255,0.9)');
  g.addColorStop(1, 'transparent');

  bgCtx.save();
  bgCtx.strokeStyle = g;
  bgCtx.lineWidth = 1.5;
  bgCtx.beginPath();
  bgCtx.moveTo(sx, sy);
  bgCtx.lineTo(sx + len * Math.cos(ang), sy + len * Math.sin(ang));
  bgCtx.stroke();
  bgCtx.restore();
}

/* ═══════════════════════════════════════════════════════
   SCENE 2 — HEART CONSTELLATION
═══════════════════════════════════════════════════════ */
let constellProgress = 0;  // 0 → 1 over time
let nMoveProgress   = 0;   // "Niti" text alpha

function runConstellation() {
  showScene('s-constellation');
  currentMode = 'constellation';
  cancelAF();

  // Pick ~48 stars to form the heart shape
  const W = bgCanvas.width, H = bgCanvas.height;
  const cx = W / 2;
  const cy = H / 2 - H * 0.04;
  const heartSize = Math.min(W, H) * 0.19;
  const heartPts  = heartPoints(cx, cy, heartSize, 48);

  constellationStars = [];
  heartPts.forEach((pt, i) => {
    const s = stars[i];
    s.tx = pt.x;
    s.ty = pt.y;
    s.inHeart = true;
    s.r  = rand(0.8, 2.2);
    // Pink/rose pre-computed RGB for constellation stars
    s.rr = Math.floor(rand(215, 255));
    s.gg = Math.floor(rand(100, 165));
    s.bb = Math.floor(rand(155, 210));
    constellationStars.push(s);
  });
  // Rest stay in place
  for (let i = heartPts.length; i < stars.length; i++) {
    stars[i].tx     = stars[i].x;
    stars[i].ty     = stars[i].y;
    stars[i].inHeart = false;
  }

  constellProgress = 0;
  nMoveProgress   = 0;
  const startTs = performance.now();
  const TOTAL_MS = 3800;

  (function loop(ts) {
    if (currentMode !== 'constellation') return;

    const t = clamp((ts - startTs) / TOTAL_MS, 0, 1);
    constellProgress = t;
    nMoveProgress   = clamp((t - 0.75) / 0.25, 0, 1);

    drawBg('#10052a', '#040210');
    stars.forEach(s => {
      // ease stars toward target
      s.x += (s.tx - s.x) * 0.04;
      s.y += (s.ty - s.y) * 0.04;

      s.a += s.da;
      if (s.a <= 0.1 || s.a >= 1) s.da *= -1;
      drawStar(s);
    });

    // draw heart connection lines
    if (t > 0.3) {
      const lineAlpha = clamp((t - 0.3) / 0.35, 0, 1) * 0.35;
      drawHeartLines(lineAlpha);
    }

    // big soft heart glow behind constellation
    if (t > 0.4) {
      const glowA = clamp((t - 0.4) / 0.4, 0, 1) * 0.22;
      drawHeartGlow(cx, cy, heartSize * 1.6, glowA);
    }

    // "Niti" text fades in
    if (nMoveProgress > 0) {
      drawNitiText(cx, cy + heartSize * 1.15, nMoveProgress);
    }

    animFrameId = requestAnimationFrame(loop);
  })(performance.now());

  // After full animation → envelope
  setTimeout(runEnvelope, TOTAL_MS + 1200);
}

function heartPoints(cx, cy, size, n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 2 * Math.PI;
    // classic parametric heart
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    pts.push({
      x: cx + (hx / 16) * size,
      y: cy + (hy / 16) * size,
    });
  }
  return pts;
}

function drawHeartLines(alpha) {
  if (constellationStars.length < 2) return;
  bgCtx.save();
  bgCtx.strokeStyle = `rgba(232,80,122,${alpha})`;
  bgCtx.lineWidth   = 0.6;
  bgCtx.beginPath();
  constellationStars.forEach((s, i) => {
    if (i === 0) bgCtx.moveTo(s.x, s.y);
    else         bgCtx.lineTo(s.x, s.y);
  });
  bgCtx.closePath();
  bgCtx.stroke();
  bgCtx.restore();
}

function drawHeartGlow(cx, cy, r, alpha) {
  const g = bgCtx.createRadialGradient(cx, cy * 0.97, 0, cx, cy, r);
  g.addColorStop(0,   `rgba(200,30,80,${alpha})`);
  g.addColorStop(0.5, `rgba(180,20,60,${alpha * 0.3})`);
  g.addColorStop(1,   'transparent');
  bgCtx.beginPath();
  bgCtx.arc(cx, cy, r, 0, Math.PI * 2);
  bgCtx.fillStyle = g;
  bgCtx.fill();
}

function drawNitiText(x, y, alpha) {
  bgCtx.save();
  const fs = Math.min(56, bgCanvas.width * 0.11);
  bgCtx.font      = `700 ${fs}px 'Dancing Script', cursive`;
  bgCtx.textAlign = 'center';
  bgCtx.globalAlpha = alpha;
  bgCtx.shadowColor = `rgba(212,168,83,0.9)`;
  bgCtx.shadowBlur  = 24;
  bgCtx.fillStyle   = `hsl(45,90%,78%)`;
  bgCtx.fillText('Niti', x, y);
  bgCtx.restore();
}

/* ═══════════════════════════════════════════════════════
   SCENE 3 — ENVELOPE
   Stars implode to centre, then envelope materialises
═══════════════════════════════════════════════════════ */
let implodeStart = null;
const IMPLODE_MS = 1000;

function runEnvelope() {
  currentMode = 'envelope';
  cancelAF();

  // Step 1: stars implode toward centre
  const cx = bgCanvas.width  / 2;
  const cy = bgCanvas.height / 2;
  stars.forEach(s => { s.tx = cx + rand(-10,10); s.ty = cy + rand(-10,10); });

  implodeStart = performance.now();

  (function implodeLoop(ts) {
    if (currentMode !== 'envelope') return;
    const t = clamp((ts - implodeStart) / IMPLODE_MS, 0, 1);

    drawBg('#10052a', '#040210');
    stars.forEach(s => {
      s.x += (s.tx - s.x) * 0.07;
      s.y += (s.ty - s.y) * 0.07;
      s.a = clamp(s.a * (1 - t * 0.06), 0, 1);
      drawStar(s);
    });

    // central burst ring
    if (t > 0.6) {
      const ra = clamp((t - 0.6) / 0.4, 0, 1);
      const rr = ra * 60;
      bgCtx.beginPath();
      bgCtx.arc(cx, cy, rr, 0, Math.PI * 2);
      bgCtx.strokeStyle = `rgba(212,168,83,${(1 - ra) * 0.8})`;
      bgCtx.lineWidth   = 2;
      bgCtx.stroke();
    }

    if (t < 1) {
      animFrameId = requestAnimationFrame(implodeLoop);
    } else {
      // Step 2: show envelope scene & start gentle star bg
      showScene('s-envelope');
      startGentleStarBg();
      initEnvelopeClick();
    }
  })(performance.now());
}

function startGentleStarBg() {
  // Rebuild faint stars
  buildStars(160);
  stars.forEach(s => { s.a *= 0.4; });

  (function loop() {
    if (currentMode !== 'envelope') return;
    drawBg('#14062e', '#060212');
    stars.forEach(s => {
      s.a += s.da * 0.3;
      if (s.a <= 0.02 || s.a >= 0.5) s.da *= -1;
      drawStar(s);
    });
    animFrameId = requestAnimationFrame(loop);
  })();
}

function initEnvelopeClick() {
  const env  = document.getElementById('envelope');
  const hint = document.getElementById('env-hint');

  function openIt() {
    env.classList.add('open');
    hint.style.opacity = '0';

    // Particle burst from envelope
    burstParticles(bgCanvas.width / 2, bgCanvas.height / 2, 60);

    setTimeout(runLetter, 1400);
  }

  env.addEventListener('click',   openIt, { once: true });
  env.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openIt(); }, { once: true });
  env.addEventListener('touchend', e => { e.preventDefault(); openIt(); }, { once: true, passive: false });
}

/* mini burst — canvas particles when envelope opens */
function burstParticles(ox, oy, count) {
  const particles = Array.from({ length: count }, () => {
    const isRose = Math.random() < 0.5;
    return {
      x: ox, y: oy,
      vx: (Math.random() - 0.5) * rand(2, 8),
      vy: (Math.random() - 0.5) * rand(2, 8),
      r: rand(1, 3),
      a: 1,
      rr: isRose ? Math.floor(rand(210,255)) : Math.floor(rand(200,240)),
      gg: isRose ? Math.floor(rand(80, 150)) : Math.floor(rand(165,215)),
      bb: isRose ? Math.floor(rand(100,170)) : Math.floor(rand(80, 140)),
    };
  });

  let last = performance.now();
  (function anim(ts) {
    const dt = (ts - last) / 16; last = ts;
    particles.forEach(p => {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 0.07 * dt;
      p.a  -= 0.018 * dt;
      p.vx *= 0.99;
    });
    particles.forEach(p => {
      if (p.a <= 0) return;
      bgCtx.beginPath();
      bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(${p.rr},${p.gg},${p.bb},${p.a.toFixed(2)})`;
      bgCtx.fill();
    });
    if (particles.some(p => p.a > 0)) requestAnimationFrame(anim);
  })(performance.now());
}

/* ═══════════════════════════════════════════════════════
   SCENE 4 — LOVE LETTER
═══════════════════════════════════════════════════════ */
function runLetter() {
  currentMode = 'letter';
  cancelAF();
  showScene('s-letter');
  startGentleLetterBg();
  startRosePetals();

  const paper = document.getElementById('letter-paper');
  setTimeout(() => {
    paper.classList.add('visible');
    // auto-play music now (user has interacted via envelope tap)
    tryPlayMusic();
    setTimeout(() => typewriter(LETTER, onLetterDone), 600);
  }, 300);
}

function startGentleLetterBg() {
  buildStars(100);
  stars.forEach(s => { s.a = Math.random() * 0.25; });

  (function loop() {
    if (currentMode !== 'letter') return;
    drawBg('#0a0420', '#040110');
    stars.forEach(s => {
      s.a += s.da * 0.2;
      if (s.a <= 0.01 || s.a >= 0.28) s.da *= -1;
      drawStar(s);
    });
    animFrameId = requestAnimationFrame(loop);
  })();
}

function typewriter(text, onDone) {
  const el  = document.getElementById('letter-text');
  const sig = document.getElementById('letter-sig');
  el.innerHTML = '';

  let i = 0, display = '';

  // append cursor span
  function renderCursor() { return '<span class="tw-cursor"></span>'; }

  function type() {
    if (i >= text.length) {
      el.innerHTML = nl2br(display);          // final without cursor
      sig.classList.add('visible');
      if (onDone) setTimeout(onDone, 1000);
      return;
    }
    display += text[i];
    el.innerHTML = nl2br(display) + renderCursor();

    // auto-scroll the scene
    const scene = document.getElementById('s-letter');
    scene.scrollTop = scene.scrollHeight;

    const ch = text[i];
    let delay = 35;
    if (ch === ',')                         delay = 130;
    else if (ch === '.' || ch === '…')      delay = 220;
    else if (ch === '!' || ch === '?')      delay = 200;
    else if (ch === '\n')                   delay = 170;
    else                                    delay = rand(22, 55);

    i++;
    setTimeout(type, delay);
  }
  type();
}

function nl2br(str) {
  return str.replace(/\n/g, '<br>');
}

function onLetterDone() {
  const qCard = document.getElementById('question-card');
  qCard.style.display = 'block';
  // Force reflow then animate in
  requestAnimationFrame(() => {
    qCard.classList.add('visible');
    const scene = document.getElementById('s-letter');
    setTimeout(() => { scene.scrollTop = scene.scrollHeight; }, 100);
  });

  initNoButton();
  document.getElementById('btn-yes').addEventListener('click',    runCelebration, { once: true });
  document.getElementById('btn-yes').addEventListener('touchend', e => { e.preventDefault(); runCelebration(); }, { once: true, passive: false });
}

/* ═══════════════════════════════════════════════════════
   NO BUTTON — runs away!
═══════════════════════════════════════════════════════ */
const NO_MSGS = [
  'No 😅', 'Hmm… 🤔', 'Nope~ 😂', 'Try again 😜',
  'Still no? 🙃', 'Think harder 💭', 'ok bye then 🙈',
];

function initNoButton() {
  const btn = document.getElementById('btn-no');
  noMoveCount = 0;

  function flee(e) {
    if (noMoveCount >= NO_MSGS.length - 1) {
      // Disappear on final attempt
      btn.style.transition = 'opacity 0.4s, transform 0.4s';
      btn.style.opacity    = '0';
      btn.style.transform  = 'scale(0)';
      btn.style.pointerEvents = 'none';
      return;
    }
    noMoveCount++;
    btn.textContent = NO_MSGS[noMoveCount];

    // Place button at a random position on the viewport
    const bw = btn.offsetWidth  || 130;
    const bh = btn.offsetHeight || 50;
    const maxX = window.innerWidth  - bw  - 16;
    const maxY = window.innerHeight - bh  - 16;
    const nx = clamp(rand(16, maxX), 8, maxX);
    const ny = clamp(rand(16, maxY), 8, maxY);

    btn.style.position   = 'fixed';
    btn.style.left       = nx + 'px';
    btn.style.top        = ny + 'px';
    btn.style.zIndex     = '600';
    btn.style.transition = 'left 0.2s, top 0.2s';
  }

  btn.addEventListener('mouseenter', flee);
  btn.addEventListener('touchstart',  e => { e.preventDefault(); flee(e); }, { passive: false });
}

/* ═══════════════════════════════════════════════════════
   SCENE 5 — CELEBRATION
═══════════════════════════════════════════════════════ */
function runCelebration() {
  currentMode = 'celebration';
  cancelAF();
  showScene('s-celebration');
  stopRosePetals();
  launchConfetti();
}

function launchConfetti() {
  const cnv = document.getElementById('confetti-canvas');
  cnv.width  = window.innerWidth;
  cnv.height = window.innerHeight;
  const ctx  = cnv.getContext('2d');

  const POOL = ['💖','💕','💗','💓','🌹','✨','💫','🎉','💌','🌸','🩷','💝'];

  const pieces = Array.from({ length: 180 }, () => ({
    x:  rand(0, cnv.width),
    y:  rand(-cnv.height, 0),          // start off-screen above
    vx: rand(-2.5, 2.5),
    vy: rand(1.5, 5),
    rot: rand(0, 360),
    drot: rand(-4, 4),
    sz:  rand(16, 30),
    em:  POOL[Math.floor(Math.random() * POOL.length)],
    a:   1,
  }));

  (function loop() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    pieces.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.drot;
      if (p.y > cnv.height + 60) {
        p.y = rand(-80, -20);
        p.x = rand(0, cnv.width);
      }
      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.font        = `${p.sz}px serif`;
      ctx.textAlign   = 'center';
      ctx.translate(p.x, p.y);
      ctx.rotate(deg2rad(p.rot));
      ctx.fillText(p.em, 0, 0);
      ctx.restore();
    });
    requestAnimationFrame(loop);
  })();
}

/* ═══════════════════════════════════════════════════════
   FLOATING HEARTS (cursor / touch trail)
═══════════════════════════════════════════════════════ */
const HEART_SET = ['💕','💖','💗','💓','❤️','🩷','💝','💞','✨'];

function initHearts() {
  document.addEventListener('mousemove', throttleHeart, { passive: true });
  document.addEventListener('touchmove', e => {
    [...e.touches].forEach(t => spawnHeart(t.clientX, t.clientY));
  }, { passive: true });
}

function throttleHeart(e) {
  const now = Date.now();
  if (now - lastHeartTs < 110) return;
  lastHeartTs = now;
  spawnHeart(e.clientX, e.clientY);
}

function spawnHeart(x, y) {
  const container = document.getElementById('hearts');
  const el        = document.createElement('span');
  el.className    = 'fheart';
  el.textContent  = HEART_SET[Math.floor(Math.random() * HEART_SET.length)];

  const ox  = rand(-22, 22);
  const sz  = rand(14, 26);
  const dur = rand(1.4, 2.4);
  const r0  = rand(-20, 20) + 'deg';
  const r1  = rand(-30, 30) + 'deg';
  const r2  = rand(-10, 10) + 'deg';

  el.style.cssText = `
    left: ${x + ox}px;
    top:  ${y}px;
    font-size: ${sz}px;
    --dur: ${dur}s;
    --r0: ${r0}; --r1: ${r1}; --r2: ${r2};
  `;
  container.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000 + 100);
}

/* ═══════════════════════════════════════════════════════
   CUSTOM CURSOR (desktop)
═══════════════════════════════════════════════════════ */
function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return; // skip on touch-only
  const cur = document.getElementById('cursor');
  document.addEventListener('mousemove', e => {
    cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════
   ROSE PETALS
═══════════════════════════════════════════════════════ */
const PETALS = ['🌸','🌷','🌺','🌹'];

function startRosePetals() {
  if (petalTimer) clearInterval(petalTimer);
  petalTimer = setInterval(spawnPetal, 1100);
}

function stopRosePetals() {
  if (petalTimer) clearInterval(petalTimer);
}

function spawnPetal() {
  const el  = document.createElement('span');
  el.className = 'rpetal';
  el.textContent = PETALS[Math.floor(Math.random() * PETALS.length)];

  const dur  = rand(6, 11);
  const sx   = rand(-60, 60);
  const rot  = rand(360, 900) * (Math.random() < 0.5 ? 1 : -1);

  el.style.cssText = `
    left: ${rand(-2, 100)}vw;
    font-size: ${rand(12, 22)}px;
    --pdur: ${dur}s;
    --psx:  ${sx}px;
    --prot: ${rot}deg;
    animation-duration: ${dur}s;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), (dur + 0.5) * 1000);
}

/* ═══════════════════════════════════════════════════════
   MUSIC
═══════════════════════════════════════════════════════ */
function initMusicBtn() {
  const btn  = document.getElementById('music-btn');
  const icon = document.getElementById('music-icon');
  const mus  = document.getElementById('bg-music');

  mus.volume = 0.35;

  btn.addEventListener('click', () => {
    isMuted = !isMuted;
    mus.muted = isMuted;
    icon.textContent = isMuted ? '🔇' : '♫';
    if (!isMuted) tryPlayMusic();
  });
}

function tryPlayMusic() {
  const mus = document.getElementById('bg-music');
  mus.volume = 0.35;
  mus.play().catch(() => {/* blocked by autoplay policy — user can click ♫ */});
}

/* ═══════════════════════════════════════════════════════
   SCENE SWITCHER
═══════════════════════════════════════════════════════ */
function showScene(id) {
  document.querySelectorAll('.scene').forEach(s => {
    s.classList.remove('active');
  });
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

/* ═══════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════ */
function cancelAF() {
  if (animFrameId != null) { cancelAnimationFrame(animFrameId); animFrameId = null; }
}
function rand(a, b)    { return a + Math.random() * (b - a); }
function clamp(v,a,b)  { return Math.max(a, Math.min(b, v)); }
function deg2rad(d)    { return d * Math.PI / 180; }
