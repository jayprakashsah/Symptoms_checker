document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth system
    initAuth();
});

function initAuth() {
    // Set up login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // Set up register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }

    // Set up password toggles
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Set up logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Check auth state on page load
    checkAuthState();
}

function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Simple validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Create session
        localStorage.setItem('currentUser', JSON.stringify(user));

        window.location.href = 'index.html';
    } else {
        alert('Invalid credentials');
    }
}

function handleRegister() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Simple validation
    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if user already exists
    if (users.some(u => u.email === email)) {
        alert('Email already registered');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password
    };

    // Save user
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    window.location.href = 'index.html';
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function checkAuthState() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const loginBtn = document.querySelector('.login-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');

    if (currentUser) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileDropdown) {
            profileDropdown.style.display = 'block';
            const profileName = profileDropdown.querySelector('.profile-name');
            if (profileName) profileName.textContent = currentUser.name;
        }

        // Redirect from auth pages if logged in
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('register.html')) {
            window.location.href = 'index.html';
        }
    } else {
        // User is logged out
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (profileDropdown) profileDropdown.style.display = 'none';

        // Redirect from protected pages if logged out
        if (window.location.pathname.includes('profile.html')) {
            window.location.href = 'login.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth state
    checkAuthState();
    
    // Set up logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
});

function checkAuthState() {
    const currentUser = getCurrentUser();
    const loginBtn = document.querySelector('.login-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');
    
    if (currentUser) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileDropdown) {
            profileDropdown.style.display = 'block';
            const profileName = profileDropdown.querySelector('.profile-name');
            const profileImg = profileDropdown.querySelector('.profile-img');
            if (profileName) profileName.textContent = currentUser.name.split(' ')[0];
            if (profileImg) profileImg.src = currentUser.avatar || 'images/default-avatar.jpg';
        }
    } else {
        // User is logged out
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (profileDropdown) profileDropdown.style.display = 'none';
    }
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}