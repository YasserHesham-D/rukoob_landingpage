/**
 * RUKOOB (رُكوب) - Master Interactive Script
 * Featuring Lenis Smooth Scroll, Scroll-Reveal Engine, Real QR Code, and PWA Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis Smooth Inertial Scrolling
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.65,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.8,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // 2. Floating Navbar Scroll Blur & Transparency
  const header = document.querySelector('.site-header');
  const updateHeaderOnScroll = () => {
    const scrollY = typeof lenis !== 'undefined' && lenis ? lenis.scroll : window.scrollY;
    if (scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  };
  if (typeof lenis !== 'undefined' && lenis) {
    lenis.on('scroll', updateHeaderOnScroll);
  }
  window.addEventListener('scroll', updateHeaderOnScroll);
  // Initial check
  updateHeaderOnScroll();
  window.addEventListener('scroll_old_disabled', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navContainer = document.querySelector('.nav-container');
  mobileToggle?.addEventListener('click', () => {
    navContainer?.classList.toggle('mobile-open');
    mobileToggle?.classList.toggle('active');
  });

  // Close mobile menu when clicking nav link
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navContainer?.classList.remove('mobile-open');
      mobileToggle?.classList.remove('active');
    });
  });

  // 3. Scroll-Reveal Intersection Observer
  const revealElements = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.05,
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // Instantly reveal elements in initial viewport so above-the-fold content appears smoothly
  function checkAboveTheFold() {
    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('revealed');
      }
    });
  }
  checkAboveTheFold();
  window.addEventListener('load', checkAboveTheFold);
  setTimeout(checkAboveTheFold, 80);

  // 4. QR Code Dynamic Generation & Smart Device Detection
  let qrCodeGenerated = false;
  function getDeviceOS() {
    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
    return 'desktop';
  }

  function initQrCode() {
    const qrContainer = document.getElementById('rukoobQrCode');
    if (!qrContainer) return;

    // Calculate smart download URL pointing to download.html
    const origin = window.location.origin || '';
    let pathname = window.location.pathname || '';
    pathname = pathname.replace(/index\.html$/i, '').replace(/\/+$/, '');
    const downloadUrl = (origin + pathname + '/download.html').replace(/([^:])\/\//g, '$1/');

    qrContainer.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      try {
        new QRCode(qrContainer, {
          text: downloadUrl,
          width: 160,
          height: 160,
          colorDark: '#16222d',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H,
        });
        qrCodeGenerated = true;
        return;
      } catch (err) {
        console.warn('QRCode library error, using fallback API:', err);
      }
    }

    // Fallback to high-res dynamic QR API
    const img = document.createElement('img');
    img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(downloadUrl) + '&color=16222d&bgcolor=ffffff&margin=1';
    img.alt = 'QR Code تحميل تطبيق رُكوب';
    img.style.width = '160px';
    img.style.height = '160px';
    img.style.borderRadius = '12px';
    img.style.display = 'block';
    qrContainer.appendChild(img);
    qrCodeGenerated = true;
  }

  // 5. Modals Handling (App Download & Driver Registration)
  const appDownloadModal = document.getElementById('appDownloadModal');
  const driverModal = document.getElementById('driverModal');
  const openDownloadBtns = document.querySelectorAll('.trigger-download-modal');
  const openDriverBtns = document.querySelectorAll('.trigger-driver-modal');
  const closeBtns = document.querySelectorAll('.modal-close-btn, .modal-overlay');

  openDownloadBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const os = getDeviceOS();
      
      // Open modal
      appDownloadModal?.classList.add('active');
      initQrCode();

      // Highlight active OS button inside modal
      const modal = document.getElementById('appDownloadModal');
      if (modal) {
        const androidBtn = modal.querySelector('a[download]');
        const iosBtn = modal.querySelector('a[href*="ios"]');
        if (os === 'android' && androidBtn) {
          androidBtn.style.transform = 'scale(1.03)';
          androidBtn.style.boxShadow = '0 0 0 3px #5f6939, 0 10px 20px rgba(95, 105, 57, 0.4)';
        } else if (os === 'ios' && iosBtn) {
          iosBtn.style.transform = 'scale(1.03)';
          iosBtn.style.boxShadow = '0 0 0 3px #5f6939, 0 10px 20px rgba(22, 34, 45, 0.4)';
        }
      }
    });
  });

  openDriverBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      driverModal?.classList.add('active');
    });
  });

  closeBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (e.target === btn || btn.classList.contains('modal-close-btn')) {
        appDownloadModal?.classList.remove('active');
        driverModal?.classList.remove('active');
      }
    });
  });

  document.querySelectorAll('.modal-card').forEach((card) => {
    card.addEventListener('click', (e) => e.stopPropagation());
  });

  // 6. iOS Guide Toggle Handling
  const btnIosGuide = document.getElementById('btnIosGuide');
  const iosGuideCard = document.getElementById('iosGuideCard');

  btnIosGuide?.addEventListener('click', (e) => {
    e.preventDefault();
    if (iosGuideCard) {
      const isHidden = iosGuideCard.style.display === 'none' || !iosGuideCard.style.display;
      iosGuideCard.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        iosGuideCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });

  // 7. Driver Form Submission Feedback
  const driverForm = document.getElementById('driverForm');
  driverForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = driverForm.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = 'تم استلام طلبك بنجاح! سيتم التواصل معك.';
      btn.style.backgroundColor = '#38a169';
      setTimeout(() => {
        driverModal?.classList.remove('active');
        btn.textContent = 'إرسال طلب الانضمام';
        btn.style.backgroundColor = '';
        driverForm.reset();
      }, 2500);
    }
  });

  // 8. Navigation Links Smooth Scroll & Active Tracking
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          navLinks.forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
          if (lenis) {
            lenis.scrollTo(targetElement, { offset: -80 });
          } else {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // 9. Language Switcher Simulation
  const langBtn = document.getElementById('langSwitchBtn');
  let currentLang = 'AR';
  langBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentLang === 'AR') {
      currentLang = 'EN';
      langBtn.textContent = 'عربي';
    } else {
      currentLang = 'AR';
      langBtn.textContent = 'EN';
    }
  });

  
  // 10. Showcase Tab Switcher (Passenger vs Driver Views)
  const tabBtns = document.querySelectorAll('.showcase-tab-btn');
  const panels = document.querySelectorAll('.phones-view-panel');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target') || (btn.id === 'tabDriverView' ? 'driverView' : 'passengerView');

      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      panels.forEach((panel) => {
        if (panel.id === targetId) {
          panel.style.display = 'block';
          // Trigger reflow
          void panel.offsetWidth;
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
          setTimeout(() => {
            if (!panel.classList.contains('active')) {
              panel.style.display = 'none';
            }
          }, 250);
        }
      });
    });
  });

  // 11. Mobile Carousel Dots & Scroll Tracking
  document.querySelectorAll('.phones-view-panel').forEach((panel) => {
    const row = panel.querySelector('.phones-showcase-row');
    const dots = panel.querySelectorAll('.showcase-mobile-dots .dot');
    const phones = panel.querySelectorAll('.mini-phone');

    if (!row || dots.length === 0) return;

    row.addEventListener('scroll', () => {
      const scrollLeft = Math.abs(row.scrollLeft);
      const phoneWidth = phones[0]?.offsetWidth || 260;
      const activeIdx = Math.round(scrollLeft / (phoneWidth + 16));

      dots.forEach((dot, idx) => {
        if (idx === activeIdx) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      phones.forEach((phone, idx) => {
        if (idx === activeIdx) {
          phone.classList.add('mobile-active-card');
        } else {
          phone.classList.remove('mobile-active-card');
        }
      });
    }, { passive: true });

    // Tap to center on mobile
    phones.forEach((phone, idx) => {
      phone.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          phone.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    });
  });

  // Initialize QR Code on start
  initQrCode();
});
