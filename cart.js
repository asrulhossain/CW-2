document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    setupQuantityControls();
    setupRemoveItemActions();
    setupCouponCode();
    
    // Setup checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            proceedToCheckout();
        });
    }
    
    setupRelatedProductsCart();
});

function initializeCart() {
    loadCartFromStorage();
    
    updateCartTotals();
    
    const cartItems = document.querySelectorAll('#cart-items tr');
    if (cartItems.length === 0) {
        showEmptyCartMessage();
    }
    
    if (window.innerWidth <= 576) {
        addMobileDataAttributes();
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 576) {
            addMobileDataAttributes();
        }
    });
}

function loadCartFromStorage() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (!cartItemsContainer || cart.length === 0) return;
    
    cartItemsContainer.innerHTML = '';
    
    // Add items from localStorage
    cart.forEach(item => {
        const row = document.createElement('tr');
        
        const subtotal = parseFloat(item.price.replace('$', '')) * item.quantity;
        
        row.innerHTML = `
            <td><a href="#" class="remove-item" data-name="${item.name}"><i class="far fa-times-circle"></i></a></td>
            <td><img src="${item.image}" alt="${item.name}"></td>
            <td>${item.name}</td>
            <td>${item.price}</td>
            <td>
                <div class="quantity-selector">
                    <button class="qty-btn decrease">-</button>
                    <input type="number" value="${item.quantity}" min="1" class="item-quantity">
                    <button class="qty-btn increase">+</button>
                </div>
            </td>
            <td>$${subtotal.toFixed(2)}</td>
        `;
        
        cartItemsContainer.appendChild(row);
    });
}

function addMobileDataAttributes() {
    const cartRows = document.querySelectorAll('#cart-items tr');
    
    cartRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 6) {
            cells[3].setAttribute('data-title', 'Price');
            cells[4].setAttribute('data-title', 'Quantity');
            cells[5].setAttribute('data-title', 'Subtotal');
        }
    });
}

// Setup quantity control buttons
function setupQuantityControls() {
    document.addEventListener('click', function(e) {
        if (e.target.matches('.quantity-selector .decrease')) {
            const input = e.target.nextElementSibling;
            const currentValue = parseInt(input.value);
            if (currentValue > 1) {
                input.value = currentValue - 1;
                updateItemTotal(e.target.closest('tr'));
                updateCartStorage(e.target.closest('tr'));
            }
        }
        
        if (e.target.matches('.quantity-selector .increase')) {
            const input = e.target.previousElementSibling;
            const currentValue = parseInt(input.value);
            input.value = currentValue + 1;
            updateItemTotal(e.target.closest('tr'));
            updateCartStorage(e.target.closest('tr'));
        }
    });
    
    document.addEventListener('change', function(e) {
        if (e.target.matches('.item-quantity')) {
            if (parseInt(e.target.value) < 1 || isNaN(parseInt(e.target.value))) {
                e.target.value = 1;
            }
            updateItemTotal(e.target.closest('tr'));
            updateCartStorage(e.target.closest('tr'));
        }
    });
}

// Update item subtotal based on quantity
function updateItemTotal(row) {
    if (!row) return;
    
    const priceCell = row.querySelector('td:nth-child(4)');
    const quantityInput = row.querySelector('.item-quantity');
    const subtotalCell = row.querySelector('td:nth-child(6)');
    
    if (!priceCell || !quantityInput || !subtotalCell) return;
    
    const priceText = priceCell.textContent.trim();
    const price = parseFloat(priceText.replace('$', ''));
    const quantity = parseInt(quantityInput.value);
    
    if (isNaN(price) || isNaN(quantity)) return;
    
    const subtotal = price * quantity;
    subtotalCell.textContent = '$' + subtotal.toFixed(2);
    
    updateCartTotals();
}

