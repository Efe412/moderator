// Modern JavaScript for Moderator Team Website
class ModeratorSite {
    constructor() {
        this.isLoaded = false;
        this.scrollProgress = 0;
        this.particles = [];
        this.observer = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initLoader();
        this.initNavigation();
        this.initAnimations();
        this.initParticles();
        this.initCounters();
        this.initScrollEffects();
        this.initTooltips();
        this.initTypingEffect();

        console.log('🛡️ Moderatör Ekibi Sitesi Başarıyla Yüklendi!');
        console.log('📋 Tüm kuralları dikkatlice okuyunuz.');
    }

    setupEventListeners() {
        // DOM Content Loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }

        // Window Events
        window.addEventListener('load', () => this.onWindowLoad());
        window.addEventListener('scroll', () => this.onScroll());
        window.addEventListener('resize', () => this.onResize());

        // Keyboard Events
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    onDOMReady() {
        this.setupNavigation();
        this.setupBackToTop();
        this.setupSmoothScrolling();
    }

    onWindowLoad() {
        this.hideLoader();
        this.startAnimations();
    }

    onScroll() {
        this.updateScrollProgress();
        this.updateNavbarState();
        this.updateBackToTopVisibility();
        this.handleScrollAnimations();
    }

    onResize() {
        this.handleParticleResize();
    }

    // Loader Management
    initLoader() {
        this.loaderElement = document.getElementById('loadingScreen');
        this.progressBar = document.querySelector('.loading-progress');

        if (this.progressBar) {
            this.simulateLoadingProgress();
        }
    }

    simulateLoadingProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => this.hideLoader(), 500);
            }
            this.progressBar.style.width = `${progress}%`;
        }, 150);
    }

    hideLoader() {
        if (this.loaderElement) {
            this.loaderElement.classList.add('hidden');
            setTimeout(() => {
                this.loaderElement.style.display = 'none';
            }, 500);
        }
        this.isLoaded = true;
    }

    // Navigation Management
    initNavigation() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');

        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        }
    }

    setupNavigation() {
        // Active link highlighting
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    this.scrollToElement(targetElement);
                    this.closeMobileMenu();
                }
            });
        });
    }

    toggleMobileMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
    }

    closeMobileMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
    }

    updateNavbarState() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        // Update active nav link
        const sections = document.querySelectorAll('.section');
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Scroll Effects
    initScrollEffects() {
        this.scrollProgressElement = document.querySelector('.scroll-progress');
    }

    updateScrollProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = (window.scrollY / documentHeight) * 100;

        if (this.scrollProgressElement) {
            this.scrollProgressElement.style.width = `${Math.min(scrolled, 100)}%`;
        }

        this.scrollProgress = scrolled;
    }

    // Back to Top Button
    setupBackToTop() {
        this.backToTopButton = document.getElementById('backToTop');

        if (this.backToTopButton) {
            this.backToTopButton.addEventListener('click', () => {
                this.scrollToTop();
            });
        }
    }

    updateBackToTopVisibility() {
        if (this.backToTopButton) {
            if (window.scrollY > 500) {
                this.backToTopButton.classList.add('visible');
            } else {
                this.backToTopButton.classList.remove('visible');
            }
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Smooth Scrolling
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    this.scrollToElement(target);
                }
            });
        });
    }

    scrollToElement(element) {
        const offsetTop = element.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }

    // Animations and Observers
    initAnimations() {
        this.setupIntersectionObserver();
        this.observeElements();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');

                    // Special handling for different elements
                    if (entry.target.classList.contains('stat-number')) {
                        this.animateCounter(entry.target);
                    }

                    if (entry.target.classList.contains('progress-fill')) {
                        this.animateProgressBar(entry.target);
                    }
                }
            });
        }, options);
    }

    observeElements() {
        // Observe AOS elements
        document.querySelectorAll('[data-aos]').forEach(el => {
            this.observer.observe(el);
        });

        // Observe counters
        document.querySelectorAll('.stat-number').forEach(el => {
            this.observer.observe(el);
        });

        // Observe progress bars
        document.querySelectorAll('.progress-fill').forEach(el => {
            this.observer.observe(el);
        });
    }

    startAnimations() {
        // Add staggered animations to cards
        this.addStaggeredAnimations('.rule-card', 100);
        this.addStaggeredAnimations('.contact-card', 150);
        this.addStaggeredAnimations('.level-card', 200);
    }

    addStaggeredAnimations(selector, delay) {
        document.querySelectorAll(selector).forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * delay);
        });
    }

    // Counter Animation
    initCounters() {
        this.counters = document.querySelectorAll('.stat-number');
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        updateCounter();
    }

    // Progress Bar Animation
    animateProgressBar(element) {
        const targetWidth = element.style.width;
        element.style.width = '0%';

        setTimeout(() => {
            element.style.width = targetWidth;
        }, 300);
    }

    // Particle System
    initParticles() {
        this.particleContainer = document.querySelector('.hero-particles');
        if (!this.particleContainer) return;

        this.createParticles();
        this.animateParticles();
    }

    createParticles() {
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                pointer-events: none;
            `;

            this.particles.push({
                element: particle,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                opacity: Math.random() * 0.5 + 0.2
            });

            this.particleContainer.appendChild(particle);
        }
    }

    animateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Wrap around screen
            if (particle.x > window.innerWidth) particle.x = 0;
            if (particle.x < 0) particle.x = window.innerWidth;
            if (particle.y > window.innerHeight) particle.y = 0;
            if (particle.y < 0) particle.y = window.innerHeight;

            particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
        });

        requestAnimationFrame(() => this.animateParticles());
    }

    handleParticleResize() {
        // Redistribute particles on resize
        this.particles.forEach(particle => {
            if (particle.x > window.innerWidth) particle.x = window.innerWidth;
            if (particle.y > window.innerHeight) particle.y = window.innerHeight;
        });
    }

    // Typing Effect
    initTypingEffect() {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle && this.isLoaded) {
            const originalText = heroTitle.textContent;
            this.typeWriter(heroTitle, originalText, 100);
        }
    }

    typeWriter(element, text, speed) {
        element.textContent = '';
        let i = 0;

        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };

        type();
    }

    // Tooltips
    initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');

        tooltipElements.forEach(element => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: var(--gray-900);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                white-space: nowrap;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                pointer-events: none;
            `;

            element.appendChild(tooltip);

            element.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
            });

            element.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
            });
        });
    }

    // Card Interactions
    handleScrollAnimations() {
        const cards = document.querySelectorAll('.rule-card, .contact-card, .level-card');

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible) {
                card.style.transform = `translateY(${Math.max(0, rect.top * 0.1)}px)`;
            }
        });
    }

    // Keyboard Navigation
    handleKeyboard(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape') {
            this.closeMobileMenu();
        }

        // Arrow keys for navigation
        if (e.key === 'ArrowUp' && e.ctrlKey) {
            e.preventDefault();
            this.scrollToTop();
        }
    }

    // Utility Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Enhanced Card Effects
    initCardEffects() {
        const cards = document.querySelectorAll('.rule-card, .contact-card, .level-card, .timeline-content');

        cards.forEach(card => {
            // Mouse enter effect
            card.addEventListener('mouseenter', (e) => {
                this.createRippleEffect(e, card);
            });

            // Click animation
            card.addEventListener('click', (e) => {
                this.createClickAnimation(card);
            });
        });
    }

    createRippleEffect(e, element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = 60;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(102, 126, 234, 0.3);
            left: ${x}px;
            top: ${y}px;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            z-index: 1;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    createClickAnimation(element) {
        element.style.transform = 'scale(0.98)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }
}

function openIframe(url) {
    // Applications are always closed - show modal immediately
    showApplicationClosedModal();
    return;
}

function showApplicationClosedModal() {
    const modal = document.createElement('div');
    modal.className = 'modal application-closed-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            padding: 3rem;
            border-radius: 1rem;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        ">
            <div style="
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #ef4444, #dc2626);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem auto;
            ">
                <i class="fas fa-lock" style="font-size: 2rem; color: white;"></i>
            </div>
            <h3 style="
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 1rem;
                color: #1f2937;
            ">Başvurular Kapalı</h3>
            <p style="
                color: #6b7280;
                margin-bottom: 2rem;
                line-height: 1.6;
            ">Şu anda moderatör başvuruları kapalıdır. Başvuru döneminin açılması için duyurularımızı takip edin.</p>
            <button onclick="closeApplicationClosedModal()" style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <i class="fas fa-check"></i> Anladım
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.firstElementChild.style.transform = 'scale(1)';
    }, 10);
}

