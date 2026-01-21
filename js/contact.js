
// loding setup
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    setupContactForm();
});

// Update cart count
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let count = 0;
    for (let i = 0; i < cart.length; i++) {
        count = count + cart[i].quantity;
    }
    document.getElementById('cart-count').textContent = count;
}

// Setup contact form
function setupContactForm() {
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleContactSubmit();
    });
}

// Handle contact form submission
function handleContactSubmit() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value;
    

    if (!name || !email || !subject || !message) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('subject', subject);
    formData.append('message', message);
    
 
    fetch('php/contact.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {

        if (data.success) {
            showMessage('Thank you! Your message has been sent successfully.', 'success');
            document.getElementById('contactForm').reset();
        } else {
            showMessage('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Failed to send message. Please try again.', 'error');
    });
}

// Show msg function
function showMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    messageDiv.textContent = message;
    messageDiv.className = 'form-message ' + type;
    messageDiv.style.display = 'block';
    
    // Hide msg after 5 sec....
    setTimeout(function() {
        messageDiv.style.display = 'none';
    }, 5000);
}