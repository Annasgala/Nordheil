function sayHello() {
  alert("Ти вже відкрила ворота Nordheil ❄🌑");
}

/* ===== Snow (canvas) ===== */
(function initSnow(){
  const canvas = document.getElementById("snow");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  const state = {
    w: 0,
    h: 0,
    flakes: [],
    maxFlakes: 140,
    wind: 0.25,
    windTarget: 0.25,
    last: performance.now()
  };

  function resize() {
    state.w = canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
    state.h = canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
  }

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function makeFlake(resetY = false) {
    const r = rand(0.8, 2.6) * devicePixelRatio;
    return {
      x: rand(0, state.w),
      y: resetY ? rand(-state.h, 0) : rand(0, state.h),
      r,
      vy: rand(0.35, 1.35) * devicePixelRatio,
      vx: rand(-0.15, 0.15) * devicePixelRatio,
      a: rand(0.25, 0.85),
      tw: rand(0.6, 1.6),      // twinkle speed
      t: rand(0, Math.PI * 2)  // twinkle phase
    };
  }

  function seed() {
    state.flakes = [];
    for (let i = 0; i < state.maxFlakes; i++) state.flakes.push(makeFlake());
  }

  function step(now) {
    const dt = Math.min(34, now - state.last); // clamp
    state.last = now;

    // slowly change wind for natural motion
    state.windTarget += rand(-0.02, 0.02);
    state.windTarget = Math.max(-0.65, Math.min(0.65, state.windTarget));
    state.wind += (state.windTarget - state.wind) * 0.0025 * dt;

    ctx.clearRect(0, 0, state.w, state.h);

    for (const f of state.flakes) {
      f.t += 0.002 * dt * f.tw;

      const twinkle = 0.65 + 0.35 * Math.sin(f.t);
      const alpha = f.a * twinkle;

      f.x += (f.vx + state.wind) * dt * 0.9;
      f.y += f.vy * dt * 0.9;

      // wrap
      if (f.y - f.r > state.h) {
        Object.assign(f, makeFlake(true));
        f.y = -f.r;
      }
      if (f.x < -40) f.x = state.w + 40;
      if (f.x > state.w + 40) f.x = -40;

      // draw flake (soft glow)
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = `rgba(230,240,255,${alpha})`;
      ctx.fill();

      // tiny halo
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 2.2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = `rgba(122,162,255,${alpha * 0.06})`;
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  window.addEventListener("resize", () => {
    resize();
    seed();
  });

  resize();
  seed();
  requestAnimationFrame(step);
})();