function updateCartStorage(row) {
    if (!row) return;
    
    const productName = row.querySelector('td:nth-child(3)').textContent;
    const quantity = parseInt(row.querySelector('.item-quantity').value);
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const productIndex = cart.findIndex(item => item.name === productName);
    
    if (productIndex !== -1) {
        
        cart[productIndex].quantity = quantity;
        
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    updateCartCount();
}

// Remove item from cart
function setupRemoveItemActions() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            e.preventDefault();
            
            const removeButton = e.target.closest('.remove-item');
            const row = removeButton.closest('tr');
            
            if (!row) return;
            
            const productName = row.querySelector('td:nth-child(3)').textContent.trim();
            
            row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            row.style.opacity = '0';
            row.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                row.remove();
                
                removeFromCart(productName);
                
                updateCartTotals();
                
                showNotification(`${productName} has been removed from your cart.`);
                
                const cartItems = document.querySelectorAll('#cart-items tr');
                if (cartItems.length === 0) {
                    showEmptyCartMessage();
                }
            }, 300);
        }
    });
}

function removeFromCart(productName) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cart = cart.filter(item => item.name !== productName);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartIcon = document.querySelector('#navbar li a[href="cart.html"] i');
    if (cartIcon) {
        let counter = cartIcon.nextElementSibling;
        if (!counter || !counter.classList.contains('cart-count')) {
            counter = document.createElement('span');
            counter.className = 'cart-count';
            cartIcon.parentNode.appendChild(counter);
        }
        
        if (totalItems > 0) {
            counter.textContent = totalItems;
            counter.style.display = 'inline-block';
        } else {
            counter.style.display = 'none';
        }
    }
}

function updateCartTotals() {
    const totalsTable = document.querySelector('.cart-totals table');
    if (!totalsTable) return;
    
    let subtotal = 0;
    const rows = document.querySelectorAll('#cart-items tr');
    
    rows.forEach(row => {
        const subtotalCell = row.querySelector('td:nth-child(6)');
        if (subtotalCell) {
            const subtotalText = subtotalCell.textContent.trim();
            const rowTotal = parseFloat(subtotalText.replace('$', ''));
            if (!isNaN(rowTotal)) {
                subtotal += rowTotal;
            }
        }
    });
    
    const subtotalCell = totalsTable.querySelector('tr:first-child td:last-child');
    if (subtotalCell) {
        subtotalCell.textContent = '$' + subtotal.toFixed(2);
    }
    
    const discountCell = totalsTable.querySelector('tr:nth-child(3) td:last-child');
    let discountAmount = 0;
    
    if (discountCell) {
        const discountText = discountCell.textContent.trim();
        if (discountText !== '$0.00' && discountText.includes('-$')) {
            discountAmount = parseFloat(discountText.replace('-$', ''));
        } else if (discountText !== '$0.00') {
            discountAmount = parseFloat(discountText.replace('$', ''));
        }
    }
    
    const totalCell = totalsTable.querySelector('tr:last-child td:last-child');
    if (totalCell) {
        const finalTotal = subtotal - discountAmount;
        totalCell.innerHTML = `<strong>$${finalTotal.toFixed(2)}</strong>`;
    }
}