function closeApplicationClosedModal() {
    const modal = document.querySelector('.application-closed-modal');
    if (modal) {
        modal.style.opacity = '0';
        modal.firstElementChild.style.transform = 'scale(0.9)';
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// CSS Animations for ripple effect
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .particle {
        will-change: transform;
    }

    .hero-title {
        will-change: contents;
    }
`;
document.head.appendChild(style);

// Function for "Moderatör Ol" button
function becomeModerator() {
    showApplicationClosedModal();
}

// Function to handle any application attempt
function applyForModerator() {
    showApplicationClosedModal();
}

// Initialize the application
const moderatorSite = new ModeratorSite();

// Additional utility functions
window.ModeratorUtils = {
    // Format date
    formatDate: (date) => {
        return new Intl.DateTimeFormat('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    },

    // Show notification
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        switch(type) {
            case 'success':
                notification.style.background = '#48bb78';
                break;
            case 'error':
                notification.style.background = '#f56565';
                break;
            case 'warning':
                notification.style.background = '#ed8936';
                break;
            default:
                notification.style.background = '#667eea';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Copy to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            ModeratorUtils.showNotification('Panoya kopyalandı!', 'success');
        } catch (err) {
            ModeratorUtils.showNotification('Kopyalama başarısız!', 'error');
        }
    },

    // Local storage helpers
    storage: {
        set: (key, value) => {
            localStorage.setItem(`moderator_${key}`, JSON.stringify(value));
        },
        get: (key) => {
            try {
                return JSON.parse(localStorage.getItem(`moderator_${key}`));
            } catch {
                return null;
            }
        },
        remove: (key) => {
            localStorage.removeItem(`moderator_${key}`);
        }
    }
};

// Service Worker Registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Performance monitoring
const perfObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
            console.log(`⚡ Sayfa yükleme süresi: ${entry.loadEventEnd - entry.loadEventStart}ms`);
        }
    });
});

try {
    perfObserver.observe({ entryTypes: ['navigation'] });
} catch (e) {
    console.log('Performance Observer desteklenmiyor');
}

// Dark mode toggle (bonus feature)
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    ModeratorUtils.storage.set('darkMode', isDark);
    ModeratorUtils.showNotification(
        isDark ? 'Karanlık mod açıldı' : 'Aydınlık mod açıldı',
        'info'
    );
}

// Initialize dark mode based on user preference
window.addEventListener('load', () => {
    const savedDarkMode = ModeratorUtils.storage.get('darkMode');
    const shouldUseDark = savedDarkMode !== null ? savedDarkMode : prefersDarkScheme.matches;

    if (shouldUseDark) {
        document.body.classList.add('dark-mode');
    }
});

// Listen for system dark mode changes
prefersDarkScheme.addEventListener('change', (e) => {
    if (ModeratorUtils.storage.get('darkMode') === null) {
        document.body.classList.toggle('dark-mode', e.matches);
    }
});

console.log('🚀 Tüm özellikler aktif!');
console.log('💡 İpucu: Konsolu açık tutarak site performansını izleyebilirsiniz.');