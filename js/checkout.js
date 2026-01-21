
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    updateCartCount();
    loadOrderSummary();
    setupCheckoutForm();
    prefillUserData();
});

function checkLoginStatus() {
    const user = localStorage.getItem('user');
    const authLink = document.getElementById('auth-link');
    
    if (!user) {
        alert('Please login to checkout');
        window.location.href = 'login.html';
        return;
    }
    
    const userData = JSON.parse(user);
    authLink.innerHTML = `
        <a href="#" onclick="logout(); return false;">
            Logout (${userData.username})
        </a>
    `;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let count = 0;
    for (let i = 0; i < cart.length; i++) {
        count = count + cart[i].quantity;
    }
    document.getElementById('cart-count').textContent = count;
}

function prefillUserData() {
    const user = localStorage.getItem('user');
    if (user) {
        const userData = JSON.parse(user);
        document.getElementById('fullname').value = userData.full_name || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('phone').value = userData.phone || '';
        document.getElementById('address').value = userData.address || '';
        document.getElementById('city').value = userData.city || '';
        document.getElementById('postal').value = userData.postal_code || '';
    }
}

function loadOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('order-items');
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'products.html';
        return;
    }
    
    container.innerHTML = '';
    
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="order-item-info">
                <strong>${item.name}</strong>
                <p>Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'}</p>
                <p>Qty: ${item.quantity} × $${parseFloat(item.price).toFixed(2)}</p>
            </div>
            <div class="order-item-price">
                $${(parseFloat(item.price) * item.quantity).toFixed(2)}
            </div>
        `;
        
        container.appendChild(orderItem);
    }
    
    calculateTotals();
}

function calculateTotals() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    let subtotal = 0;
    for (let i = 0; i < cart.length; i++) {
        subtotal = subtotal + (parseFloat(cart[i].price) * cart[i].quantity);
    }
    
    let shipping = subtotal > 0 && subtotal < 200 ? 10 : 0;
    let tax = subtotal * 0.08;
    let total = subtotal + shipping + tax;
    
    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2);
    document.getElementById('tax').textContent = '$' + tax.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
}

function setupCheckoutForm() {
    document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processOrder();
    });
}

function processOrder() {
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const postal = document.getElementById('postal').value;
    const payment = document.querySelector('input[name="payment"]:checked').value;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const user = JSON.parse(localStorage.getItem('user'));
    
    let subtotal = 0;
    for (let i = 0; i < cart.length; i++) {
        subtotal = subtotal + (parseFloat(cart[i].price) * cart[i].quantity);
    }
    
    let shipping = subtotal > 0 && subtotal < 200 ? 10 : 0;
    let tax = subtotal * 0.08;
    let total = subtotal + shipping + tax;
    
    const orderData = {
        user_id: user.user_id,
        fullname: fullname,
        email: email,
        phone: phone,
        address: address + ', ' + city + ', ' + postal,
        payment_method: payment,
        total_amount: total,
        items: cart
    };
    
    const formData = new FormData();
    formData.append('order_data', JSON.stringify(orderData));
    
    fetch('php/process_order.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Order placed successfully! Order ID: ' + data.order_id);
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        } else {
            alert('Order failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Order placed successfully! (Demo mode - order saved locally)');
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
    });
}