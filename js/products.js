
let allProducts = [];
let filteredProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    loadAllProducts();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    document.getElementById('sort-products').addEventListener('change', sortProducts);
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let count = 0;
    for (let i = 0; i < cart.length; i++) {
        count = count + cart[i].quantity;
    }
    document.getElementById('cart-count').textContent = count;
}

function loadAllProducts() {
    const container = document.getElementById('products-container');
    
    fetch('php/get_products.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allProducts = data.products;
                filteredProducts = allProducts;
                displayProducts(filteredProducts);
                updateProductCount();
            } else {
                container.innerHTML = '<p class="error">Failed to load products</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<p class="error">Failed to load products</p>';
        });
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p>No products found matching your filters</p>';
        return;
    }
    
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        const card = document.createElement('div');
        card.className = 'product-card';
        
        //  product name = image filename
        let imagePath;
        if (product.image_url && product.image_url.startsWith('http')) {
            imagePath = product.image_url;
        } else if (product.image_url && product.image_url.startsWith('images/')) {
            imagePath = product.image_url;
        } else {
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
    <a href="product-detail.html?id=${product.product_id}" style="text-decoration: none; color: inherit;">
        <img src="${imagePath}" 
             alt="${product.product_name}"
             onerror="this.src='https://via.placeholder.com/300x300/1a365d/ffffff?text=No+Image'">
        <div class="product-info">
            <h3>${product.product_name}</h3>
            <p>${product.description ? product.description.substring(0, 80) + '...' : ''}</p>
            <p style="color: #6b7280; font-size: 0.9rem;">
                ${product.category} - ${product.gender}
            </p>
            <div class="product-price">${priceHTML}</div>
        </div>
    </a>
    <button class="btn-primary" onclick="event.stopPropagation(); window.location.href='product-detail.html?id=${product.product_id}'">
        View Details
    </button>
`;

        
        container.appendChild(card);
    }
}

function applyFilters() {
    filteredProducts = allProducts;
    
    const genderFilters = [];
    const genderCheckboxes = document.querySelectorAll('input[name="gender"]:checked');
    for (let i = 0; i < genderCheckboxes.length; i++) {
        genderFilters.push(genderCheckboxes[i].value);
    }
    
    const categoryFilters = [];
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
    for (let i = 0; i < categoryCheckboxes.length; i++) {
        categoryFilters.push(categoryCheckboxes[i].value);
    }
    
    const priceFilters = [];
    const priceCheckboxes = document.querySelectorAll('input[name="price"]:checked');
    for (let i = 0; i < priceCheckboxes.length; i++) {
        priceFilters.push(priceCheckboxes[i].value);
    }
    
    if (genderFilters.length > 0) {
        filteredProducts = filteredProducts.filter(function(product) {
            for (let i = 0; i < genderFilters.length; i++) {
                if (product.gender === genderFilters[i]) {
                    return true;
                }
            }
            return false;
        });
    }
    
    if (categoryFilters.length > 0) {
        filteredProducts = filteredProducts.filter(function(product) {
            for (let i = 0; i < categoryFilters.length; i++) {
                if (product.category === categoryFilters[i]) {
                    return true;
                }
            }
            return false;
        });
    }
    
    if (priceFilters.length > 0) {
        filteredProducts = filteredProducts.filter(function(product) {
            const price = product.sale_price || product.price;
            
            for (let i = 0; i < priceFilters.length; i++) {
                const range = priceFilters[i].split('-');
                const min = parseFloat(range[0]);
                const max = parseFloat(range[1]);
                
                if (price >= min && price <= max) {
                    return true;
                }
            }
            return false;
        });
    }
    
    displayProducts(filteredProducts);
    updateProductCount();
}

function clearFilters() {
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    for (let i = 0; i < allCheckboxes.length; i++) {
        allCheckboxes[i].checked = false;
    }
    
    filteredProducts = allProducts;
    displayProducts(filteredProducts);
    updateProductCount();
}

function sortProducts() {
    const sortValue = document.getElementById('sort-products').value;
    
    if (sortValue === 'price-low') {
        filteredProducts.sort(function(a, b) {
            const priceA = a.sale_price || a.price;
            const priceB = b.sale_price || b.price;
            return priceA - priceB;
        });
    } else if (sortValue === 'price-high') {
        filteredProducts.sort(function(a, b) {
            const priceA = a.sale_price || a.price;
            const priceB = b.sale_price || b.price;
            return priceB - priceA;
        });
    } else if (sortValue === 'name') {
        filteredProducts.sort(function(a, b) {
            if (a.product_name < b.product_name) return -1;
            if (a.product_name > b.product_name) return 1;
            return 0;
        });
    }
    
    displayProducts(filteredProducts);
}

function updateProductCount() {
    const countElement = document.getElementById('products-count');
    const count = filteredProducts.length;
    
    if (count === allProducts.length) {
        countElement.textContent = `Showing all ${count} products`;
    } else {
        countElement.textContent = `Showing ${count} of ${allProducts.length} products`;
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