document.addEventListener('DOMContentLoaded', function() {
    initPreloader();
    
    // Mobile menu handlers
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
    
    // Cookie popup
    const cookiePopup = document.getElementById('cookie-popup');
    
    if (cookiePopup) {
        cookiePopup.style.display = 'flex';
        
        const acceptBtn = document.getElementById('accept-cookie');
        const denyBtn = document.getElementById('deny-cookie');
        
        if (acceptBtn) {
            acceptBtn.addEventListener('click', function() {
                cookiePopup.style.opacity = '0';
                setTimeout(() => {
                    cookiePopup.style.display = 'none';
                }, 300);
                localStorage.setItem('cookies-accepted', 'true');
            });
        }
        
        if (denyBtn) {
            denyBtn.addEventListener('click', function() {
                cookiePopup.style.opacity = '0';
                setTimeout(() => {
                    cookiePopup.style.display = 'none';
                }, 300);
                localStorage.setItem('cookies-accepted', 'false');
            });
        }
    }
    
    updateUserProfileDisplay();
    
    // Product card hover 
    const productCards = document.querySelectorAll('.wch');
    
    productCards.forEach(card => {
        const cartButton = card.querySelector('.cart');
        
        card.addEventListener('mouseenter', function() {
            this.classList.add('hover-active');
            if (cartButton) {
                cartButton.style.opacity = '1';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hover-active');
            if (cartButton) {
                cartButton.style.opacity = '0.7';
            }
        });
        
        if (cartButton) {
            cartButton.addEventListener('click', function(e) {
                e.preventDefault();
                const productName = this.closest('.wch').querySelector('.dis h5').textContent;
                
                this.classList.add('added');
                setTimeout(() => {
                    this.classList.remove('added');
                }, 1000);
                
                showNotification(`${productName} added to cart!`);
            });
        }
    });
    
    animateHeroText();
    setupLinkTransitions();
});

//  page loading animation
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
    
    window.addEventListener('load', function() {
        setTimeout(function() {
            preloader.style.opacity = '0';
            document.body.classList.add('loaded');
            
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 800);
    });
    
    setTimeout(function() {
        if (!document.body.classList.contains('loaded')) {
            preloader.style.opacity = '0';
            document.body.classList.add('loaded');
            
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 4000);
}

// smooth page transitions
function setupLinkTransitions() {
    const links = document.querySelectorAll('a:not([href^="#"]):not([href^="javascript"])');
    
    links.forEach(link => {
        if (link.hostname !== window.location.hostname && link.hostname !== '') {
            return;
        }
        
        link.addEventListener('click', function(e) {
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

// Ui based on user
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
        
        newAuthLink.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
        
        userProfileIcon.style.display = 'inline-block';
        
        try {
            const userData = JSON.parse(currentUser);
            if (userData.email) {
                userProfileIcon.querySelector('a').title = `Logged in as ${userData.email}`;
                
                if (userData.name && document.getElementById('hero')) {
                    const welcomeMsg = document.createElement('div');
                    welcomeMsg.className = 'welcome-msg';
                    welcomeMsg.textContent = `Welcome back, ${userData.name}!`;
                    document.getElementById('hero').prepend(welcomeMsg);
                }
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

// Hero section fade-in animation
function animateHeroText() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;
    
    const h4 = heroSection.querySelector('h4');
    const h2 = heroSection.querySelector('h2');
    const h1 = heroSection.querySelector('h1');
    const p = heroSection.querySelector('p');
    const button = heroSection.querySelector('button');
    
    if (h4) {
        h4.classList.add('fade-in');
        setTimeout(() => {
            if (h2) h2.classList.add('fade-in');
            setTimeout(() => {
                if (h1) h1.classList.add('fade-in');
                setTimeout(() => {
                    if (p) p.classList.add('fade-in');
                    if (button) button.classList.add('fade-in');
                }, 400);
            }, 400);
        }, 400);
    }
}

// Show  notification
function showNotification(message) {
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.style.right = '0';
    }, 10);
    
    setTimeout(() => {
        notification.style.right = '-300px';
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}