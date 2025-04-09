document.addEventListener('DOMContentLoaded', function() {
    initPreloader();
    if (!document.querySelector('.auth-page')) return;
    
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        authCard.style.opacity = '0';
        authCard.style.marginTop = '20px';
        setTimeout(() => {
            authCard.style.transition = 'all 0.8s ease';
            authCard.style.opacity = '1';
            authCard.style.marginTop = '0';
        }, 100);
    }
    
    addInputEffects();
    checkRememberedUser();
    
    document.getElementById('showSignUp')?.addEventListener('click', e => {
        e.preventDefault();
        switchForms('signup');
    });
    
    document.getElementById('showSignIn')?.addEventListener('click', e => {
        e.preventDefault();
        switchForms('signin');
    });
    
    // Sign In form 
    document.getElementById('signInForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('signInEmail').value;
        const password = document.getElementById('signInPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        resetAuthErrors();
        
        let isValid = true;
        if (!validateEmail(email)) {
            showAuthError('signInEmailError', 'Please enter a valid email address');
            addShakeEffect(document.getElementById('signInEmail').parentElement);
            isValid = false;
        }
        if (password.length < 6) {
            showAuthError('signInPasswordError', 'Password must be at least 6 characters');
            addShakeEffect(document.getElementById('signInPassword').parentElement);
            isValid = false;
        }
        if (isValid) handleSignIn(email, password, rememberMe);
    });
    
    // Sign Up form 
    document.getElementById('signUpForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signUpName').value;
        const email = document.getElementById('signUpEmail').value;
        const password = document.getElementById('signUpPassword').value;
        const confirmPassword = document.getElementById('signUpConfirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        resetAuthErrors();
        
        let isValid = true;
        if (name.length < 2) {
            showAuthError('signUpNameError', 'Full name must be at least 2 characters');
            addShakeEffect(document.getElementById('signUpName').parentElement);
            isValid = false;
        }
        if (!validateEmail(email)) {
            showAuthError('signUpEmailError', 'Please enter a valid email address');
            addShakeEffect(document.getElementById('signUpEmail').parentElement);
            isValid = false;
        }
        if (password.length < 6) {
            showAuthError('signUpPasswordError', 'Password must be at least 6 characters');
            addShakeEffect(document.getElementById('signUpPassword').parentElement);
            isValid = false;
        }
        if (password !== confirmPassword) {
            showAuthError('signUpConfirmPasswordError', 'Passwords do not match');
            addShakeEffect(document.getElementById('signUpConfirmPassword').parentElement);
            isValid = false;
        }
        if (!agreeTerms) {
            showAuthError('agreeTermsError', 'You must agree to the Terms of Service and Privacy Policy');
            isValid = false;
        }
        if (isValid) handleSignUp(name, email, password);
    });
    
    // Password visibility 
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordField = this.previousElementSibling;
            const icon = this.querySelector('i');
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    document.querySelectorAll('.auth-social-btn').forEach(button => {
        button.addEventListener('click', function() {
            alert(`${this.getAttribute('data-provider')} login would be implemented in a production environment.`);
        });
    });
    
    //  cookie 
    const cookiePopup = document.getElementById('cookie-popup');
    const acceptCookieBtn = document.getElementById('accept-cookie');
    const denyCookieBtn = document.getElementById('deny-cookie');
    if (cookiePopup) {
     
        if (!getCookie('cookie-consent')) {
            cookiePopup.style.display = 'flex';
        }
        if (acceptCookieBtn) {
            acceptCookieBtn.addEventListener('click', function() {
                setCookie('cookie-consent', 'accepted', 365);
                cookiePopup.style.opacity = '0';
                setTimeout(() => {
                    cookiePopup.style.display = 'none';
                }, 300);
            });
        }
        
        if (denyCookieBtn) {
            denyCookieBtn.addEventListener('click', function() {
                setCookie('cookie-consent', 'denied', 365);
                cookiePopup.style.opacity = '0';
                setTimeout(() => {
                    cookiePopup.style.display = 'none';
                }, 300);
                deleteCookie('user_session');
                deleteCookie('user_email');
                deleteCookie('user_name');
            });
        }
    }
    
    setupLinkTransitions();
});

