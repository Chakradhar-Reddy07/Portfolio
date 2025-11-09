// script.js - interactive behaviors for Chakradhar's portfolio

document.addEventListener('DOMContentLoaded', () => {
  // year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // theme toggle (moves knob + persists)
  const themeBtn = document.getElementById('themeToggle');
  const knob = themeBtn?.querySelector('.toggle-knob');
  const root = document.documentElement;

  function setTheme(mode) {
    if (mode === 'light') {
      root.classList.add('light');
      themeBtn.setAttribute('aria-pressed', 'true');
      if (knob) knob.style.transform = 'translateX(20px)';
      localStorage.setItem('site-theme', 'light');
    } else {
      root.classList.remove('light');
      themeBtn.setAttribute('aria-pressed', 'false');
      if (knob) knob.style.transform = 'translateX(0)';
      localStorage.setItem('site-theme', 'dark');
    }
  }

  // init theme from saved preference or system
  const saved = localStorage.getItem('site-theme');
  if (saved) setTheme(saved === 'light' ? 'light' : 'dark');
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) setTheme('light');
  else setTheme('dark');

  themeBtn?.addEventListener('click', () => {
    const isLight = root.classList.contains('light');
    setTheme(isLight ? 'dark' : 'light');
  });

  // Resume demo button
  const resumeBtn = document.getElementById('resumeBtn');
  resumeBtn?.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = 'resume.pdf'; // replace if you have resume file
    a.download = 'Chakradhar-Reddy-Resume.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // Intersection observer for reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('inview');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.card, .project-card, .portrait-wrap').forEach(el => io.observe(el));

  // portrait tilt / parallax
  const wrap = document.getElementById('portraitWrap');
  if (wrap) {
    const portrait = wrap.querySelector('.portrait');
    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx);
      const dy = (e.clientY - cy);
      const tx = (dx / r.width) * 12;
      const ty = (dy / r.height) * 12;
      const rot = (dx / r.width) * 6;
      wrap.style.setProperty('--tx', tx + 'px');
      wrap.style.setProperty('--ty', ty + 'px');
      wrap.style.setProperty('--r', rot + 'deg');
      wrap.classList.add('tilt');
      portrait.style.transform = `translateZ(40px) rotateY(${rot}deg) rotateX(${-ty/4}deg)`;
    };
    const onLeave = () => {
      wrap.style.setProperty('--tx', '0px');
      wrap.style.setProperty('--ty', '0px');
      wrap.style.setProperty('--r', '0deg');
      wrap.classList.remove('tilt');
      portrait.style.transform = 'translateZ(40px) rotateY(0deg) rotateX(0deg)';
    };
    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    wrap.addEventListener('touchmove', (ev) => {
      if (!ev.touches || !ev.touches[0]) return;
      onMove(ev.touches[0]);
    }, { passive: true });

    // keyboard focus slight effect
    wrap.addEventListener('focus', () => {
      wrap.classList.add('tilt');
      portrait.style.transform = 'translateZ(40px) rotateY(4deg) rotateX(-4deg)';
    });
    wrap.addEventListener('blur', () => onLeave());
  }

  // canvas ambient particles (lightweight)
  (function initParticles(){
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = 0;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight; init(); }
    function init(){
      particles = [];
      const count = Math.max(8, Math.round((w*h) / 180000));
      for(let i=0;i<count;i++){
        particles.push({
          x: Math.random()*w,
          y: Math.random()*h,
          r: Math.random()*1.3+0.6,
          vx: (Math.random()-0.5)*0.12,
          vy: (Math.random()-0.5)*0.12,
          alpha: Math.random()*0.28+0.06
        });
      }
    }
    function step(){
      ctx.clearRect(0,0,w,h);
      for(const p of particles){
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w+10;
        if (p.x > w+10) p.x = -10;
        if (p.y < -10) p.y = h+10;
        if (p.y > h+10) p.y = -10;
        const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*24);
        g.addColorStop(0, `rgba(0,229,255,${p.alpha})`);
        g.addColorStop(1, `rgba(0,179,255,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r*10,0,Math.PI*2);
        ctx.fill();
      }
      requestAnimationFrame(step);
    }
    addEventListener('resize', resize);
    resize(); step();
  })();

  // smooth nav scrolling
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const href = a.getAttribute('href');
      if (!href) return;
      const id = href.replace('#','');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // social icon stagger (simple appearance)
  document.querySelectorAll('.social-link').forEach((el, idx) => {
    el.style.transition = `transform .35s cubic-bezier(.2,.9,.3,1) ${idx*70}ms, box-shadow .35s ${idx*70}ms`;
  });
});
