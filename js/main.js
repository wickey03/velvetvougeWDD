

document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    loadFeaturedProducts();
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

function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    
    fetch('php/get_products.php?featured=1')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayProducts(data.products, container);
            } else {
                container.innerHTML = '<p class="error">Failed to load products</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<p class="error">Failed to load products</p>';
        });
}

function displayProducts(products, container) {
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p>No products found</p>';
        return;
    }
    
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        const card = document.createElement('div');
        card.className = 'product-card';
        
        //  product name = image filename
        let imagePath;
        if (product.image_url && product.image_url.startsWith('http')) {
            // If it's a URL,  direct use
            imagePath = product.image_url;
        } else if (product.image_url && product.image_url.startsWith('images/')) {
            // If it already has images/ prefix
            imagePath = product.image_url;
        } else {
            // product name = filename
            imagePath = 'images/products/' + product.product_name + '.jpg';
        }
        
        let priceHTML = '';
        if (product.sale_price && product.sale_price < product.price) {
            priceHTML = `
                <span class="price-sale">$${product.sale_price}</span>
                <span class="price-original">$${product.price}</span>
            `;
        } else {
            priceHTML = `<span>$${product.price}</span>`;
        }
        
        card.innerHTML = `
            <img src="${imagePath}" 
                 alt="${product.product_name}"
                 onerror="this.src='https://via.placeholder.com/300x300/1a365d/ffffff?text=No+Image'">
            <div class="product-info">
                <h3>${product.product_name}</h3>
                <p>${product.description ? product.description.substring(0, 80) + '...' : ''}</p>
                <div class="product-price">${priceHTML}</div>
                <button class="btn-primary" onclick="addToCart(${product.product_id})">
                    Add to Cart
                </button>
            </div>
        `;
        
        container.appendChild(card);
    }
}

function addToCart(productId) {
    fetch(`php/get_products.php?id=${productId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.products.length > 0) {
                const product = data.products[0];
                
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                
                let found = false;
                for (let i = 0; i < cart.length; i++) {
                    if (cart[i].product_id === productId) {
                        cart[i].quantity = cart[i].quantity + 1;
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    // product name = image
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
                        quantity: 1
                    });
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                alert('Product added to cart!');
            } else {
                alert('Failed to add product.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to add product to cart');
        });
}