document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate inputs
        if (!validateEmail(emailInput.value)) {
            showAlert('Please enter a valid email address', 'error');
            return;
        }
        
        if (passwordInput.value.length < 8) {
            showAlert('Password must be at least 8 characters', 'error');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner"></span> Authenticating...';

        try {
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Check against demo users
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === emailInput.value && u.password === passwordInput.value);
            
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Create session
            saveUserSession('demo-token', {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || 'default-avatar.jpg'
            });

            // Redirect to home page
            window.location.href = 'index.html';
        } catch (error) {
            showAlert(error.message, 'error');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });
});