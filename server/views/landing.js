<script>
document.addEventListener('DOMContentLoaded', () => {
    const smoothScroll = (target) => {
        const element = document.querySelector(target);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            smoothScroll(this.getAttribute('href'));
        });
    });

    const toggleFAQ = (question) => {
        const answer = question.nextElementSibling;
        const isHidden = answer.style.display === 'none' || answer.style.display === '';
        answer.style.display = isHidden ? 'block' : 'none';
        question.classList.toggle('active');
    };

    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => toggleFAQ(question));
    });

    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature, .agent, .pricing-plan, .language');
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
            if (isVisible) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();

    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.transform = 'scale(1.05)';
        });
        button.addEventListener('mouseout', () => {
            button.style.transform = 'scale(1)';
        });
    });

    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(20px)';
        setTimeout(() => {
            heroContent.style.transition = 'opacity 1s, transform 1s';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }

    const languageElements = document.querySelectorAll('.language');
    languageElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'opacity 0.5s, transform 0.5s';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });

    const randomizeColors = () => {
        const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8'];
        languageElements.forEach(el => {
            el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            el.style.color = '#ffffff';
        });
    };

    randomizeColors();
    setInterval(randomizeColors, 5000);

    const typewriterEffect = (element, text, speed = 50) => {
        let i = 0;
        const type = () => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        type();
    };

    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        heroTitle.innerHTML = '';
        typewriterEffect(heroTitle, 'AutoCode');
    }

    const parallaxEffect = () => {
        const hero = document.querySelector('.hero');
        const scrollPosition = window.pageYOffset;
        hero.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
    };

    window.addEventListener('scroll', parallaxEffect);

    const animateCountUp = (element, target, duration) => {
        let start = 0;
        const increment = target / (duration / 16);
        const animateCount = () => {
            start += increment;
            element.textContent = Math.floor(start);
            if (start < target) {
                requestAnimationFrame(animateCount);
            } else {
                element.textContent = target;
            }
        };
        animateCount();
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const countElement = entry.target;
                const target = parseInt(countElement.getAttribute('data-target'));
                animateCountUp(countElement, target, 2000);
                observer.unobserve(countElement);
            }
        });
    });

    document.querySelectorAll('.count-up').forEach(el => observer.observe(el));

    const rotateOnScroll = () => {
        const elements = document.querySelectorAll('.rotate-on-scroll');
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const scrollPercentage = (rect.top / window.innerHeight) * 100;
            el.style.transform = `rotate(${scrollPercentage}deg)`;
        });
    };

    window.addEventListener('scroll', rotateOnScroll);

    const toggleDarkMode = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    };

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    const lazyLoadImages = () => {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    };

    lazyLoadImages();
});
</script>