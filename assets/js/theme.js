/**
 * RAW.FILMS Autonomous Theme Scripts
 * Replaces wfolio runtime with clean vanilla JS for lightbox, video players, mobile menu, and scrolling
 */

document.addEventListener("DOMContentLoaded", () => {
  initVisibilityAndHydration();
  initHeaderScroll();
  initLiquidGlassOverlay();
  initSmoothAnchors();
  initScrollSpy();
  initMobileMenu();
  initVideoPlayer();
  initVideoTiles();
  initImageLightbox();
  initBackToTop();
  initShare();
});

// 1. Ensure all static elements are marked visible (bypasses legacy wfolio JS requirements)
function initVisibilityAndHydration() {
  document.querySelectorAll(".page-header, .sections-container, .page-footer, .comment-list > .comment").forEach(el => {
    el.classList.add("-visible");
  });
}

// 2. Header blur & background on scroll
function initHeaderScroll() {
  const header = document.querySelector(".page-header");
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add("-scrolled");
    } else {
      header.classList.remove("-scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// 3. Dynamic Liquid Glass Blur on Background Video
function initLiquidGlassOverlay() {
  const overlay = document.getElementById("liquidGlassOverlay");
  if (!overlay) return;

  function update() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const vh = window.innerHeight || 800;
    // Over the first screen (0 to vh * 0.65), transition from sharp video to dark frosted liquid glass
    const progress = Math.min(1, Math.max(0, scrollY / (vh * 0.65)));

    const blurPx = (progress * 38).toFixed(1);
    const darkAlpha = (0.22 + progress * 0.54).toFixed(3);

    overlay.style.backdropFilter = `blur(${blurPx}px)`;
    overlay.style.webkitBackdropFilter = `blur(${blurPx}px)`;
    overlay.style.backgroundColor = `rgba(7, 7, 9, ${darkAlpha})`;
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
}

// 4. Smooth Anchor Scrolling & Cover Arrow
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"], .js-cover-down-arrow, .js-scroll-link').forEach(el => {
    el.addEventListener("click", function(e) {
      let targetId = this.getAttribute("href");
      if (this.classList.contains("js-cover-down-arrow") || !targetId || targetId === "#") {
        targetId = "#video";
      }
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset;

        window.scrollTo({
          top: targetId === "#showreel" ? 0 : offsetPosition,
          behavior: "smooth"
        });

        // Close mobile drawer if open
        const nav = document.querySelector(".menu.js-menu");
        const trigger = document.querySelector(".js-menu-trigger");
        if (nav && nav.classList.contains("-open")) {
          nav.classList.remove("-open");
          trigger && trigger.classList.remove("-active");
        }
      }
    });
  });

  // Handle direct link with hash or query param (?section=video)
  const urlParams = new URLSearchParams(window.location.search);
  const targetParam = urlParams.get("section") || (window.location.hash ? window.location.hash.replace("#", "") : null);
  if (targetParam) {
    const targetEl = document.getElementById(targetParam);
    if (targetEl) {
      const top = targetParam === "showreel" ? 0 : targetEl.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: top,
        behavior: "instant"
      });
    }
  }
}

// 5. Scroll-Spy for Navigation Bar
function initScrollSpy() {
  const sectionIds = ["showreel", "video", "proekty", "o-sebe"];
  const menuItems = document.querySelectorAll(".menu-list .menu-item");
  if (!menuItems.length) return;

  function onScroll() {
    const scrollPos = window.scrollY + window.innerHeight * 0.45;
    let currentId = "showreel";

    for (let i = 0; i < sectionIds.length; i++) {
      const el = document.getElementById(sectionIds[i]);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentId = sectionIds[i];
          break;
        }
      }
    }

    menuItems.forEach(item => {
      const link = item.querySelector("a");
      if (link && link.getAttribute("href") === `#${currentId}`) {
        item.classList.add("-active");
      } else {
        item.classList.remove("-active");
      }
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// 4. Mobile menu toggle
function initMobileMenu() {
  const trigger = document.querySelector(".js-menu-trigger");
  const nav = document.querySelector(".page-header .nav") || document.querySelector(".js-nav") || document.querySelector(".menu");
  if (!trigger || !nav) return;

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    nav.classList.toggle("-open");
    trigger.classList.toggle("-active");
  });

  nav.querySelectorAll(".link").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("-open");
      trigger.classList.remove("-active");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("-open")) {
      nav.classList.remove("-open");
      trigger.classList.remove("-active");
    }
  });
}

