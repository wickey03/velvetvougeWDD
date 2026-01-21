
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    updateCartCount();
    loadProductDetail();
});

// Check wheater if user is logged in?
function checkLoginStatus() {
    const user = localStorage.getItem('user');
    const authLink = document.getElementById('auth-link');
    
    if (user) {
        const userData = JSON.parse(user);
        authLink.innerHTML = `
            <a href="#" onclick="logout(); return false;">
                Logout (${userData.username})
            </a>
        `;
    }
}

// Logout 
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

function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        document.getElementById('product-detail-container').innerHTML = 
            '<p class="error">Product not found</p>';
        return;
    }
    
    fetch(`php/get_products.php?id=${productId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.products.length > 0) {
                displayProductDetail(data.products[0]);
            } else {
                document.getElementById('product-detail-container').innerHTML = 
                    '<p class="error">Product not found</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('product-detail-container').innerHTML = 
                '<p class="error">Failed to load product</p>';
        });
}

function displayProductDetail(product) {
    const container = document.getElementById('product-detail-container');
    
    //image path
    let imagePath;
    if (product.image_url && product.image_url.startsWith('http')) {
        imagePath = product.image_url;
    } else if (product.image_url && product.image_url.startsWith('images/')) {
        imagePath = product.image_url;
    } else {
        imagePath = 'images/products/' + product.product_name + '.jpg';
    }
    
    // Parse sizes and colors
    const sizes = product.available_sizes ? product.available_sizes.split(',') : [];
    const colors = product.available_colors ? product.available_colors.split(',') : [];
    
    // size options
    let sizeOptions = '';
    for (let i = 0; i < sizes.length; i++) {
        sizeOptions += `<label class="size-option">
            <input type="radio" name="size" value="${sizes[i].trim()}" ${i === 0 ? 'checked' : ''}>
            <span>${sizes[i].trim()}</span>
        </label>`;
    }
    
    // color options
    let colorOptions = '';
    for (let i = 0; i < colors.length; i++) {
        colorOptions += `<label class="color-option">
            <input type="radio" name="color" value="${colors[i].trim()}" ${i === 0 ? 'checked' : ''}>
            <span>${colors[i].trim()}</span>
        </label>`;
    }
    
    // Price 
    let priceHTML = '';
    if (product.sale_price && product.sale_price < product.price) {
        priceHTML = `
            <span class="price-sale">$${product.sale_price}</span>
            <span class="price-original">$${product.price}</span>
        `;
    } else {
        priceHTML = `<span>$${product.price}</span>`;
    }
    
    container.innerHTML = `
        <div class="product-detail-layout">
            <div class="product-image-section">
                <img src="${imagePath}" 
                     alt="${product.product_name}"
                     onerror="this.src='https://via.placeholder.com/500x600/1a365d/ffffff?text=No+Image'">
            </div>
            
            <div class="product-info-section">
                <h1>${product.product_name}</h1>
                <p class="product-category">${product.category} - ${product.gender}</p>
                
                <div class="product-price-large">${priceHTML}</div>
                
                <div class="product-description">
                    <h3>Description</h3>
                    <p>${product.description || 'No description available'}</p>
                </div>
                
                <div class="product-specs">
                    <p><strong>Material:</strong> ${product.material || 'N/A'}</p>
                    <p><strong>Stock:</strong> ${product.stock_quantity} available</p>
                </div>
                
                ${sizes.length > 0 ? `
                <div class="size-selector">
                    <h3>Select Size:</h3>
                    <div class="size-options">
                        ${sizeOptions}
                    </div>
                </div>` : ''}
                
                ${colors.length > 0 ? `
                <div class="color-selector">
                    <h3>Select Color:</h3>
                    <div class="color-options">
                        ${colorOptions}
                    </div>
                </div>` : ''}
                
                <div class="quantity-selector">
                    <h3>Quantity:</h3>
                    <div class="quantity-control">
                        <button onclick="decreaseQty()">-</button>
                        <input type="number" id="quantity" value="1" min="1" max="${product.stock_quantity}">
                        <button onclick="increaseQty()">+</button>
                    </div>
                </div>
                
                <div class="product-actions">
                    <button class="btn-primary btn-large" onclick="addToCartWithOptions(${product.product_id})">
                        Add to Cart
                    </button>
                    <a href="products.html" class="btn-secondary">Continue Shopping</a>
                </div>
            </div>
        </div>
    `;
}

function increaseQty() {
    const qtyInput = document.getElementById('quantity');
    const max = parseInt(qtyInput.max);
    const current = parseInt(qtyInput.value);
    if (current < max) {
        qtyInput.value = current + 1;
    }
}

function decreaseQty() {
    const qtyInput = document.getElementById('quantity');
    const current = parseInt(qtyInput.value);
    if (current > 1) {
        qtyInput.value = current - 1;
    }
}

function addToCartWithOptions(productId) {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Get selected size
    const sizeRadio = document.querySelector('input[name="size"]:checked');
    const selectedSize = sizeRadio ? sizeRadio.value : null;
    
    // Get selected color
    const colorRadio = document.querySelector('input[name="color"]:checked');
    const selectedColor = colorRadio ? colorRadio.value : null;
    
    // Get quantity
    const quantity = parseInt(document.getElementById('quantity').value);
    
    fetch(`php/get_products.php?id=${productId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.products.length > 0) {
                const product = data.products[0];
                
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                
                // Check if same product with same size and color exists?????????
                let found = false;
                for (let i = 0; i < cart.length; i++) {
                    if (cart[i].product_id === productId && 
                        cart[i].size === selectedSize && 
                        cart[i].color === selectedColor) {
                        cart[i].quantity = cart[i].quantity + quantity;
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    // Image path
                    let imagePath;
                    if (product.image_url && product.image_url.startsWith('http')) {
                        imagePath = product.image_url;
                    } else if (product.image_url && product.image_url.startsWith('images/')) {
                        imagePath = product.image_url;
                    } else {
                        imagePath = 'images/products/' + product.product_name + '.jpg';
                    }
                    
                    cart.push({
                        product_id: productId,
                        name: product.product_name,
                        price: parseFloat(product.sale_price || product.price),
                        image: imagePath,
                        size: selectedSize,
                        color: selectedColor,
                        quantity: quantity
                    });
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                
                if (confirm('Product added to cart! Go to cart?')) {
                    window.location.href = 'cart.html';
                } else {
                    window.location.href = 'products.html';
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to add product to cart');
        });
}