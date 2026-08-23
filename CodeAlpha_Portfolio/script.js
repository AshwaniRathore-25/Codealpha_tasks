document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const navbar = document.getElementById('navbar');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const menuToggle = document.getElementById('menuToggle');
  const themeToggle = document.getElementById('themeToggle');
  const typingText = document.getElementById('typingText');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const contactForm = document.getElementById('contactForm');
  const formAlert = document.getElementById('formAlert');
  const resumeModal = document.getElementById('resumeModal');
  const quickResumeBtn = document.getElementById('quickResumeBtn');
  const viewResumeModalBtn = document.getElementById('viewResumeModalBtn');
  const closeResumeModal = document.getElementById('closeResumeModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const statNumbers = document.querySelectorAll('.stat-number');

  // --- Dynamic Typing Effect ---
  const roles = ["Frontend Web Developer", "UI/UX Designer", "CodeAlpha Intern", "Problem Solver"];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const delayBetweenRoles = 2000;

  function typeEffect() {
    if (!typingText) return;
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      typingText.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingText.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    let delta = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentRole.length) {
      delta = delayBetweenRoles;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delta = 500;
    }

    setTimeout(typeEffect, delta);
  }

  typeEffect();

  // --- Navbar Scroll & Active Section Highlighting ---
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // ScrollSpy active link
    let current = '';
    const sections = document.querySelectorAll('section, header');

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // --- Mobile Menu Toggle ---
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      menuToggle.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('open');
      });
    });
  }

  // --- Theme Toggle ---
  const savedTheme = localStorage.getItem('portfolio_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio_theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'light') {
      icon.className = 'fa-solid fa-sun';
    } else {
      icon.className = 'fa-solid fa-moon';
    }
  }

  // --- Project Filtering ---
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.dataset.filter;

      projectCards.forEach(card => {
        const categories = card.dataset.category.split(' ');
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          setTimeout(() => card.style.opacity = '1', 50);
        } else {
          card.style.opacity = '0';
          setTimeout(() => card.style.display = 'none', 300);
        }
      });
    });
  });

  // --- Stats Counter Animation ---
  let statsAnimated = false;

  function animateStats() {
    const statsSection = document.querySelector('.stats-row');
    if (!statsSection || statsAnimated) return;

    const sectionPos = statsSection.getBoundingClientRect().top;
    const screenPos = window.innerHeight / 1.2;

    if (sectionPos < screenPos) {
      statNumbers.forEach(stat => {
        const target = +stat.dataset.target;
        const duration = 1500;
        const step = target / (duration / 16);
        let count = 0;

        const updateCount = () => {
          count += step;
          if (count < target) {
            stat.textContent = Math.ceil(count);
            requestAnimationFrame(updateCount);
          } else {
            stat.textContent = target;
          }
        };

        updateCount();
      });
      statsAnimated = true;
    }
  }

  window.addEventListener('scroll', animateStats);
  animateStats(); // Run on page load if visible

  // --- Resume Modal Handlers ---
  function openModal() {
    resumeModal.classList.add('active');
    resumeModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    resumeModal.classList.remove('active');
    resumeModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
  }

  if (quickResumeBtn) quickResumeBtn.addEventListener('click', openModal);
  if (viewResumeModalBtn) viewResumeModalBtn.addEventListener('click', openModal);
  if (closeResumeModal) closeResumeModal.addEventListener('click', closeModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeModal();
    });
  }

  // --- Contact Form Submission ---
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        alert('Please fill out all required fields.');
        return;
      }

      const submitBtn = document.getElementById('submitBtn');
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
        formAlert.textContent = `Thank you, ${name}! Your message has been sent successfully.`;
        formAlert.className = 'form-alert success';
        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
          submitBtn.disabled = false;
          formAlert.style.display = 'none';
        }, 4000);
      }, 1200);
    });
  }
});

// Resume Download Handler
function triggerResumeDownload(e) {
  e.preventDefault();
  alert('Resume download initiated! (Dummy resume downloaded successfully for portfolio demonstration).');
}