// 5. Video Modal & Inline Player
function initVideoPlayer() {
  let modal = document.querySelector("#video-lightbox");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "video-lightbox";
    modal.className = "lightbox-modal";
    modal.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close-btn" aria-label="Закрыть">&times;</button>
        <div class="lightbox-video-frame">
          <iframe src="" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const iframe = modal.querySelector("iframe");
  const closeBtn = modal.querySelector(".lightbox-close-btn");

  function openVideo(url) {
    if (!url) return;
    let finalUrl = url;
    if (url.includes("youtube.com") && !url.includes("autoplay=1")) {
      finalUrl += (url.includes("?") ? "&" : "?") + "autoplay=1&rel=0";
    } else if (url.includes("vk.com") && !url.includes("autoplay=1")) {
      finalUrl += (url.includes("?") ? "&" : "?") + "autoplay=1";
    }

    iframe.src = finalUrl;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeVideo() {
    modal.classList.remove("is-open");
    iframe.src = "";
    document.body.style.overflow = "";
  }

  // Handle music video gallery links
  document.querySelectorAll(".piece.-video .inner a.js-gallery-link").forEach(link => {
    link.classList.add("cursor-pointer");
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const url = link.getAttribute("data-gallery-video-url") || link.getAttribute("href");
      openVideo(url);
    });
  });

  // Handle video cards and sections
  document.querySelectorAll(".video-section[data-source-url], .js-video-section[data-source-url]").forEach(sec => {
    sec.classList.add("cursor-pointer");
    sec.addEventListener("click", (e) => {
      e.preventDefault();
      const url = sec.getAttribute("data-source-url");
      openVideo(url);
    });
  });

  closeBtn.addEventListener("click", closeVideo);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeVideo();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeVideo();
  });
}

// 6. Image Lightbox (Album Covers)
function initImageLightbox() {
  let modal = document.querySelector("#image-lightbox");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "image-lightbox";
    modal.className = "lightbox-modal";
    modal.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close-btn" aria-label="Закрыть">&times;</button>
        <div class="lightbox-image-frame">
          <img src="" alt="Обложка">
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const img = modal.querySelector("img");
  const closeBtn = modal.querySelector(".lightbox-close-btn");

  function openImage(src) {
    if (!src) return;
    img.src = src;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeImage() {
    modal.classList.remove("is-open");
    img.src = "";
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".picture-section .js-gallery a.gallery-link, .picture-section a.js-gallery-link").forEach(link => {
    link.classList.add("cursor-pointer");
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const src = link.getAttribute("data-local-src") || link.getAttribute("href") || link.querySelector("img")?.src;
      openImage(src);
    });
  });

  closeBtn.addEventListener("click", closeImage);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeImage();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeImage();
  });
}

// 7. Back to top
function initBackToTop() {
  const btn = document.querySelector(".js-back-to-top");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// 8. Share trigger
function initShare() {
  const btn = document.querySelector(".js-share-trigger");
  if (!btn) return;

  let toast = document.querySelector("#toast-notice");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notice";
    toast.className = "toast-notice";
    toast.textContent = "Ссылка скопирована!";
    document.body.appendChild(toast);
  }

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const url = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2500);
    } catch (err) {}
  });
}

// 9. shadcn/ui Video Tiles Filter Controller
function initVideoTiles() {
  const grid = document.querySelector(".js-video-tiles-grid");
  if (!grid) return;

  const tiles = Array.from(grid.querySelectorAll(".js-video-tile, .js-carousel-card, .video-tile, .carousel-card"));
  const filterTabs = document.querySelectorAll(".js-filter-tab");

  filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => t.classList.remove("-active"));
      tab.classList.add("-active");

      const activeFilter = tab.getAttribute("data-filter") || "all";
      tiles.forEach(tile => {
        const cat = tile.getAttribute("data-category");
        if (activeFilter === "all" || cat === activeFilter) {
          tile.classList.remove("-hidden");
        } else {
          tile.classList.add("-hidden");
        }
      });
    });
  });
}

