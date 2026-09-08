const quotes = [
  { name: "Nikola Tesla", role: "Penemu & visioner", category: "sains", quote: "The present is theirs; the future, for which I really worked, is mine.", initials: "NT", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80" },
  { name: "Maya Angelou", role: "Penyair & penulis", category: "seni", quote: "Do the best you can until you know better. Then when you know better, do better.", initials: "MA", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80" },
  { name: "Albert Einstein", role: "Fisikawan", category: "sains", quote: "Imagination is more important than knowledge. Knowledge is limited.", initials: "AE", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80" },
  { name: "Frida Kahlo", role: "Seniman", category: "seni", quote: "At the end of the day, we can endure much more than we think we can.", initials: "FK", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80" },
  { name: "Marcus Aurelius", role: "Filsuf & kaisar", category: "hidup", quote: "The happiness of your life depends upon the quality of your thoughts.", initials: "MA", image: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=900&q=80" },
  { name: "Steve Jobs", role: "Pionir teknologi", category: "hidup", quote: "The only way to do great work is to love what you do.", initials: "SJ", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80" }
];

const grid = document.querySelector("#quoteGrid");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const dialog = document.querySelector("#quoteDialog");
const backdrop = document.querySelector("#dialogBackdrop");
const globalVideo = document.querySelector(".global-video");
let activeFilter = "all";
let parallaxFrame = null;
let videoReady = false;

function renderQuotes() {
  const search = searchInput.value.toLowerCase().trim();
  const visible = quotes.filter((item) => {
    const matchesFilter = activeFilter === "all" || item.category === activeFilter;
    const matchesSearch = `${item.name} ${item.role} ${item.quote}`.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });
  grid.innerHTML = visible.map((item, index) => `
    <article class="quote-card reveal" tabindex="0" data-name="${item.name}">
      <span class="card-number">0${quotes.indexOf(item) + 1} / 06</span>
      <p class="card-quote">“${item.quote}”</p>
      <div class="card-footer">
        <div class="card-person">
          <span class="person-avatar">${item.initials}</span>
          <div><strong>${item.name}</strong><span>${item.role}</span></div>
        </div>
        <span class="card-arrow">↗</span>
      </div>
    </article>
  `).join("");
  emptyState.hidden = visible.length > 0;
  grid.querySelectorAll(".quote-card").forEach((card) => {
    card.addEventListener("click", () => openDialog(quotes.find((item) => item.name === card.dataset.name)));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") openDialog(quotes.find((item) => item.name === card.dataset.name));
    });
  });
}

function openDialog(item) {
  document.querySelector("#dialogPhoto").style.backgroundImage = `url("${item.image}")`;
  document.querySelector("#dialogCategory").innerHTML = `<span class="eyebrow-line"></span> ${item.category}`;
  document.querySelector("#dialogQuote").textContent = `“${item.quote}”`;
  document.querySelector("#dialogAvatar").textContent = item.initials;
  document.querySelector("#dialogName").textContent = item.name;
  document.querySelector("#dialogRole").textContent = item.role;
  backdrop.classList.add("show");
  dialog.showModal();
}

function closeDialog() {
  dialog.close();
  backdrop.classList.remove("show");
}

document.querySelectorAll(".filter-tab").forEach((tab) => tab.addEventListener("click", () => {
  document.querySelector(".filter-tab.active").classList.remove("active");
  tab.classList.add("active");
  activeFilter = tab.dataset.filter;
  renderQuotes();
  observeReveals();
  observeMotionUnits();
}));
searchInput.addEventListener("input", () => {
  renderQuotes();
  observeReveals();
  observeMotionUnits();
});
document.querySelector("#dialogClose").addEventListener("click", closeDialog);
backdrop.addEventListener("click", closeDialog);
dialog.addEventListener("cancel", (event) => { event.preventDefault(); closeDialog(); });

function updateParallax() {
  parallaxFrame = null;
  const pageHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = window.scrollY / pageHeight;
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const offset = (progress - 0.5) * 180;
    const scale = 1.08 + Math.min(Math.abs(progress - 0.5) * 0.1, 0.05);
    globalVideo.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
    globalVideo.style.setProperty("--parallax-scale", scale.toFixed(3));
  }
  if (videoReady && Number.isFinite(globalVideo.duration) && globalVideo.duration > 0) {
    const targetTime = progress * (globalVideo.duration - 0.05);
    if (Math.abs(globalVideo.currentTime - targetTime) > 0.016) {
      globalVideo.currentTime = targetTime;
    }
  }
}

function requestParallaxUpdate() {
  if (!parallaxFrame) {
    parallaxFrame = requestAnimationFrame(updateParallax);
  }
}

window.addEventListener("scroll", () => {
  document.querySelector(".nav").classList.toggle("scrolled", window.scrollY > 40);
  requestParallaxUpdate();
}, { passive: true });
window.addEventListener("resize", requestParallaxUpdate, { passive: true });
function primeVideoFrame() {
  videoReady = true;
  globalVideo.play().then(() => {
    globalVideo.pause();
    updateParallax();
  }).catch(() => {
    updateParallax();
  });
}

globalVideo.addEventListener("loadedmetadata", primeVideoFrame);
if (globalVideo.readyState >= 1) primeVideoFrame();

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 })
  : null;

function observeReveals() {
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((element) => {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add("is-visible");
  });
}

const motionObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("motion-visible");
          motionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 })
  : null;

function observeMotionUnits() {
  const selector = [
    "main div",
    "main p",
    "main h1",
    "main h2",
    "main h3",
    "main h4",
    "main h5",
    "main h6",
    "main span",
    "main button",
    "main a.button",
    "nav div",
    "nav span",
    "nav a",
    "footer div",
    "footer p",
    "footer span",
    "footer a",
    "dialog button",
    "dialog div",
    "dialog p",
    "dialog h1",
    "dialog h2",
    "dialog h3",
    "dialog h4",
    "dialog h5",
    "dialog h6",
    "dialog span"
  ].join(", ");

  document.querySelectorAll(`${selector}:not(.animate-unit)`).forEach((element, index) => {
    const parentMotionUnit = element.parentElement?.closest(".animate-unit, .reveal");
    const parentCardOrDialog = element.parentElement?.closest(".quote-card, .dialog-body");
    if (parentMotionUnit || parentCardOrDialog) return;
    if (element.classList.contains("dialog-body") || element.classList.contains("dialog-backdrop")) return;
    element.classList.add("animate-unit");
    element.style.setProperty("--motion-delay", `${Math.min(index % 8, 7) * 45}ms`);
    if (index % 3 === 1) element.classList.add("motion-left");
    if (index % 3 === 2) element.classList.add("motion-right");
    if (motionObserver) motionObserver.observe(element);
    else element.classList.add("motion-visible");
  });
}

requestParallaxUpdate();
renderQuotes();
document.querySelectorAll(".intro-grid, .section-heading, .closing > *").forEach((element) => element.classList.add("reveal"));
observeReveals();
observeMotionUnits();
