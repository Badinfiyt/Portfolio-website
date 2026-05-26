const canvas = document.querySelector(".hero-canvas");
const ctx = canvas.getContext("2d");
const year = document.querySelector("#year");
const profileLocation = document.querySelector("#profile-location");
const focusList = document.querySelector("#focus-list");
const emailLink = document.querySelector("#email-link");
const resumeUpdated = document.querySelector("#resume-updated");
const resumeOpen = document.querySelector("#resume-open");
const resumeDownload = document.querySelector("#resume-download");

const pointer = {
  active: false,
  x: 0,
  y: 0,
  smoothX: 0,
  smoothY: 0
};

const particles = Array.from({ length: 58 }, (_, index) => ({
  angle: index * 0.42,
  orbit: 80 + (index % 9) * 32,
  speed: 0.002 + (index % 6) * 0.0007,
  size: 2 + (index % 5)
}));

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  if (!pointer.active) {
    resetPointer();
  }
}

function draw() {
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  const darkMode = true;

  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, darkMode ? "rgba(91, 197, 186, 0.22)" : "rgba(15, 124, 117, 0.18)");
  gradient.addColorStop(0.55, darkMode ? "rgba(240, 200, 90, 0.12)" : "rgba(244, 201, 93, 0.18)");
  gradient.addColorStop(1, darkMode ? "rgba(241, 141, 101, 0.2)" : "rgba(216, 111, 69, 0.18)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = "screen";
  pointer.smoothX += (pointer.x - pointer.smoothX) * 0.08;
  pointer.smoothY += (pointer.y - pointer.smoothY) * 0.08;

  particles.forEach((particle, index) => {
    particle.angle += particle.speed;
    const baseX = width * 0.67 + Math.cos(particle.angle) * particle.orbit;
    const baseY = height * 0.48 + Math.sin(particle.angle * 1.35) * (particle.orbit * 0.72);
    const distanceX = pointer.smoothX - baseX;
    const distanceY = pointer.smoothY - baseY;
    const distance = Math.hypot(distanceX, distanceY);
    const influence = pointer.active ? Math.max(0, 1 - distance / 520) : 0;
    const drift = influence * (0.14 + (index % 6) * 0.018);
    const x = baseX + distanceX * drift;
    const y = baseY + distanceY * drift;
    const radius = particle.size + Math.sin(particle.angle * 2) * 1.5;

    ctx.beginPath();
    ctx.fillStyle = index % 3 === 0
      ? "rgba(15, 124, 117, 0.42)"
      : index % 3 === 1
        ? "rgba(244, 201, 93, 0.38)"
        : "rgba(216, 111, 69, 0.34)";
    ctx.arc(x, y, Math.max(1.5, radius), 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(draw);
}

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.active = true;
  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
}

function resetPointer() {
  pointer.active = false;
  pointer.x = canvas.offsetWidth * 0.67;
  pointer.y = canvas.offsetHeight * 0.48;
}


async function loadProfile() {
  try {
    const response = await fetch("/api/profile");
    const profile = await response.json();
    profileLocation.textContent = profile.location;
    emailLink.textContent = profile.email;
    emailLink.href = `mailto:${profile.email}`;
    focusList.innerHTML = profile.focus.map((item) => `<li>${item}</li>`).join("");
  } catch (error) {
    console.warn("Profile endpoint unavailable", error);
  }
}

async function loadResumeInfo() {
  try {
    const response = await fetch("/api/resume");
    const resume = await response.json();

    if (!resume.available) {
      resumeUpdated.textContent = "Resume PDF is not available yet.";
      return;
    }

    const updatedDate = new Date(resume.updatedAt);
    const formattedDate = updatedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    resumeUpdated.textContent = `Last updated ${formattedDate}.`;
    resumeOpen.href = resume.file;
    resumeDownload.href = resume.file;
  } catch (error) {
    console.warn("Resume endpoint unavailable", error);
  }
}

year.textContent = new Date().getFullYear();
resizeCanvas();
resetPointer();
draw();
loadProfile();
loadResumeInfo();

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", updatePointer);
window.addEventListener("pointerleave", resetPointer);
