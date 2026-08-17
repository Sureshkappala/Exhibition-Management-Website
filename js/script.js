/* ==========================================================================
   EXHIBITION MANAGEMENT WEBSITE - CORE INTERACTIVITY
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCounters();
  initFAQ();
  initSliders();
  initFiltering();
  initFormValidation();
  initDashboards();
  initCharts();
});

/* ==========================================================================
   NAVBAR & MOBILE MENU
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (!navbar) return;

  // Scroll event
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Hamburger & Slide Drawer Overlay Toggle
  if (hamburger && navLinks) {
    // Create drawer overlay element
    let overlay = document.querySelector('.drawer-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'drawer-overlay';
      document.body.appendChild(overlay);
    }

    let lastOpenTime = 0;

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = navLinks.classList.contains('active');
      if (!isActive) {
        hamburger.classList.add('active');
        navLinks.classList.add('active');
        overlay.classList.add('active');
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
        lastOpenTime = Date.now();
      } else {
        closeMenu();
      }
    });

    const closeMenu = () => {
      if (Date.now() - lastOpenTime < 300) return;
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      overlay.classList.remove('active');
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    };

    // Close menu when clicking overlay
    overlay.addEventListener('click', closeMenu);
    
    // Prevent touch events from leaking to the background page on mobile
    overlay.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    // Close menu when clicking close button inside drawer
    document.addEventListener('click', (e) => {
      if (e.target.closest('.drawer-close')) {
        closeMenu();
      }
    });

    // Close menu when clicking links
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }
}

/* ==========================================================================
   ANIMATED COUNTERS (STATISTICS)
   ========================================================================== */
function initCounters() {
  const statsSection = document.querySelector('.stats-banner, .stats-grid, .achievements-grid');
  if (!statsSection) return;

  const counters = document.querySelectorAll('.stat-number, .achievement-card h3');
  
  const runCounter = (counter) => {
    const target = parseInt(counter.getAttribute('data-target'));
    const speed = 200; // lower is slower
    const increment = Math.ceil(target / speed);
    let count = 0;

    const updateCount = () => {
      count += increment;
      if (count < target) {
        counter.innerText = count + "+";
        setTimeout(updateCount, 15);
      } else {
        counter.innerText = target + "+";
      }
    };
    updateCount();
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counters.forEach(counter => runCounter(counter));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsSection);
}

/* ==========================================================================
   FAQ ACCORDION
   ========================================================================== */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
      });

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   SLIDER / CAROUSEL
   ========================================================================== */
function initSliders() {
  const setupSlider = (containerSelector) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const wrapper = container.querySelector('.slider-wrapper');
    const slides = container.querySelectorAll('.slide');
    const nextBtn = document.querySelector(`${containerSelector}-next`);
    const prevBtn = document.querySelector(`${containerSelector}-prev`);
    
    if (!wrapper || slides.length === 0) return;

    let currentIndex = 0;
    
    const getVisibleSlides = () => {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    };

    const updateSlider = () => {
      const visibleSlides = getVisibleSlides();
      const maxIndex = slides.length - visibleSlides;
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;

      const slideWidth = slides[0].getBoundingClientRect().width;
      const offset = -(currentIndex * slideWidth);
      wrapper.style.transform = `translateX(${offset}px)`;
    };

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const visibleSlides = getVisibleSlides();
        if (currentIndex < slides.length - visibleSlides) {
          currentIndex++;
          updateSlider();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateSlider();
        }
      });
    }

    window.addEventListener('resize', updateSlider);
    // Initial calculation delay to ensure layout is ready
    setTimeout(updateSlider, 100);
  };

  setupSlider('.speakers-slider');
  setupSlider('.testimonials-slider');
}

/* ==========================================================================
   FILTERING SYSTEM (Exhibitions, Exhibitors, Events)
   ========================================================================== */
