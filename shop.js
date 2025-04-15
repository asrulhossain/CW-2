document.addEventListener('DOMContentLoaded', function() {
    initializeShop();

    setupCategoryFilters();
 
    setupPriceFilters();

    setupSorting();
    

    setupAddToCartButtons();

    setupPagination();

    updateCartCount();
});

function initializeShop() {
    
    window.allProducts = Array.from(document.querySelectorAll('.wch'));
    
    window.originalProductOrder = window.allProducts.map(product => {
        return {
            element: product,
            index: Array.from(product.parentNode.children).indexOf(product)
        };
    });
    
    addDataAttributes();
}

function addDataAttributes() {
    const products = document.querySelectorAll('.wch');
    
    products.forEach(product => {
        const name = product.querySelector('.dis h5')?.textContent || '';
        const price = product.querySelector('.dis h4')?.textContent || '';
        
        product.setAttribute('data-name', name);
        product.setAttribute('data-price', price);
        
        if (product.querySelector('.new-tag')) {
            product.setAttribute('data-new', 'true');
        }
    });
}

function setupCategoryFilters() {
    const categoryCheckboxes = document.querySelectorAll('.filter-group:nth-child(1) input[type="checkbox"]');
    
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked && this.nextElementSibling.textContent.trim() === 'All') {
                categoryCheckboxes.forEach(cb => {
                    if (cb !== this) {
                        cb.checked = false;
                    }
                });
            } 
            else if (this.checked) {
                const allCheckbox = Array.from(categoryCheckboxes).find(cb => 
                    cb.nextElementSibling.textContent.trim() === 'All'
                );
                if (allCheckbox) {
                    allCheckbox.checked = false;
                }
            }
            
            applyFilters();
        });
    });
}

// Setup price range filter checkboxes
function setupPriceFilters() {
    const priceCheckboxes = document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]');
    
    priceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked && this.nextElementSibling.textContent.trim() === 'All') {
                priceCheckboxes.forEach(cb => {
                    if (cb !== this) {
                        cb.checked = false;
                    }
                });
            } 
            else if (this.checked) {
                const allCheckbox = Array.from(priceCheckboxes).find(cb => 
                    cb.nextElementSibling.textContent.trim() === 'All'
                );
                if (allCheckbox) {
                    allCheckbox.checked = false;
                }
            }
            
            applyFilters();
        });
    });
}

function setupSorting() {
    const sortSelect = document.getElementById('sort-filter');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            sortProducts(sortValue);
        });
    }
}

function applyFilters() {
    const selectedCategories = Array.from(
        document.querySelectorAll('.filter-group:nth-child(1) input[type="checkbox"]:checked')
    ).map(cb => cb.nextElementSibling.textContent.trim());
    
    const selectedPriceRanges = Array.from(
        document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]:checked')
    ).map(cb => cb.nextElementSibling.textContent.trim());
    
    let filteredProducts = window.allProducts;
    
    if (selectedCategories.length > 0 && !selectedCategories.includes('All')) {
        filteredProducts = filteredProducts.filter(product => {
            const brand = product.querySelector('.dis span').textContent;
            const categoryMapping = {
                'Luxe Time': 'Luxury',
                'Chronos': 'Luxury',
                'Pinnacle': 'Luxury',
                'Elegance': 'Luxury',
                'Ethereal': 'Luxury',
                'Quantum': 'Luxury',
                'Velocity': 'Sports',
                'Horizon': 'Sports',
                'Momentum': 'Smart',
                'Aurora': 'Smart',
                'Timex': 'Casual',
                'Serenity': 'Casual'
            };
            
            const category = categoryMapping[brand] || 'Casual';
            return selectedCategories.includes(category);
        });
    }
    
    if (selectedPriceRanges.length > 0 && !selectedPriceRanges.includes('All')) {
        filteredProducts = filteredProducts.filter(product => {
            const priceText = product.querySelector('.dis h4').textContent;
            const price = parseFloat(priceText.replace('$', ''));
            
            return selectedPriceRanges.some(range => {
                if (range === 'Under $100') {
                    return price < 100;
                } else if (range === '$100 - $200') {
                    return price >= 100 && price <= 200;
                } else if (range === '$200 - $300') {
                    return price > 200 && price <= 300;
                } else if (range === '$300+') {
                    return price > 300;
                }
                return false;
            });
        });
    }
    
    updateProductDisplay(filteredProducts);
    
    const currentSort = document.getElementById('sort-filter')?.value || 'featured';
    sortProducts(currentSort);
}

