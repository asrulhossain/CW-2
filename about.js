
document.addEventListener('DOMContentLoaded', function () {

    initPreloader();

    const mobileMenuButton = document.getElementById('bar');
    const navbar = document.getElementById('navbar');
    const closeButton = document.getElementById('close');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            navbar.classList.remove('active');
        });
    }

    updateUserProfileDisplay();

    const contactLinks = document.querySelectorAll('.scroll-to-contact');

    if (contactLinks.length > 0) {
        contactLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();

                const contactSection = document.getElementById('contact-section');
                if (contactSection) {
                    const offsetTop = contactSection.offsetTop - 70;

                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    initContactForm();

    animateValuesOnScroll();

    const observeElements = document.querySelectorAll('.about section');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-section');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observeElements.forEach(element => {
            observer.observe(element);
        });
    } else {

        window.addEventListener('scroll', function () {
            const windowHeight = window.innerHeight;
            const scrollY = window.scrollY;

            observeElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top + scrollY;
                if (scrollY > (elementTop - windowHeight + 100)) {
                    element.classList.add('fade-in-section');
                }
            });
        });


        window.dispatchEvent(new Event('scroll'));
    }

    setupLinkTransitions();
});

function initPreloader() {

    if (!document.getElementById('preloader')) {
        const preloaderHTML = `
        <div id="preloader">
            <div class="spinner">
                <div class="double-bounce1"></div>
                <div class="double-bounce2"></div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('afterbegin', preloaderHTML);
    }

    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    window.addEventListener('load', function () {
        setTimeout(function () {
            preloader.style.opacity = '0';
            document.body.classList.add('loaded');

            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 800);
    });

    setTimeout(function () {
        if (!document.body.classList.contains('loaded')) {
            preloader.style.opacity = '0';
            document.body.classList.add('loaded');

            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 4000);
}

function setupLinkTransitions() {

    const links = document.querySelectorAll('a:not([href^="#"]):not([href^="javascript"]):not(.scroll-to-contact)');

    links.forEach(link => {

        if (link.hostname !== window.location.hostname && link.hostname !== '') {
            return;
        }

        link.addEventListener('click', function (e) {

            if (e.ctrlKey || e.metaKey || e.shiftKey) {
                return;
            }

            const href = this.getAttribute('href');


            if (href.startsWith('#')) {
                return;
            }


            if (!href || href === '#' || href.startsWith('javascript:')) {
                return;
            }


            e.preventDefault();


            showPreloaderForNavigation();


            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
}

function showPreloaderForNavigation() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    preloader.style.display = 'flex';
    preloader.style.opacity = '1';
    document.body.classList.remove('loaded');
}

function updateUserProfileDisplay() {
    const authLink = document.getElementById('authLink');
    const userProfileIcon = document.getElementById('userProfileIcon');

    if (!authLink || !userProfileIcon) return;


    const currentUser = localStorage.getItem('currentUser');

    if (currentUser) {

        authLink.textContent = 'Sign-out';

        const oldAuthLink = authLink;
        const newAuthLink = oldAuthLink.cloneNode(true);
        oldAuthLink.parentNode.replaceChild(newAuthLink, oldAuthLink);

        newAuthLink.addEventListener('click', function (e) {
            e.preventDefault();

            localStorage.removeItem('currentUser');

            window.location.href = 'index.html';
        });

        userProfileIcon.style.display = 'inline-block';
        userProfileIcon.style.opacity = '0';
        setTimeout(() => {
            userProfileIcon.style.opacity = '1';
        }, 50);

        try {
            const userData = JSON.parse(currentUser);
            if (userData.email) {
                userProfileIcon.querySelector('a').title = `Logged in as ${userData.email}`;
            }
        } catch (e) {
            console.error("Error parsing user data:", e);
        }
    } else {
        authLink.textContent = 'Sign-in';

        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            authLink.href = 'signin.html';
        } else {
            authLink.href = 'pages/signin.html';
        }

        userProfileIcon.style.display = 'none';
    }
}

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateContactForm()) {
            return false;
        }
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject') ? document.getElementById('subject').value : 'Contact Form Submission';
        const message = document.getElementById('message').value;
        const submitBtn = contactForm.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
        }
        const formData = {
            name: name,
            email: email,
            subject: subject,
            message: message,
            timestamp: new Date().toISOString()
        };
        setTimeout(function () {
            console.log('Form data:', formData);
            showContactResponse(true, 'Thank you for your message! We will get back to you soon.');
            contactForm.reset();

            if (submitBtn) {
                submitBtn.innerHTML = 'Send Message';
                submitBtn.disabled = false;
            }
        }, 2000);
    });
}

function validateContactForm() {
    let isValid = true;
  
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const subject = document.getElementById('subject'); // Optional field
    const message = document.getElementById('message');

    clearContactErrors();

    if (name.value.trim().length < 2) {
        showContactError(name, 'Please enter your full name (at least 2 characters)');
        isValid = false;
    }

    if (!validateEmail(email.value)) {
        showContactError(email, 'Please enter a valid email address');
        isValid = false;
    }

    if (subject && subject.value.trim().length < 3) {
        showContactError(subject, 'Please enter a subject (at least 3 characters)');
        isValid = false;
    }

    if (message.value.trim().length < 10) {
        showContactError(message, 'Please enter your message (at least 10 characters)');
        isValid = false;
    }
    return isValid;
}

function showContactError(inputElement, errorMessage) {

    inputElement.classList.remove('valid-input');
    inputElement.classList.add('error-input');

    let errorElement = inputElement.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
    }
    errorElement.textContent = errorMessage;
    errorElement.style.display = 'block';

    inputElement.classList.add('shake');
    setTimeout(() => {
        inputElement.classList.remove('shake');
    }, 500);
}

function clearContactErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(function (element) {
        element.style.display = 'none';
    });

    const formInputs = document.querySelectorAll('#contactForm input, #contactForm textarea');
    formInputs.forEach(function (input) {
        input.classList.remove('error-input');
    });
}

function showContactResponse(success, message) {
    let responseContainer = document.getElementById('contactResponse');
    if (!responseContainer) {
        responseContainer = document.createElement('div');
        responseContainer.id = 'contactResponse';
        const contactForm = document.getElementById('contactForm');
        contactForm.parentNode.insertBefore(responseContainer, contactForm.nextSibling);
    }
    responseContainer.className = success ? 'response-success' : 'response-error';
    responseContainer.innerHTML = `
        <div class="response-icon">
            <i class="fas ${success ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        </div>
        <div class="response-message">${message}</div>
    `;
    responseContainer.style.display = 'flex';
    responseContainer.style.opacity = '0';
    setTimeout(() => {
        responseContainer.style.opacity = '1';
    }, 10);
    if (success) {
        setTimeout(() => {
            responseContainer.style.opacity = '0';
            setTimeout(() => {
                responseContainer.style.display = 'none';
            }, 500);
        }, 8000);
    }
}

function animateValuesOnScroll() {
    const valueItems = document.querySelectorAll('.values li');

    valueItems.forEach((item, index) => {

        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';


        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            item.style.transition = 'all 0.5s ease';
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * 100);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            observer.observe(item);
        } else {

            window.addEventListener('scroll', function () {
                const elementTop = item.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;

                if (elementTop < windowHeight - 100) {
                    setTimeout(() => {
                        item.style.transition = 'all 0.5s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }
    });
}

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}