function initFiltering() {
  // 1. Exhibitions Page Filtering
  const searchInput = document.getElementById('search-exhibitions');
  const filterCategory = document.getElementById('filter-category');
  const filterLocation = document.getElementById('filter-location');
  const filterType = document.getElementById('filter-type');
  const exhibitionCards = document.querySelectorAll('.exhibitions-listing-grid .exhibition-card');

  const filterExhibitions = () => {
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const category = filterCategory ? filterCategory.value.toLowerCase() : 'all';
    const location = filterLocation ? filterLocation.value.toLowerCase() : 'all';
    const type = filterType ? filterType.value.toLowerCase() : 'all';

    exhibitionCards.forEach(card => {
      const cardTitle = card.querySelector('h3').innerText.toLowerCase();
      const cardDesc = card.querySelector('p').innerText.toLowerCase();
      const cardCategory = card.getAttribute('data-category').toLowerCase();
      const cardLocation = card.getAttribute('data-location').toLowerCase();
      const cardType = card.getAttribute('data-type').toLowerCase();

      const matchesSearch = cardTitle.includes(query) || cardDesc.includes(query);
      const matchesCategory = category === 'all' || cardCategory === category;
      const matchesLocation = location === 'all' || cardLocation === location;
      const matchesType = type === 'all' || cardType === type;

      if (matchesSearch && matchesCategory && matchesLocation && matchesType) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  };

  if (searchInput) searchInput.addEventListener('input', filterExhibitions);
  if (filterCategory) filterCategory.addEventListener('change', filterExhibitions);
  if (filterLocation) filterLocation.addEventListener('change', filterExhibitions);
  if (filterType) filterType.addEventListener('change', filterExhibitions);

  // 2. Exhibitors Directory Page Filtering
  const searchExhibitors = document.getElementById('search-exhibitors');
  const filterIndustry = document.getElementById('filter-industry');
  const exhibitorCards = document.querySelectorAll('.exhibitors-grid .exhibitor-logo-card, .exhibitors-grid-full .exhibition-card');

  const filterExhibitorsList = () => {
    const query = searchExhibitors ? searchExhibitors.value.toLowerCase() : '';
    const industry = filterIndustry ? filterIndustry.value.toLowerCase() : 'all';

    exhibitorCards.forEach(card => {
      const cardTitle = card.querySelector('h3, h4').innerText.toLowerCase();
      const cardDesc = card.querySelector('p, span').innerText.toLowerCase();
      const cardIndustry = card.getAttribute('data-industry').toLowerCase();

      const matchesSearch = cardTitle.includes(query) || cardDesc.includes(query);
      const matchesIndustry = industry === 'all' || cardIndustry === industry;

      if (matchesSearch && matchesIndustry) {
        card.style.display = card.classList.contains('exhibitor-logo-card') ? 'flex' : 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  };

  if (searchExhibitors) searchExhibitors.addEventListener('input', filterExhibitorsList);
  if (filterIndustry) filterIndustry.addEventListener('change', filterExhibitorsList);
}

/* ==========================================================================
   FORM VALIDATION
   ========================================================================== */
function initFormValidation() {
  // Input fields validation patterns
  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[0-9]{10,12}$/;
  const companyRegex = /^[a-zA-Z0-9\s&.,\-()]+$/;

  const showFieldError = (field, message) => {
    const group = field.closest('.form-group');
    if (!group) return;
    let error = group.querySelector('.form-error');
    if (!error) {
      error = document.createElement('span');
      error.className = 'form-error';
      group.appendChild(error);
    }
    error.innerText = message;
    error.style.display = 'block';
    field.style.borderColor = 'var(--status-occupied)';
  };

  const clearFieldError = (field) => {
    const group = field.closest('.form-group');
    if (!group) return;
    const error = group.querySelector('.form-error');
    if (error) {
      error.style.display = 'none';
    }
    field.style.borderColor = '';
  };

  const validateField = (field, type) => {
    const val = field.value.trim();
    if (!val) {
      if (field.hasAttribute('required')) {
        showFieldError(field, "This field is required.");
        return false;
      }
      clearFieldError(field);
      return true;
    }

    if (type === 'name' && !nameRegex.test(val)) {
      showFieldError(field, "Only letters and spaces are allowed.");
      return false;
    }
    if (type === 'email' && !emailRegex.test(val)) {
      showFieldError(field, "Please enter a valid email address.");
      return false;
    }
    if (type === 'phone' && !phoneRegex.test(val)) {
      showFieldError(field, "Numbers only. Must be between 10 to 12 digits.");
      return false;
    }
    if (type === 'company' && !companyRegex.test(val)) {
      showFieldError(field, "Enter a valid company name (avoid special characters).");
      return false;
    }
    if (type === 'password' && val.length < 6) {
      showFieldError(field, "Password must be at least 6 characters.");
      return false;
    }

    clearFieldError(field);
    return true;
  };

  // Setup validation listeners
  const setupForm = (form) => {
    if (!form) return;

    // Filter characters on the fly (reject digits in names, reject letters in phones)
    form.querySelectorAll('input').forEach(field => {
      let type = 'text';
      if (field.id?.includes('name') || field.name?.includes('name')) type = 'name';
      else if (field.type === 'tel' || field.id?.includes('phone') || field.name?.includes('phone') || field.name?.includes('mobile')) type = 'phone';

      if (type === 'name') {
        field.addEventListener('input', () => {
          field.value = field.value.replace(/[^A-Za-z\s]/g, '');
        });
      } else if (type === 'phone') {
        field.addEventListener('input', () => {
          field.value = field.value.replace(/[^0-9]/g, '');
        });
      }
    });

    form.querySelectorAll('input, textarea, select').forEach(field => {
      // Blur check
      field.addEventListener('blur', () => {
        let type = 'text';
        if (field.id?.includes('name') || field.name?.includes('name')) type = 'name';
        else if (field.type === 'email') type = 'email';
        else if (field.type === 'tel' || field.id?.includes('phone') || field.name?.includes('phone') || field.name?.includes('mobile')) type = 'phone';
        else if (field.id?.includes('company') || field.name?.includes('company')) type = 'company';
        else if (field.type === 'password') type = 'password';

        validateField(field, type);
      });

      // Reset style on input
      field.addEventListener('input', () => {
        clearFieldError(field);
      });
    });

    // Submit handler
    form.addEventListener('submit', (e) => {
      let isValid = true;
      form.querySelectorAll('input, textarea, select').forEach(field => {
        let type = 'text';
        if (field.id?.includes('name') || field.name?.includes('name')) type = 'name';
        else if (field.type === 'email') type = 'email';
        else if (field.type === 'tel' || field.id?.includes('phone') || field.name?.includes('phone') || field.name?.includes('mobile')) type = 'phone';
        else if (field.id?.includes('company') || field.name?.includes('company')) type = 'company';
        else if (field.type === 'password') type = 'password';

        if (!validateField(field, type)) {
          isValid = false;
        }
      });

      // Custom check for Password Confirmation
      const pass = form.querySelector('input[type="password"]#password, input[type="password"]#reg-password');
      const confirmPass = form.querySelector('input[type="password"]#confirm-password');
      if (pass && confirmPass && pass.value !== confirmPass.value) {
        showFieldError(confirmPass, "Passwords do not match.");
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();
        // Scroll to first error
        const firstError = form.querySelector('.form-error[style*="display: block"]');
        if (firstError) {
          firstError.closest('.form-group').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        // Mock successful action
        e.preventDefault();
        alert("Form submitted successfully!");
        
        // If login form, handle dashboard redirect based on role
        if (form.id === 'login-form') {
          const role = document.getElementById('role-select')?.value || 'visitor';
          if (role === 'admin') {
            window.location.href = 'admin-dashboard.html';
          } else {
            window.location.href = 'user-dashboard.html';
          }
        } else if (form.id === 'registration-form') {
          window.location.href = 'user-dashboard.html';
        } else if (form.id === 'register-form') {
          window.location.href = 'login.html';
        } else {
          form.reset();
        }
      }
    });
  };

  // Apply to all forms on pages
  document.querySelectorAll('form').forEach(form => setupForm(form));

  // Toggle Password Eye Icons
  document.querySelectorAll('.password-toggle-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const input = icon.closest('.password-input-wrapper').querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });

  // Switch Visitor vs Exhibitor Tabs on Registration Page
  const regTabVisitor = document.getElementById('tab-visitor');
  const regTabExhibitor = document.getElementById('tab-exhibitor');
  const formVisitor = document.getElementById('form-visitor-group');
  const formExhibitor = document.getElementById('form-exhibitor-group');

  if (regTabVisitor && regTabExhibitor && formVisitor && formExhibitor) {
    regTabVisitor.addEventListener('click', () => {
      regTabVisitor.classList.add('active');
      regTabExhibitor.classList.remove('active');
      formVisitor.style.display = 'block';
      formExhibitor.style.display = 'none';
      // Enable/disable required attributes
      formVisitor.querySelectorAll('input, select').forEach(el => el.setAttribute('required', ''));
      formExhibitor.querySelectorAll('input, select').forEach(el => el.removeAttribute('required'));
    });

    regTabExhibitor.addEventListener('click', () => {
      regTabExhibitor.classList.add('active');
      regTabVisitor.classList.remove('active');
      formExhibitor.style.display = 'block';
      formVisitor.style.display = 'none';
      // Enable/disable required attributes
      formExhibitor.querySelectorAll('input, select').forEach(el => el.setAttribute('required', ''));
      formVisitor.querySelectorAll('input, select').forEach(el => el.removeAttribute('required'));
    });
  }
}

/* ==========================================================================
   DASHBOARDS LOGIC
   ========================================================================== */
function initDashboards() {
  // Tab switching in User Dashboard
  const dbLinks = document.querySelectorAll('.dashboard-menu-item');
  const dbSections = document.querySelectorAll('.dashboard-section');

  if (dbLinks.length > 0 && dbSections.length > 0) {
    dbLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Update active class in menu
        dbLinks.forEach(item => item.classList.remove('active'));
        link.classList.add('active');

        // Show active section
        const targetId = link.getAttribute('data-target');
        dbSections.forEach(section => {
          if (section.id === targetId) {
            section.style.display = 'block';
          } else {
            section.style.display = 'none';
          }
        });
      });
    });
  }

  // Interactive Booth Map Management
  const booths = document.querySelectorAll('.booth-card');
  const selectedBoothNum = document.getElementById('selected-booth-num');
  const selectedBoothStatus = document.getElementById('selected-booth-status');
  const selectedBoothSize = document.getElementById('selected-booth-size');
  const selectedBoothCompany = document.getElementById('selected-booth-company');
  const reserveBoothBtn = document.getElementById('btn-reserve-booth');

  if (booths.length > 0) {
    booths.forEach(booth => {
      booth.addEventListener('click', () => {
        const number = booth.getAttribute('data-booth-num');
        const status = booth.getAttribute('data-status');
        const size = booth.getAttribute('data-size') || "3m x 3m";
        const company = booth.getAttribute('data-company') || "None";

        if (selectedBoothNum) selectedBoothNum.innerText = number;
        if (selectedBoothStatus) {
          selectedBoothStatus.innerText = status;
          selectedBoothStatus.className = `booth-status ${status}`;
        }
        if (selectedBoothSize) selectedBoothSize.innerText = size;
        if (selectedBoothCompany) selectedBoothCompany.innerText = company;

        // Toggle reserve buttons
        if (reserveBoothBtn) {
          if (status === 'available') {
            reserveBoothBtn.innerText = "Reserve Booth";
            reserveBoothBtn.style.display = 'inline-block';
            reserveBoothBtn.className = 'btn btn-primary';
          } else if (status === 'reserved') {
            reserveBoothBtn.innerText = "Release Reservation";
            reserveBoothBtn.style.display = 'inline-block';
            reserveBoothBtn.className = 'btn btn-outline';
          } else {
            reserveBoothBtn.style.display = 'none'; // Occupied booths cannot be changed from portal
          }
        }
      });
    });

    if (reserveBoothBtn) {
      reserveBoothBtn.addEventListener('click', () => {
        const activeBoothNum = selectedBoothNum.innerText;
        const activeBooth = document.querySelector(`.booth-card[data-booth-num="${activeBoothNum}"]`);
        
        if (activeBooth) {
          const currentStatus = activeBooth.getAttribute('data-status');
          
          if (currentStatus === 'available') {
            activeBooth.setAttribute('data-status', 'reserved');
            activeBooth.setAttribute('data-company', 'Your Company');
            activeBooth.querySelector('.booth-status').innerText = 'Reserved';
            activeBooth.querySelector('.booth-status').className = 'booth-status reserved';
            activeBooth.className = 'booth-card reserved';
            
            selectedBoothStatus.innerText = 'reserved';
            selectedBoothStatus.className = 'booth-status reserved';
            selectedBoothCompany.innerText = 'Your Company';
            reserveBoothBtn.innerText = "Release Reservation";
            reserveBoothBtn.className = 'btn btn-outline';
            alert(`Booth ${activeBoothNum} has been reserved!`);
          } else {
            activeBooth.setAttribute('data-status', 'available');
            activeBooth.setAttribute('data-company', 'None');
            activeBooth.querySelector('.booth-status').innerText = 'Available';
            activeBooth.querySelector('.booth-status').className = 'booth-status available';
            activeBooth.className = 'booth-card available';
            
            selectedBoothStatus.innerText = 'available';
            selectedBoothStatus.className = 'booth-status available';
            selectedBoothCompany.innerText = 'None';
            reserveBoothBtn.innerText = "Reserve Booth";
            reserveBoothBtn.className = 'btn btn-primary';
            alert(`Booth ${activeBoothNum} has been released!`);
          }
        }
      });
    }
  }

  // Admin Dashboard Chart Animations (Increases bar height dynamically when viewable)
  const chartSection = document.getElementById('overview');
  if (chartSection) {
    const bars = document.querySelectorAll('.chart-bar');
    bars.forEach(bar => {
      const height = bar.getAttribute('style').match(/height:\s*([\d\w%]+)/);
      if (height) {
        const targetHeight = height[1];
        bar.style.height = '0';
        setTimeout(() => {
          bar.style.height = targetHeight;
        }, 300);
      }
    });
  }
}


/* ==========================================================================
   CHARTS & METRICS ANIMATIONS
   ========================================================================== */
function initCharts() {
  setTimeout(() => {
    // 1. Horizontal Progress Bars
    document.querySelectorAll('.progress-bar-fill').forEach(fill => {
      const widthVal = fill.getAttribute('data-width');
      if (widthVal) {
        fill.style.width = widthVal;
      }
    });

    // 2. Vertical Column Bar Charts
    document.querySelectorAll('.bar-chart-pill').forEach(pill => {
      const heightVal = pill.getAttribute('data-height');
      if (heightVal) {
        pill.style.height = heightVal;
      }
    });

    // 3. Circular SVG Progress Rings
    document.querySelectorAll('.ring-circle-fill').forEach(ring => {
      const percentVal = ring.getAttribute('data-percent');
      if (percentVal) {
        const circumference = 226; 
        const offset = circumference - (percentVal / 100) * circumference;
        ring.style.strokeDashoffset = offset;
      }
    });
  }, 400);
}
