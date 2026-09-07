/**
 * RUKOOB (رُكوب) - Master Interactive Script
 * Featuring Lenis Smooth Scroll, Scroll-Reveal Engine, Real QR Code, and PWA Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis Smooth Inertial Scrolling
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.25,
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
  window.addEventListener('scroll', () => {
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
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.05,
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // 4. QR Code Dynamic Generation
  let qrCodeGenerated = false;
  function initQrCode() {
    const qrContainer = document.getElementById('rukoobQrCode');
    if (!qrContainer || qrCodeGenerated) return;

    // Calculate smart download URL
    const baseUrl = window.location.href.split('?')[0].split('#')[0].replace(/index.html$/i, '').replace(/\/+$/, '');
    const downloadUrl = baseUrl || window.location.origin || window.location.href;

    qrContainer.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrContainer, {
        text: downloadUrl,
        width: 140,
        height: 140,
        colorDark: '#1B2A41',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M,
      });
      qrCodeGenerated = true;
    } else {
      // Fallback to high-res dynamic QR API
      const img = document.createElement('img');
      img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(downloadUrl) + '&color=1B2A41&bgcolor=ffffff&margin=1';
      img.alt = 'QR Code لتحميل تطبيق رُكوب';
      img.style.width = '140px';
      img.style.height = '140px';
      img.style.borderRadius = '10px';
      qrContainer.appendChild(img);
      qrCodeGenerated = true;
    }
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
      appDownloadModal?.classList.add('active');
      initQrCode();
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
