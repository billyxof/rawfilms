/**
 * RAW.FILMS Portfolio
 * Autonomous client-side scripts: Lightbox, navigation, share, and smooth interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initVideoLightbox();
  initImageLightbox();
  initBackToTop();
  initShareButton();
});

// 1. Header scroll state
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// 2. Mobile navigation menu
function initMobileNav() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.nav-mobile');
  if (!toggleBtn || !mobileNav) return;

  function toggleMenu() {
    const isOpen = mobileNav.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    toggleBtn.classList.add('is-active');
    mobileNav.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggleBtn.classList.remove('is-active');
    mobileNav.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', toggleMenu);

  mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// 3. Video Modal Lightbox (YouTube & VK Video)
function initVideoLightbox() {
  const triggers = document.querySelectorAll('.js-video-trigger');
  if (!triggers.length) return;

  // Create modal container if not in DOM
  let modal = document.querySelector('#video-lightbox');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'video-lightbox';
    modal.className = 'lightbox-modal';
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

  const iframe = modal.querySelector('iframe');
  const closeBtn = modal.querySelector('.lightbox-close-btn');

  function openVideo(url) {
    if (!url) return;
    // ensure autoplay parameter
    let finalUrl = url;
    if (url.includes('youtube.com') && !url.includes('autoplay=1')) {
      finalUrl += (url.includes('?') ? '&' : '?') + 'autoplay=1&rel=0';
    } else if (url.includes('vk.com') && !url.includes('autoplay=1')) {
      finalUrl += (url.includes('?') ? '&' : '?') + 'autoplay=1';
    }

    iframe.src = finalUrl;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeVideo() {
    modal.classList.remove('is-open');
    iframe.src = '';
    document.body.style.overflow = '';
  }

  triggers.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const videoUrl = el.getAttribute('data-video-url');
      if (videoUrl) {
        openVideo(videoUrl);
      }
    });
  });

  closeBtn.addEventListener('click', closeVideo);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeVideo();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeVideo();
    }
  });
}

// 4. Image Lightbox for Cover Artwork
function initImageLightbox() {
  const triggers = document.querySelectorAll('.js-image-trigger');
  if (!triggers.length) return;

  let modal = document.querySelector('#image-lightbox');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'image-lightbox';
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close-btn" aria-label="Закрыть">&times;</button>
        <div class="lightbox-image-frame">
          <img src="" alt="Enlarged view">
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const img = modal.querySelector('img');
  const closeBtn = modal.querySelector('.lightbox-close-btn');

  function openImage(src, alt) {
    if (!src) return;
    img.src = src;
    img.alt = alt || 'Cover Design';
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeImage() {
    modal.classList.remove('is-open');
    img.src = '';
    document.body.style.overflow = '';
  }

  triggers.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const src = el.getAttribute('data-image-src') || el.querySelector('img')?.src;
      const alt = el.querySelector('img')?.alt || '';
      openImage(src, alt);
    });
  });

  closeBtn.addEventListener('click', closeImage);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeImage();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeImage();
    }
  });
}

// 5. Back to top button
function initBackToTop() {
  const btn = document.querySelector('.js-back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// 6. Share site button & toast
function initShareButton() {
  const btn = document.querySelector('.js-share-trigger');
  if (!btn) return;

  let toast = document.querySelector('#toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    toast.textContent = 'Ссылка скопирована!';
    document.body.appendChild(toast);
  }

  btn.addEventListener('click', async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      showToast();
    } catch (err) {
      showToast('Не удалось скопировать');
    }
  });

  let toastTimer;
  function showToast(msg) {
    if (msg) toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}