function showEmptyCartMessage() {
    const cartTable = document.querySelector('#cart table');
    if (!cartTable) return;
    
    cartTable.style.display = 'none';
    
    if (!document.querySelector('.cart-empty')) {
        const emptyCartHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any watches to your cart yet.</p>
                <a href="shop.html" class="continue-shopping">Continue Shopping</a>
            </div>
        `;
        
        const cartSection = document.getElementById('cart');
        if (cartSection) {
            cartSection.insertAdjacentHTML('beforeend', emptyCartHTML);
        }
    }

    const cartSummary = document.getElementById('cart-summary');
    if (cartSummary) {
        cartSummary.style.display = 'none';
    }
}

// Apply coupon code
function setupCouponCode() {
    const applyBtn = document.querySelector('.apply-btn');
    const couponInput = document.querySelector('.coupon input');
    
    if (!applyBtn || !couponInput) return;
    
    applyBtn.addEventListener('click', function() {
        const couponCode = couponInput.value.trim().toUpperCase();
        
        if (couponCode === '') {
            showNotification('Please enter a coupon code.');
            return;
        }
        
        const validCoupons = {
            'WATCH10': 10,
            'SAVE20': 20,
            'LUXE30': 30
        };
        
        if (validCoupons[couponCode]) {
            const discount = validCoupons[couponCode];
            applyCouponDiscount(discount);
            showNotification(`Coupon applied! ${discount}% discount added.`);
            
            couponInput.disabled = true;
            applyBtn.disabled = true;
            applyBtn.textContent = 'Applied';
            
            localStorage.setItem('appliedCoupon', couponCode);
        } else {
            showNotification('Invalid coupon code. Please try again.');
            
            couponInput.classList.add('shake');
            setTimeout(() => {
                couponInput.classList.remove('shake');
            }, 500);
        }
    });
    
    const appliedCoupon = localStorage.getItem('appliedCoupon');
    if (appliedCoupon && validCoupons[appliedCoupon]) {
        couponInput.value = appliedCoupon;
        couponInput.disabled = true;
        applyBtn.disabled = true;
        applyBtn.textContent = 'Applied';
        
        applyCouponDiscount(validCoupons[appliedCoupon]);
    }
}

function applyCouponDiscount(discountPercentage) {
    const totalsTable = document.querySelector('.cart-totals table');
    if (!totalsTable) return;
    
    const subtotalCell = totalsTable.querySelector('tr:first-child td:last-child');
    const discountCell = totalsTable.querySelector('tr:nth-child(3) td:last-child');
    const totalCell = totalsTable.querySelector('tr:last-child td:last-child');
    
    if (!subtotalCell || !discountCell || !totalCell) return;
    
    const subtotalText = subtotalCell.textContent.trim();
    const subtotal = parseFloat(subtotalText.replace('$', ''));
    
    if (isNaN(subtotal)) return;
    
    const discountAmount = (subtotal * discountPercentage / 100).toFixed(2);
    
    discountCell.textContent = '-$' + discountAmount;
    discountCell.style.color = '#7d6502';
    
    const finalTotal = (subtotal - parseFloat(discountAmount)).toFixed(2);
    totalCell.innerHTML = `<strong>$${finalTotal}</strong>`;
    
    const discountRow = discountCell.parentElement;
    if (discountRow) {
        discountRow.style.transition = 'background-color 0.3s ease';
        discountRow.style.backgroundColor = 'rgba(125, 101, 2, 0.05)';
    }
    
    if (totalCell) {
        totalCell.style.transition = 'color 0.5s ease';
        totalCell.style.color = '#7d6502';
        
        setTimeout(() => {
            totalCell.style.color = '';
        }, 1500);
    }
}

function setupRelatedProductsCart() {
    const relatedProducts = document.querySelectorAll('#related-products .wch');
    
    relatedProducts.forEach(product => {
        const cartButton = product.querySelector('.cart');
        
        if (cartButton) {
            cartButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                const name = product.querySelector('.dis h5').textContent;
                const price = product.querySelector('.dis h4').textContent;
                const image = product.querySelector('img').src;
                
                addToCart(name, price, image);
                
            
                this.classList.add('added');
                setTimeout(() => {
                    this.classList.remove('added');
                }, 1000);
                
         
                showNotification(`${name} added to cart!`);
            });
        }
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
    
    if (document.getElementById('cart-items')) {
        loadCartFromStorage();
        updateCartTotals();
    }
}


function proceedToCheckout() {
   
    showNotification('Proceeding to checkout...');
    
    setTimeout(() => {
        const cartItems = document.querySelectorAll('#cart-items tr');
        if (cartItems.length === 0) {
            showNotification('Your cart is empty. Please add items before checkout.');
            return;
        }
        
        localStorage.setItem('checkoutInitiated', 'true');
        window.location.href = 'checkout.html'; 
    }, 1000);
}


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
