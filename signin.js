document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetTab = tab.getAttribute('data-tab');
            document.querySelectorAll('.form-container').forEach(form => form.classList.remove('active'));
            document.getElementById(`${targetTab}-form`).classList.add('active');

            document.querySelectorAll('form').forEach(form => form.reset());
            document.querySelectorAll('.error-message, .success-message').forEach(el => el.style.display = 'none');
        });
    });

    // Login submission
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
            return showError(email ? (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'loginEmail' : 'loginPassword') : 'loginEmail',
                email ? (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Invalid email' : 'Password required') : 'Email required');
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            const userData = { email: user.email, name: user.name };
            localStorage.setItem('currentUser', JSON.stringify(userData));

            if (document.getElementById('rememberMe').checked) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + 30);
                document.cookie = `userEmail=${user.email};expires=${expiry.toUTCString()};path=/`;
            }

            document.getElementById('loginSuccess').style.display = 'block';
            setTimeout(() => window.location.href = '../index.html', 1000);
        } else {
            showError('loginEmail', 'Invalid email or password');
        }
    });

    // Signup submission
    document.getElementById('signupForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 6 ||
            password !== confirmPassword || !document.getElementById('agreeTerms').checked) {
            return showError('signupEmail', 'Please check all fields are valid');
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(user => user.email === email)) return showError('signupEmail', 'Email already registered');

        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));

        document.getElementById('signupSuccess').style.display = 'block';
        setTimeout(() => document.querySelector('.tab[data-tab="login"]').click(), 1500);
    });

    // Check remembered user
    document.cookie.split(';').forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        if (key === 'userEmail') {
            document.getElementById('loginEmail').value = value;
            document.getElementById('rememberMe').checked = true;
        }
    });

    // Handle logged in state
    if (localStorage.getItem('currentUser')) {
        const authLink = document.getElementById('authLink');
        if (authLink) {
            authLink.textContent = 'Sign-out';
            authLink.href = '#';
            authLink.addEventListener('click', e => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
            });
        }
        document.getElementById('userProfileIcon').style.display = 'inline-block';
    }
});

function showError(inputId, message) {
    const errorEl = document.getElementById(`${inputId}Error`);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
    return false;
}