function sortProducts(criteria) {
    const productsContainer = document.querySelectorAll('.product-grid');
    if (!productsContainer.length) return;
    
    productsContainer.forEach(container => {
        const products = Array.from(container.querySelectorAll('.wch:not([style*="display: none"])'));
        
        switch(criteria) {
            case 'featured':
                products.sort((a, b) => {
                    const aIndex = window.originalProductOrder.find(p => p.element === a)?.index || 0;
                    const bIndex = window.originalProductOrder.find(p => p.element === b)?.index || 0;
                    return aIndex - bIndex;
                });
                break;
                
            case 'price-low':
                products.sort((a, b) => {
                    const aPrice = parseFloat(a.querySelector('.dis h4').textContent.replace('$', ''));
                    const bPrice = parseFloat(b.querySelector('.dis h4').textContent.replace('$', ''));
                    return aPrice - bPrice;
                });
                break;
                
            case 'price-high':
                products.sort((a, b) => {
                    const aPrice = parseFloat(a.querySelector('.dis h4').textContent.replace('$', ''));
                    const bPrice = parseFloat(b.querySelector('.dis h4').textContent.replace('$', ''));
                    return bPrice - aPrice;
                });
                break;
                
            case 'newest':
                products.sort((a, b) => {
                    const aIsNew = a.hasAttribute('data-new');
                    const bIsNew = b.hasAttribute('data-new');
                    
                    if (aIsNew && !bIsNew) return -1;
                    if (!aIsNew && bIsNew) return 1;
                    
                    const aIndex = window.originalProductOrder.find(p => p.element === a)?.index || 0;
                    const bIndex = window.originalProductOrder.find(p => p.element === b)?.index || 0;
                    return aIndex - bIndex;
                });
                break;
        }
        
        products.forEach(product => {
            container.appendChild(product);
        });
    });
}

function updateProductDisplay(products) {
    window.allProducts.forEach(product => {
        product.style.display = 'none';
    });
    
    products.forEach(product => {
        product.style.display = '';
    });
   
    if (products.length === 0) {
        showNoProductsMessage();
    } else {
        hideNoProductsMessage();
    }
    
    updateProductCount(products.length);
}

function showNoProductsMessage() {
    if (!document.querySelector('.no-products-message')) {
        const message = document.createElement('div');
        message.className = 'no-products-message';
        message.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No watches found</h3>
            <p>Try adjusting your filters or browse our entire collection.</p>
            <button id="reset-filters" class="reset-btn">Reset Filters</button>
        `;
        
        const shopProducts = document.getElementById('shop-products');
        if (shopProducts) {
            shopProducts.appendChild(message);
            document.getElementById('reset-filters').addEventListener('click', resetFilters);
        }
    }
}


function hideNoProductsMessage() {
    const message = document.querySelector('.no-products-message');
    if (message) {
        message.remove();
    }
}

// Reset all filters to default
function resetFilters() {
    const allCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
    
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = checkbox.nextElementSibling.textContent.trim() === 'All';
    });
    
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        sortFilter.value = 'featured';
    }
    
    applyFilters();
}

// Update product count display
function updateProductCount(count) {
    let countDisplay = document.querySelector('.product-count');
    
    if (!countDisplay) {
        countDisplay = document.createElement('div');
        countDisplay.className = 'product-count';
        const shopFilters = document.getElementById('shop-filters');
        if (shopFilters) {
            shopFilters.appendChild(countDisplay);
        }
    }
    
    countDisplay.textContent = `Showing ${count} watches`;
}

function setupAddToCartButtons() {
    const cartButtons = document.querySelectorAll('.wch .cart');
    
    cartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const product = this.closest('.wch');
            const productName = product.querySelector('.dis h5').textContent;
            const productPrice = product.querySelector('.dis h4').textContent;
            const productImg = product.querySelector('img').src;
            
            this.classList.add('added');
            
            setTimeout(() => {
                this.classList.remove('added');
            }, 1000);
            
            addToCart(productName, productPrice, productImg);
            
            showNotification(`${productName} added to cart!`);
        });
    });
}

function addToCart(name, price, image) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingProductIndex = cart.findIndex(item => item.name === name);
    
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += 1;
    } else {

        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));

    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartIcon = document.querySelector('#navbar li a[href="cart.html"] i');
    if (cartIcon) {
        let counter = cartIcon.parentNode.querySelector('.cart-count');
        if (!counter) {
            counter = document.createElement('span');
            counter.className = 'cart-count';
            cartIcon.parentNode.appendChild(counter);
        }

        if (totalItems > 0) {
            counter.textContent = totalItems;
            counter.style.display = 'inline-block';

            counter.classList.add('update');
            setTimeout(() => {
                counter.classList.remove('update');
            }, 500);
        } else {
            counter.style.display = 'none';
        }
    }
}

function setupPagination() {
    const paginationLinks = document.querySelectorAll('.pagination-controls a');
    
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            paginationLinks.forEach(l => l.classList.remove('active'));

            this.classList.add('active');

            if (!this.classList.contains('active')) {
                showNotification('Changing to page ' + this.textContent);
            }
        });
    });
}

// Show notification
function showNotification(message) {
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    

    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
