(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  const skillsSection = document.querySelector(".skills");
  if (skillsSection) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      skillsSection.classList.add("in-view");
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              skillsSection.classList.add("in-view");
              observer.unobserve(skillsSection);
            }
          });
        },
        { threshold: 0.25 }
      );
      observer.observe(skillsSection);
    }
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function typeText(el, text, speed = 38) {
    return new Promise((resolve) => {
      const typed = document.createElement("span");
      typed.className = "typed";
      const caret = document.createElement("span");
      caret.className = "caret";
      caret.setAttribute("aria-hidden", "true");
      el.append(typed, caret);

      if (reducedMotion) {
        typed.textContent = text;
        el.classList.add("done");
        resolve();
        return;
      }

      let i = 0;
      const tick = () => {
        typed.textContent = text.slice(0, i + 1);
        i += 1;
        if (i < text.length) {
          window.setTimeout(tick, speed + Math.random() * 28);
        } else {
          el.classList.add("done");
          resolve();
        }
      };
      tick();
    });
  }

  async function runTypewriters() {
    const profileName = document.querySelector(".profile-name.typewriter");
    const profileRole = document.querySelector(".profile-role.typewriter");
    const profileLocation = document.querySelector(".profile-location.typewriter");

    if (profileName) await typeText(profileName, profileName.dataset.text || "", 36);
    if (profileRole) await typeText(profileRole, profileRole.dataset.text || "", 28);
    if (profileLocation) await typeText(profileLocation, profileLocation.dataset.text || "", 34);
  }

  runTypewriters();

  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stars = [];
  let shooting = [];
  let width = 0;
  let height = 0;

  function createStars() {
    const count = Math.min(420, Math.floor((width * height) / 4500));
    stars = Array.from({ length: count }, () => {
      const bright = Math.random() > 0.82;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: bright ? Math.random() * 1.8 + 1 : Math.random() * 1.1 + 0.25,
        a: bright ? Math.random() * 0.35 + 0.65 : Math.random() * 0.55 + 0.25,
        s: Math.random() * 0.12 + 0.02,
        tw: Math.random() * Math.PI * 2,
        sparkle: bright,
      };
    });
  }

  function spawnShootingStar() {
    if (reduced || Math.random() > 0.015) return;
    shooting.push({
      x: Math.random() * width * 0.8,
      y: Math.random() * height * 0.4,
      len: Math.random() * 80 + 60,
      speed: Math.random() * 8 + 6,
      life: 1,
      angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
    });
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createStars();
  }

  function draw(time) {
    ctx.fillStyle = "#07010f";
    ctx.fillRect(0, 0, width, height);

    for (const star of stars) {
      const twinkle = reduced
        ? star.a
        : star.a * (0.45 + 0.55 * Math.sin(time * 0.002 + star.tw));

      if (star.sparkle) {
        ctx.save();
        ctx.globalAlpha = twinkle * 0.45;
        ctx.strokeStyle = "#fff0f8";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(star.x - star.r * 3.5, star.y);
        ctx.lineTo(star.x + star.r * 3.5, star.y);
        ctx.moveTo(star.x, star.y - star.r * 3.5);
        ctx.lineTo(star.x, star.y + star.r * 3.5);
        ctx.stroke();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 240, 248, ${twinkle})`;
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();

      if (!reduced) {
        star.y += star.s;
        if (star.y > height + 2) {
          star.y = -2;
          star.x = Math.random() * width;
        }
      }
    }

    spawnShootingStar();

    for (let i = shooting.length - 1; i >= 0; i--) {
      const s = shooting[i];
      const tx = Math.cos(s.angle) * s.len;
      const ty = Math.sin(s.angle) * s.len;

      const grad = ctx.createLinearGradient(s.x, s.y, s.x + tx, s.y + ty);
      grad.addColorStop(0, `rgba(255, 245, 251, ${s.life})`);
      grad.addColorStop(1, "rgba(249, 168, 212, 0)");

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + tx, s.y + ty);
      ctx.stroke();

      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.life -= 0.018;

      if (s.life <= 0) shooting.splice(i, 1);
    }

    if (!reduced) requestAnimationFrame(draw);
  }

  resize();
  draw(0);
  window.addEventListener("resize", resize);
})();
