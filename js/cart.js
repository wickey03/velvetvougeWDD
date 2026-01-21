

document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    loadCart();
    setupCheckout();
});

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let count = 0;
    for (let i = 0; i < cart.length; i++) {
        count = count + cart[i].quantity;
    }
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-container');
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        updateSummary(0, 0, 0, 0);
        return;
    }
    
    container.innerHTML = '';
    
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        
      
        let imagePath = item.image || 'images/products/' + item.name + '.jpg';
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${imagePath}" 
                 alt="${item.name}" 
                 onerror="this.src='https://via.placeholder.com/150x150/1a365d/ffffff?text=No+Image'">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)}</div>
                
                <div class="quantity-control">
                    <button onclick="decreaseQuantity(${i})">-</button>
                    <span>Quantity: ${item.quantity}</span>
                    <button onclick="increaseQuantity(${i})">+</button>
                </div>
                
                <div>
                    <strong>Subtotal:</strong> $${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </div>
                
                <button class="remove-item" onclick="removeItem(${i})">Remove</button>
            </div>
        `;
        
        container.appendChild(cartItem);
    }
    
    calculateTotals();
}

function increaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity = cart[index].quantity + 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

function decreaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart[index].quantity > 1) {
        cart[index].quantity = cart[index].quantity - 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
    } else {
        removeItem(index);
    }
}

function removeItem(index) {
    if (confirm('Remove this item from cart?')) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
    }
}

function calculateTotals() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    let subtotal = 0;
    
    for (let i = 0; i < cart.length; i++) {
        const price = parseFloat(cart[i].price) || 0;
        const quantity = parseInt(cart[i].quantity) || 0;
        subtotal = subtotal + (price * quantity);
    }
    
    let shipping = 0;
    if (subtotal > 0 && subtotal < 200) {
        shipping = 10;
    }
    
    let tax = subtotal * 0.08;
    let total = subtotal + shipping + tax;
    
    updateSummary(subtotal, shipping, tax, total);
}

function updateSummary(subtotal, shipping, tax, total) {
    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    
    if (shipping === 0) {
        document.getElementById('shipping').textContent = 'FREE';
    } else {
        document.getElementById('shipping').textContent = '$' + shipping.toFixed(2);
    }
    
    document.getElementById('tax').textContent = '$' + tax.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
}

function setupCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            const user = localStorage.getItem('user');
            
            if (!user) {
                if (confirm('You need to login to checkout. Go to login page?')) {
                    window.location.href = 'login.html';
                }
                return;
            }
            
            // Go to checkout page
            window.location.href = 'checkout.html';
        });
    }
}