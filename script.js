document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");
  const navLinks = document.querySelectorAll(".nav-link");
  const yearSpan = document.getElementById("year");

  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ---- Mobile nav toggle ----
  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isExpanded));
      navList.classList.toggle("open");
    });
  }

  // ---- Smooth scroll ----
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (navList && navList.classList.contains("open")) {
        navList.classList.remove("open");
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  // ---- Active nav on scroll ----
  const sections = document.querySelectorAll("main section[id]");
  const onScroll = () => {
    const scrollY = window.scrollY + 140;
    let currentId = "";
    sections.forEach((s) => {
      if (scrollY >= s.offsetTop) currentId = s.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      link.classList.toggle("active", href.substring(1) === currentId);
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Reveal on scroll ----
  const reveals = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("visible"), i * 80);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  reveals.forEach((el) => revealObserver.observe(el));

  // ---- Counter animation ----
  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          let current = 0;
          const step = () => {
            current++;
            el.textContent = current;
            if (current < target) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  // ---- Cursor glow ----
  const cursorGlow = document.querySelector(".cursor-glow");
  if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("mousemove", (e) => {
      cursorGlow.style.left = e.clientX + "px";
      cursorGlow.style.top = e.clientY + "px";
    });
  }

  // ---- Card hover glow ----
  document.querySelectorAll(".card-glow").forEach((glow) => {
    const card = glow.parentElement;
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      glow.style.setProperty("--mouse-x", x + "%");
      glow.style.setProperty("--mouse-y", y + "%");
    });
  });

  // ---- Constellation background ----
  const canvas = document.getElementById("constellation");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width, height, particles, mouse;
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 130;
  const MOUSE_DIST = 180;

  mouse = { x: -999, y: -999 };
  document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.5 + 0.5,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(129, 140, 248, 0.4)";
      ctx.fill();

      // Connections between particles
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(129, 140, 248, ${0.08 * (1 - dist / CONNECTION_DIST)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Mouse interaction - brighten nearby particles
      const mdx = p.x - mouse.x;
      const mdy = p.y - (mouse.y + window.scrollY);
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < MOUSE_DIST) {
        const alpha = 0.25 * (1 - mDist / MOUSE_DIST);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`;
        ctx.fill();
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });
});
