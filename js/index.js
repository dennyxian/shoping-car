let cart = [];
let selectedPayment = '';

// 頁面切換
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// 初始化商品顯示
function initProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(product => `
                <div class="product-card">
                    <div class="product-image">
                    ${product.emoji.startsWith('./img/') ? `<img src="${product.emoji}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: contain;">` : product.emoji}
                    </div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">NT$ ${product.price.toLocaleString()}</div>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        加入購物車
                    </button>
                </div>
            `).join('');
}

// 添加商品到購物車
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            quantity: 1
        });
    }

    updateCartUI();
    showNotification(`${product.name} 已加入購物車`);
}

// 更新購物車UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const totalAmount = document.getElementById('totalAmount');

    // 更新購物車數量
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = itemCount;
    // 根據數量決定是否顯示購物車數量標籤
    if (itemCount > 0) {
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }


    // 更新購物車內容
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">購物車是空的</div>';
    } else {
        cartItems.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-thumb">
      ${typeof item.emoji === 'string' && item.emoji.startsWith('./img/')
                ? `<img src="${item.emoji}" alt="${item.name}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;">`
                : item.emoji}
    </div>
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">NT$ ${item.price.toLocaleString()}</div>
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                                <button class="remove-item" onclick="removeFromCart(${item.id})">移除</button>
                            </div>
                        </div>
                    </div>
                `).join('');
    }

    // 更新總金額
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = total.toLocaleString();
}

// 改變商品數量
function changeQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartUI();
        }
    }
}

// 從購物車移除商品
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

// 切換購物車顯示
function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

// 前往結帳頁面
function goToCheckout() {
    if (cart.length === 0) {
        showNotification('購物車是空的！', 'error');
        return;
    }

    toggleCart();
    showPage('checkout');
    updateCheckoutPage();
}

// 更新結帳頁面
function updateCheckoutPage() {
    const orderItems = document.getElementById('orderItems');
    const subtotal = document.getElementById('subtotal');
    const shipping = document.getElementById('shipping');
    const finalTotal = document.getElementById('finalTotal');

    // 顯示訂單項目
    orderItems.innerHTML = cart.map(item => `
                <div class="order-item">
                    <div class="order-item-info">
                       <div class="cart-item-thumb">
      ${typeof item.emoji === 'string' && item.emoji.startsWith('./img/')
            ? `<img src="${item.emoji}" alt="${item.name}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;">`
            : item.emoji}
    </div>
                        <div class="order-item-details">
                            <div class="order-item-name">${item.name}</div>
                            <div class="order-item-quantity">數量: ${item.quantity}</div>
                        </div>
                    </div>
                    <div class="order-item-price">NT$ ${(item.price * item.quantity).toLocaleString()}</div>
                </div>
            `).join('');

    // 計算金額
    const subtotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingAmount = 100;
    const totalAmount = subtotalAmount + shippingAmount;

    subtotal.textContent = `NT$ ${subtotalAmount.toLocaleString()}`;
    shipping.textContent = `NT$ ${shippingAmount.toLocaleString()}`;
    finalTotal.textContent = `NT$ ${totalAmount.toLocaleString()}`;
}

// 選擇付款方式
function selectPayment(paymentType) {
    selectedPayment = paymentType;

    // 更新選中狀態
    const options = document.querySelectorAll('.payment-option');
    options.forEach(option => option.classList.remove('selected'));

    const selectedOption = document.querySelector(`#${paymentType}`).closest('.payment-option');
    selectedOption.classList.add('selected');

    // 選中對應的radio button
    document.getElementById(paymentType).checked = true;

    // 更新下單按鈕
    const placeOrderBtn = document.querySelector('.place-order-btn');
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = '確認下單';
}

// 下單
function placeOrder() {
    if (!selectedPayment) {
        showNotification('請選擇付款方式！', 'error');
        return;
    }

    const subtotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = subtotalAmount + 100;
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    const paymentNames = {
        'credit': '信用卡付款',
        'atm': 'ATM轉帳',
        'convenience': '超商付款',
        'line': 'LINE Pay',
        'apple': 'Apple Pay'
    };

    if (confirm(`確定要下單嗎？\n\n訂單資訊：\n商品數量: ${itemCount}\n付款方式: ${paymentNames[selectedPayment]}\n總金額: NT$ ${totalAmount.toLocaleString()}`)) {
        // 模擬訂單處理
        showNotification('正在處理您的訂單...', 'success');

        setTimeout(() => {
            const orderNumber = 'ORD' + Date.now().toString().slice(-8);
            cart = [];
            selectedPayment = '';
            updateCartUI();
            showPage('home');

            // 重置付款選擇
            const options = document.querySelectorAll('.payment-option');
            options.forEach(option => option.classList.remove('selected'));
            const radios = document.querySelectorAll('input[name="payment"]');
            radios.forEach(radio => radio.checked = false);
            const placeOrderBtn = document.querySelector('.place-order-btn');
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = '請選擇付款方式';

            showNotification(`訂單 ${orderNumber} 已成功建立！感謝您的購買！`, 'success');
        }, 1500);
    }
}

// 顯示通知訊息
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 點擊模態框外部關閉
document.getElementById('cartModal').addEventListener('click', function (e) {
    if (e.target === this) {
        toggleCart();
    }
});

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', function () {
    initProducts();
    updateCartUI();
});