/* ==========================================================================
   DISASTER RELIEF FOUNDATION - Main Script orchestrator
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initScrollReveal();
    initCounterAnimations();
    initOperationProgressBars();
    initStoriesSlider();
    initNewsletterForm();
    initFaqAccordion();
    initButtonRedirects();
    initRoleToggleDesc();
});

/**
 * 1. Sticky Header Scroll Effect
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger initial state
}

/**
 * 2. Mobile Hamburger Menu Toggle & Dynamically Adjust CTA links
 */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    // Toggle menu visibility on hamburger click
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('is-active');
        navMenu.classList.toggle('is-active');
        document.documentElement.classList.toggle('overflow-hidden');
        document.body.classList.toggle('overflow-hidden');
    });
    
    // Drawer Close button inside menu
    const drawerClose = document.querySelector('.drawer-close');
    if (drawerClose) {
        drawerClose.addEventListener('click', () => {
            hamburger.classList.remove('is-active');
            navMenu.classList.remove('is-active');
            document.documentElement.classList.remove('overflow-hidden');
            document.body.classList.remove('overflow-hidden');
        });
    }
    
    // Close menu when clicking links
    const navLinks = document.querySelectorAll('.nav-link, .nav-menu .btn');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('is-active');
            navMenu.classList.remove('is-active');
            document.documentElement.classList.remove('overflow-hidden');
            document.body.classList.remove('overflow-hidden');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('is-active')) {
            hamburger.classList.remove('is-active');
            navMenu.classList.remove('is-active');
            document.documentElement.classList.remove('overflow-hidden');
            document.body.classList.remove('overflow-hidden');
        }
    });
}

/**
 * 3. Scroll Reveal Utility (Fades in elements as they scroll into view)
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (revealElements.length === 0) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop tracking after it animates
            }
        });
    }, observerOptions);
    
    revealElements.forEach(el => revealObserver.observe(el));
}

/**
 * 4. Animated Impact Counters
 */
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');
    if (counters.length === 0) return;
    
    const countTo = (counter) => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds animation duration
        const stepTime = 16; // ~60fps
        const totalSteps = Math.round(duration / stepTime);
        let step = 0;
        
        const suffix = counter.getAttribute('data-suffix') || '';
        
        const timer = setInterval(() => {
            step++;
            const progress = step / totalSteps;
            // Ease-out quad function for smooth deceleration
            const easedProgress = progress * (2 - progress);
            const currentVal = Math.floor(easedProgress * target);
            
            // Format number with commas
            counter.textContent = currentVal.toLocaleString() + suffix;
            
            if (step >= totalSteps) {
                counter.textContent = target.toLocaleString() + suffix;
                clearInterval(timer);
            }
        }, stepTime);
    };
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countTo(entry.target);
                obs.unobserve(entry.target); // Run counter once
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

/**
 * 5. Operation Progress Bar Loaders
 */
function initOperationProgressBars() {
    const fills = document.querySelectorAll('.operation-progress-fill');
    if (fills.length === 0) return;
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const percentage = fill.getAttribute('data-progress');
                fill.style.width = percentage;
                obs.unobserve(fill);
            }
        });
    }, { threshold: 0.3 });
    
    fills.forEach(fill => {
        fill.style.width = '0%'; // Start at 0%
        observer.observe(fill);
    });
}

/**
 * 6. Testimonials Slider (Stories of Hope Carousel)
 */
