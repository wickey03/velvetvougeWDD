
document.addEventListener('DOMContentLoaded', function() {
    setupFormSwitching();
    setupForms();
    updateCartCount();
});


function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let count = 0;
    for (let i = 0; i < cart.length; i++) {
        count = count + cart[i].quantity;
    }
    document.getElementById('cart-count').textContent = count;
}


function setupFormSwitching() {
    document.getElementById('show-register').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    });
    
    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });
}


function setupForms() {
    
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister();
    });
}


function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    
    // Send to PHP
    fetch('php/login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        
        if (data.success) {
            
            localStorage.setItem('user', JSON.stringify(data.user));
            
            alert('Login successful!');
            
            
            if (data.user.user_type === 'admin') {
                window.location.href = 'admin/dashboard.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Login failed. Please try again.');
    });
}


function handleRegister() {
    const fullname = document.getElementById('reg-fullname').value;
    const email = document.getElementById('reg-email').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const phone = document.getElementById('reg-phone').value;
    
    // Validate password length using if statement
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('fullname', fullname);
    formData.append('email', email);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('phone', phone);
    
    // Send to PHP
    fetch('php/register.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Use if-else to check success
        if (data.success) {
            alert('Registration successful! Please login.');
            
            // Switch to login form
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            
            // Clear form
            document.getElementById('registerForm').reset();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Registration failed. Please try again.');
    });
}