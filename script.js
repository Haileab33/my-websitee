// Basic interactivity: mobile nav toggle, smooth scroll, portfolio modal, contact form handling (Formspree + redirect)
// Updated to validate additional fields (phone pattern optional) and keep honeypot

document.addEventListener('DOMContentLoaded', function () {
  // Set current year (if present)
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true' || false;
      this.setAttribute('aria-expanded', !expanded);
      nav.classList.toggle('open');
    });
  }

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const href = a.getAttribute('href');
      if(!href || href === '#') return;
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 60;
        window.scrollTo({top:y,behavior:'smooth'});
        // close nav on mobile
        if (nav) nav.classList.remove('open');
        if (navToggle) navToggle.setAttribute('aria-expanded','false');
      }
    });
  });

  // Portfolio modal
  const items = document.querySelectorAll('.portfolio-item');
  const modal = document.getElementById('portfolio-modal');
  const modalImage = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');

  function openModal(src, title, desc){
    modalImage.src = src;
    modalImage.alt = title;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    modalImage.src = '';
    document.body.style.overflow = '';
  }

  items.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      openModal(btn.dataset.src, btn.dataset.title, btn.dataset.desc);
    });
  });
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

  // Contact form with Formspree (AJAX) + redirect to _next on success
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Read values safely
    const name = (form.name && form.name.value || '').trim();
    const email = (form.email && form.email.value || '').trim();
    const message = (form.message && form.message.value || '').trim();
    const projectType = (form.project_type && form.project_type.value || '').trim();
    const phone = (form.phone && form.phone.value || '').trim();

    // Basic client-side validation
    if(!name || !email || !message || !projectType){
      status.textContent = 'Please fill in name, email, project type, and message.';
      status.style.color = '#ff6b6b';
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailPattern.test(email)){
      status.textContent = 'Please enter a valid email address.';
      status.style.color = '#ff6b6b';
      return;
    }
    // phone is optional but if provided, a simple pattern check
    if (phone) {
      const phonePattern = /^[0-9+\-\s()]{6,}$/;
      if (!phonePattern.test(phone)) {
        status.textContent = 'Please enter a valid phone number or leave it blank.';
        status.style.color = '#ff6b6b';
        return;
      }
    }

    // Honeypot check (client-side)
    const gotcha = form.querySelector('input[name="_gotcha"]');
    if (gotcha && gotcha.value) {
      // silent fail — likely bot
      status.textContent = 'Submission blocked.';
      status.style.color = '#ff6b6b';
      return;
    }

    // Prepare submission
    const action = form.action; // Formspree endpoint
    const formData = new FormData(form);

    // Show sending state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.textContent = '';
    status.style.color = '';

    fetch(action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json().catch(() => ({}));
      }
      return response.json().then(data => { throw data; });
    })
    .then(() => {
      // On success — redirect to _next field if present, otherwise show success message
      const nextInput = form.querySelector('input[name="_next"]');
      const next = nextInput ? nextInput.value : '';
      if (next) {
        // Use absolute or relative redirect; if relative, it should work when hosted at root
        window.location.href = next;
      } else {
        status.textContent = 'Thanks! Your message has been sent. I will reply soon.';
        status.style.color = '#8ef6e4';
        form.reset();
      }
    })
    .catch(err => {
      if (err && err.errors && Array.isArray(err.errors)) {
        status.textContent = err.errors.map(e => e.message).join(', ');
      } else {
        status.textContent = 'An error occurred while sending. Please try again later.';
      }
      status.style.color = '#ff6b6b';
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register Project';
    });
  });
});
// script.js — slideshow + modal + small UI helpers
document.addEventListener('DOMContentLoaded', () => {
  // -- Navigation toggle (if present in styles) --
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  // -- Slides: use local images p1..p6 from the images/ folder --
  const slides = [
    { title: "Project Alpha — Website", desc: "Sample 1.", src: "images/p1.jpg", thumb: "images/p1.jpg" },
    { title: "Landing Epsilon — Conversion-focused", desc: "Sample 2.", src: "images/p2.png", thumb: "images/p2.png" },
    { title: "E-commerce Gamma — Online Store", desc: "Sample 3.", src: "images/p3.webp", thumb: "images/p3.webp" },
    { title: "Portfolio Showcase — UI/UX", desc: "Sample 4.", src: "images/p4.png", thumb: "images/p4.png" },
    { title: "Brand Identity Beta — Visuals", desc: "Sample 5.", src: "images/p5.jpg", thumb: "images/p5.jpg" },
    { title: "Marketing Delta — Campaign", desc: "Sample 6.", src: "images/p6.jpg", thumb: "images/p6.jpg" }
  ];

  // Elements
  const mainImg = document.getElementById('slideshow-image');
  const titleEl = document.getElementById('slideshow-title');
  const descEl = document.getElementById('slideshow-desc');
  const thumbsContainer = document.getElementById('slideshow-thumbs');
  const openFullBtn = document.getElementById('open-full');
  const playPauseBtn = document.getElementById('slideshow-playpause');
  const nextBtn = document.querySelectorAll('.slideshow-next');
  const prevBtn = document.querySelectorAll('.slideshow-prev');

  // Modal elements
  const modal = document.getElementById('portfolio-modal');
  const modalImage = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');

  let current = 0;
  let autoplay = true;
  let timer = null;
  const autoplayDelay = 4000;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    const s = slides[current];
    // Use Unsplash source URLs — they redirect to unique images for each request.
    mainImg.src = s.src;
    mainImg.alt = s.title;
    titleEl.textContent = s.title;
    descEl.textContent = s.desc;

    // update thumbnails active state
    const thumbs = thumbsContainer.querySelectorAll('button');
    thumbs.forEach((b, i) => {
      if (i === current) b.classList.add('thumb--active');
      else b.classList.remove('thumb--active');
    });
  }

  function nextSlide() { showSlide(current + 1); }
  function prevSlide() { showSlide(current - 1); }

  // navigate modal preview (update current and modal content)
  function modalNext() { showSlide(current + 1); updateModal(current); }
  function modalPrev() { showSlide(current - 1); updateModal(current); }

  function updateModal(index){
    const s = slides[(index + slides.length) % slides.length];
    modalImage.src = s.src;
    modalImage.alt = s.title;
    modalTitle.textContent = s.title;
    modalDesc.textContent = s.desc;
  }

  function startAutoplay() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (autoplay) nextSlide();
    }, autoplayDelay);
    playPauseBtn && (playPauseBtn.textContent = 'Pause');
  }

  function stopAutoplay() {
    clearInterval(timer);
    playPauseBtn && (playPauseBtn.textContent = 'Play');
  }

  // build thumbnails
  slides.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', s.title);
    const thumbSrc = s.thumb || s.src;
    const img = document.createElement('img');
    img.src = thumbSrc;
    img.alt = s.title + " thumbnail";
    btn.appendChild(img);
    btn.addEventListener('click', () => {
      showSlide(i);
      // open modal on thumbnail click (large preview)
      openModal(i);
    });
    thumbsContainer.appendChild(btn);
  });

  // Attach next/prev handlers (querySelectorAll returned NodeList)
  nextBtn.forEach(b => b && b.addEventListener('click', nextSlide));
  prevBtn.forEach(b => b && b.addEventListener('click', prevSlide));

  // Modal prev/next (inside modal)
  const modalNextBtn = document.querySelector('.modal-next');
  const modalPrevBtn = document.querySelector('.modal-prev');
  if (modalNextBtn) modalNextBtn.addEventListener('click', modalNext);
  if (modalPrevBtn) modalPrevBtn.addEventListener('click', modalPrev);

  // Open full preview modal
  function openModal(index = current) {
    current = (index + slides.length) % slides.length;
    updateModal(current);
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  if (openFullBtn) {
    openFullBtn.addEventListener('click', () => openModal(current));
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  // close modal with Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') {
      if (modal.getAttribute('aria-hidden') === 'false') modalNext(); else nextSlide();
    }
    if (e.key === 'ArrowLeft') {
      if (modal.getAttribute('aria-hidden') === 'false') modalPrev(); else prevSlide();
    }
  });

  // Touch (swipe) support on modal image and main slideshow
  let touchStartX = 0;
  let touchEndX = 0;
  function handleTouchStart(e){ touchStartX = e.changedTouches[0].screenX; }
  function handleTouchEnd(e, inModal=false){
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40){
      if (diff < 0) { if (inModal) modalNext(); else nextSlide(); }
      else { if (inModal) modalPrev(); else prevSlide(); }
    }
  }
  // attach touch handlers
  if (modalImage) { modalImage.addEventListener('touchstart', handleTouchStart); modalImage.addEventListener('touchend', (e)=>handleTouchEnd(e, true)); }
  if (mainImg) { mainImg.addEventListener('touchstart', handleTouchStart); mainImg.addEventListener('touchend', handleTouchEnd); }

  // Play/pause toggle
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      autoplay = !autoplay;
      if (autoplay) {
        startAutoplay();
      } else {
        stopAutoplay();
      }
    });
  }

  // Pause autoplay while hovering the main image area
  const slideshowEl = document.getElementById('slideshow');
  if (slideshowEl) {
    slideshowEl.addEventListener('mouseenter', () => {
      // don't change autoplay setting, just pause temporarily
      clearInterval(timer);
    });
    slideshowEl.addEventListener('mouseleave', () => {
      startAutoplay();
    });
  }

  // Initialize
  showSlide(0);
  startAutoplay();

  // -- Simple footer year fill --
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // -- Optional: basic form submission status handling for Formspree --
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  if (form && formStatus) {
    form.addEventListener('submit', (e) => {
      // Let the browser handle the real submission (Formspree). Show a quick message.
      formStatus.textContent = 'Sending…';
      // After submission the form will redirect to _next (thank-you.html). If you'd prefer AJAX,
      // we can enhance this later — keeping simple for now.
    });
  }
});
  (function(){
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;

    const options = { root: null, rootMargin: '0px', threshold: 0.18 };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const skills = skillsSection.querySelectorAll('.skill');
          skills.forEach((skill, idx) => {
            const level = Number(skill.getAttribute('data-level')) || 0;
            const bar = skill.querySelector('.progress-bar');
            const progress = skill.querySelector('[role="progressbar"]');
            // animate with a slower transition and a larger stagger between items
            setTimeout(() => {
              if (bar) {
                // override inline transition to slow the animation (2.6s here)
                bar.style.transition = 'width 2600ms cubic-bezier(.2,.9,.2,1)';
                bar.style.width = level + '%';
              }
              if (progress) progress.setAttribute('aria-valuenow', String(level));
            }, 240 * idx);
          });
          obs.unobserve(skillsSection);
        }
      });
    }, options);

    observer.observe(skillsSection);
  })();