function initStoriesSlider() {
    const track = document.querySelector('.stories-track');
    const slides = document.querySelectorAll('.story-slide');
    const dotsContainer = document.querySelector('.slider-nav');
    
    if (!track || slides.length === 0) return;
    
    let currentIndex = 0;
    let autoPlayTimer = null;
    const intervalTime = 6000; // Slide auto-scroll every 6 seconds
    
    // Create dots if dots container exists and is empty
    if (dotsContainer && dotsContainer.children.length === 0) {
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetAutoPlay();
            });
            dotsContainer.appendChild(dot);
        });
    }
    
    const dots = document.querySelectorAll('.slider-dot');
    
    const updateDots = (index) => {
        dots.forEach((dot, idx) => {
            if (idx === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };
    
    const goToSlide = (index) => {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateDots(currentIndex);
    };
    
    const startAutoPlay = () => {
        autoPlayTimer = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, intervalTime);
    };
    
    const resetAutoPlay = () => {
        clearInterval(autoPlayTimer);
        startAutoPlay();
    };
    
    // Setup listeners for pausing auto-play on hover
    const sliderContainer = document.querySelector('.stories-slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
        sliderContainer.addEventListener('mouseleave', startAutoPlay);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!isInViewport(track)) return;
        
        if (e.key === 'ArrowRight') {
            goToSlide(currentIndex + 1);
            resetAutoPlay();
        } else if (e.key === 'ArrowLeft') {
            goToSlide(currentIndex - 1);
            resetAutoPlay();
        }
    });
    
    // Touch Swipe Support for Mobile
    let startX = 0;
    let endX = 0;
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        if (Math.abs(diff) > 50) { // Threshold for swipe
            if (diff > 0) {
                goToSlide(currentIndex + 1);
            } else {
                goToSlide(currentIndex - 1);
            }
            resetAutoPlay();
        }
    }, { passive: true });
    
    // Start slider
    startAutoPlay();
}

// Utility to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * 7. Newsletter Form Handler
 */
function initNewsletterForm() {
    const form = document.getElementById('footer-newsletter-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        window.location.href = '404.html';
    });
}

/**
 * 8. FAQ Accordion Handler
 */
function initFaqAccordion() {
    const faqTriggers = document.querySelectorAll('.faq-trigger');
    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.parentElement;
            const content = trigger.nextElementSibling;
            const icon = trigger.querySelector('.faq-icon');
            const isOpen = item.classList.contains('is-open');
            
            // Close all other items
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('is-open');
                i.querySelector('.faq-content').style.maxHeight = '0px';
                i.querySelector('.faq-icon').innerHTML = '&plus;';
            });
            
            if (!isOpen) {
                item.classList.add('is-open');
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.innerHTML = '&minus;';
            }
        });
    });
}

/**
 * 9. Redirect all non-interactive / mock buttons and main body CTA links to 404.html
 */
function initButtonRedirects() {
    // Select all mock button tags
    const buttons = document.querySelectorAll('button:not(.hamburger):not(.nav-close-btn):not(.sidebar-close-btn):not(.mobile-sidebar-toggle):not(.password-toggle-icon):not(.password-eye):not(.faq-trigger)');
    
    // Select all button-styled links (.btn) inside the main body container
    const btnLinks = document.querySelectorAll('main .btn');
    
    // Combine both collections
    const allRedirectElements = [...buttons, ...btnLinks];
    
    allRedirectElements.forEach(el => {
        // Exclude any buttons or links that are inside a form so validation/submission works correctly
        if (el.closest('form')) {
            return;
        }
        
        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '404.html';
        });
    });
}

/**
 * 10. Dynamic role-based description toggle inside Login/Register forms
 */
function initRoleToggleDesc() {
    const roleSelect = document.getElementById('role');
    const emailInput = document.getElementById('email');
    const helpDesc = document.getElementById('role-help-desc');
    if (!roleSelect || !emailInput || !helpDesc) return;

    const updateRoleContent = () => {
        const val = roleSelect.value;
        if (val === 'admin') {
            emailInput.placeholder = 'admin@stackly.org';
            helpDesc.textContent = 'Administrator account grants access to EOC cluster nodes, webhooks, latency telemetries, and operational dispatch logs.';
            helpDesc.style.color = '#00E676';
        } else {
            emailInput.placeholder = 'user@stackly.org';
            helpDesc.textContent = 'Client access grants access to relief requests, volunteer sign-up details, evacuation updates, and personal donation logs.';
            helpDesc.style.color = 'rgba(255, 255, 255, 0.45)';
        }
    };

    roleSelect.addEventListener('change', updateRoleContent);
    updateRoleContent();
}
