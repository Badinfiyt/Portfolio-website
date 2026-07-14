const canvas = document.querySelector(".hero-canvas");
const ctx = canvas?.getContext("2d");
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const glow = document.querySelector(".cursor-glow");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelector("#year").textContent = new Date().getFullYear();

menuToggle?.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});

navLinks.forEach((link) => link.addEventListener("click", () => {
  document.body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
}));

const sections = [...document.querySelectorAll("main section[id]")];
const updatePageState = () => {
  header?.classList.toggle("scrolled", window.scrollY > 30);
  const current = sections.reduce((active, section) =>
    window.scrollY >= section.offsetTop - window.innerHeight * .4 ? section : active, sections[0]);
  navLinks.forEach((link) => link.classList.toggle("active", link.hash === `#${current?.id}`));
};
window.addEventListener("scroll", updatePageState, { passive: true });
updatePageState();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  observer.observe(element);
});

if (!reduceMotion) {
  window.addEventListener("pointermove", (event) => {
    if (glow) {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }
  });

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .16;
      const y = (event.clientY - rect.top - rect.height / 2) * .16;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener("pointerleave", () => { element.style.transform = ""; });
  });
}

const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
const dots = Array.from({ length: 42 }, (_, i) => ({
  x: (i * 97) % 100 / 100,
  y: (i * 53) % 100 / 100,
  size: 1 + (i % 4) * .55,
  phase: i * .7
}));

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function draw(time = 0) {
  if (!canvas || !ctx) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  pointer.x += (pointer.tx - pointer.x) * .035;
  pointer.y += (pointer.ty - pointer.y) * .035;

  dots.forEach((dot, i) => {
    const drift = reduceMotion ? 0 : Math.sin(time * .00035 + dot.phase) * 14;
    const x = dot.x * width + drift + pointer.x * ((i % 3) * .01);
    const y = dot.y * height + Math.cos(time * .00025 + dot.phase) * 10 + pointer.y * ((i % 4) * .008);
    ctx.beginPath();
    ctx.fillStyle = i % 5 === 0 ? "rgba(201,255,61,.65)" : "rgba(240,238,231,.18)";
    ctx.arc(x, y, dot.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = "rgba(240,238,231,.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  if (!reduceMotion) requestAnimationFrame(draw);
}

window.addEventListener("pointermove", (event) => {
  pointer.tx = event.clientX - window.innerWidth / 2;
  pointer.ty = event.clientY - window.innerHeight / 2;
});
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
draw();

async function loadProfile() {
  try {
    const response = await fetch("/api/profile");
    if (!response.ok) return;
    const profile = await response.json();
    const emailLink = document.querySelector("#email-link");
    if (emailLink && profile.email) {
      emailLink.childNodes[0].textContent = `${profile.email} `;
      emailLink.href = `mailto:${profile.email}`;
    }
  } catch (error) {
    console.warn("Profile details are using the local fallback.", error);
  }
}
loadProfile();