function initPreloader() {
    if (!document.getElementById('preloader')) {
        document.body.insertAdjacentHTML('afterbegin', 
            `<div id="preloader"><div class="spinner"><div class="double-bounce1"></div>
            <div class="double-bounce2"></div></div></div>`);
    }
    
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            document.body.classList.add('loaded');
            setTimeout(() => preloader.style.display = 'none', 500);
        }, 800);
    });
    setTimeout(() => {
        if (!document.body.classList.contains('loaded')) {
            preloader.style.opacity = '0';
            document.body.classList.add('loaded');
            setTimeout(() => preloader.style.display = 'none', 500);
        }
    }, 4000);
}

function setupLinkTransitions() {
    document.querySelectorAll('a:not([href^="#"]):not([href^="javascript"])').forEach(link => {
        if (link.hostname !== window.location.hostname && link.hostname !== '') return;
        
        link.addEventListener('click', function(e) {
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;
            
            const href = this.getAttribute('href');
            if (!href || href === '#' || href.startsWith('#') || href.startsWith('javascript:')) return;
            
            e.preventDefault();
            showPreloaderForNavigation();
            setTimeout(() => window.location.href = href, 300);
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

function addInputEffects() {
    document.querySelectorAll('.auth-input-wrap').forEach(wrap => {
        const input = wrap.querySelector('input');
        const icon = wrap.querySelector('i');
        if (!input || !icon) return;
        
        input.addEventListener('focus', () => {
            wrap.style.borderColor = '#caadad';
            icon.style.color = '#7d6502';
        });
        
        input.addEventListener('blur', () => {
            wrap.style.borderColor = '#ddd';
            if (!input.value) icon.style.color = '#999';
        });
        
        if (input.value) icon.style.color = '#7d6502';
    });
}

function checkRememberedUser() {
    if (getCookie('cookie-consent') === 'accepted') {
        const userEmail = getCookie('user_email');
        const userName = getCookie('user_name');
        
        if (userEmail) {
            const emailField = document.getElementById('signInEmail');
            if (emailField) {
                emailField.value = userEmail;
                const icon = emailField.parentElement.querySelector('i');
                if (icon) icon.style.color = '#7d6502';
            }
            
            const rememberCheckbox = document.getElementById('rememberMe');
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
    } else {
        try {
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                const userData = JSON.parse(currentUser);
                const emailField = document.getElementById('signInEmail');
                if (emailField && userData.email) {
                    emailField.value = userData.email;
                    const icon = emailField.parentElement.querySelector('i');
                    if (icon) icon.style.color = '#7d6502';
                }
                const rememberCheckbox = document.getElementById('rememberMe');
                if (rememberCheckbox) rememberCheckbox.checked = true;
            }
        } catch (e) {
            console.error("Error checking remembered user:", e);
        }
    }
}

// Form switching 
function switchForms(formType) {
    resetAuthErrors();
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    if (!signInForm || !signUpForm) return;
    
    const trans = 'all 0.3s ease';
    if (formType === 'signup') {
        signInForm.style.transition = trans;
        signInForm.style.opacity = '0';
        signInForm.style.transform = 'translateX(-50px)';
        
        setTimeout(() => {
            signInForm.classList.remove('active');
            signInForm.style.visibility = 'hidden';
            signInForm.style.display = 'none';
            
            signUpForm.style.transition = trans;
            signUpForm.style.opacity = '0';
            signUpForm.style.transform = 'translateX(50px)';
            signUpForm.style.visibility = 'visible';
            signUpForm.style.display = 'block';
            signUpForm.classList.add('active');
            
            signUpForm.style.position = 'relative';
            signUpForm.style.top = '0';
            signUpForm.style.left = '0';
            
            setTimeout(() => {
                signUpForm.style.opacity = '1';
                signUpForm.style.transform = 'translateX(0)';
            }, 50);
        }, 300);
    } else {
        signUpForm.style.transition = trans;
        signUpForm.style.opacity = '0';
        signUpForm.style.transform = 'translateX(50px)';
        
        setTimeout(() => {
            signUpForm.classList.remove('active');
            signUpForm.style.visibility = 'hidden';
            signUpForm.style.display = 'none';
            
            signInForm.style.transition = trans;
            signInForm.style.opacity = '0';
            signInForm.style.transform = 'translateX(-50px)';
            signInForm.style.visibility = 'visible';
            signInForm.style.display = 'block';
            signInForm.classList.add('active');
            
            signInForm.style.position = 'relative';
            signInForm.style.top = '0';
            signInForm.style.left = '0';
            
            setTimeout(() => {
                signInForm.style.opacity = '1';
                signInForm.style.transform = 'translateX(0)';
            }, 50);
        }, 300);
    }
}

function handleSignIn(email, password, rememberMe) {
    let users = [];
    try {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) users = JSON.parse(storedUsers);
    } catch (e) {
        console.error("Error parsing users:", e);
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const successMessage = document.getElementById('signInSuccess');
        if (successMessage) successMessage.style.display = 'block';
        const sessionToken = generateSessionToken();
        
        if (rememberMe) {
            // Store user data in cookies 
            if (getCookie('cookie-consent') === 'accepted') {
                setCookie('user_session', sessionToken, 30); // 30 days
                setCookie('user_email', email, 30);
                setCookie('user_name', user.name, 30);
            } else {
                localStorage.setItem('currentUser', JSON.stringify({
                    email: email,
                    name: user.name,
                    sessionToken: sessionToken
                }));
            }
        } else {
            if (getCookie('cookie-consent') === 'accepted') {
                setCookie('user_session', sessionToken, null); 
                setCookie('user_email', email, null);
                setCookie('user_name', user.name, null);
            } else {
                localStorage.setItem('currentUser', JSON.stringify({
                    email: email,
                    name: user.name,
                    sessionToken: sessionToken
                }));
            }
        }
        
        const authCard = document.querySelector('.auth-card');
        if (authCard) {
            authCard.style.transition = 'all 0.5s ease';
            authCard.style.opacity = '0';
            authCard.style.marginTop = '-20px';
        }
        
        showPreloaderForNavigation();
        setTimeout(() => window.location.href = '../index.html', 1000);
    } else {
        showAuthError('signInPasswordError', 'Invalid email or password');
        addShakeEffect(document.getElementById('signInPassword')?.parentElement);
    }
}

function handleSignUp(name, email, password) {
    let users = [];
    try {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) users = JSON.parse(storedUsers);
        if (!Array.isArray(users)) users = [];
    } catch (e) {
        console.error("Error parsing users:", e);
        users = [];
    }
    
    if (users.some(user => user.email === email)) {
        showAuthError('signUpEmailError', 'Email already in use');
        addShakeEffect(document.getElementById('signUpEmail')?.parentElement);
        return;
    }
    
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        authCard.style.transition = 'transform 0.3s ease';
        authCard.style.transform = 'scale(1.02)';
        setTimeout(() => authCard.style.transform = 'scale(1)', 300);
    }
    
    const userCreated = new Date().toISOString();
    users.push({ name, email, password, created: userCreated });
    localStorage.setItem('users', JSON.stringify(users));
    
    const successMessage = document.getElementById('signUpSuccess');
    if (successMessage) successMessage.style.display = 'block';
    
    const signInEmail = document.getElementById('signInEmail');
    if (signInEmail) {
        signInEmail.value = email;
        const icon = signInEmail.parentElement.querySelector('i');
        if (icon) icon.style.color = '#7d6502';
    }
    
    setTimeout(() => {
        switchForms('signin');
        document.getElementById('signUpForm')?.reset();
        if (successMessage) setTimeout(() => successMessage.style.display = 'none', 500);
        showToast('Account Created', 'Please sign in with your new credentials', 'success');
    }, 1500);
}

function resetAuthErrors() {
    document.querySelectorAll('.auth-error').forEach(error => error.style.display = 'none');
    document.querySelectorAll('.auth-success').forEach(success => success.style.display = 'none');
    document.querySelectorAll('.auth-input-wrap').forEach(wrap => wrap.classList.remove('error-input'));
}

function showAuthError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function addShakeEffect(element) {
    if (!element) return;
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
}

function showToast(title, message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <strong>${title}</strong>
            <button class="toast-close">&times;</button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    toast.querySelector('.toast-close')?.addEventListener('click', function() {
        toast.classList.add('toast-hiding');
        setTimeout(() => toast.remove(), 500);
    });
    
    setTimeout(() => toast.classList.add('toast-showing'), 10);
    setTimeout(() => {
        toast.classList.add('toast-hiding');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// Email validation using regex
function validateEmail(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(email).toLowerCase());
}

// Cookie management 
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Strict";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
}

function generateSessionToken() {
    return 'session_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
}

function isUserLoggedIn() {
    if (getCookie('cookie-consent') === 'accepted') {
        return !!getCookie('user_session');
    } else {
        try {
            const currentUser = localStorage.getItem('currentUser');
            return !!currentUser && !!JSON.parse(currentUser).sessionToken;
        } catch (e) {
            console.error("Error checking login status:", e);
            return false;
        }
    }
}
function logoutUser() {
    if (getCookie('cookie-consent') === 'accepted') {
        deleteCookie('user_session');
        deleteCookie('user_email');
        deleteCookie('user_name');
    }
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}