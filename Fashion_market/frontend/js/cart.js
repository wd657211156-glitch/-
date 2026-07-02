async function loadCart() {
    if (!State.isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    try {
        const cart = await API.getCart();
        renderCartPage(cart);
    } catch (e) {
        showToast(e.message || "加载购物车失败");
    }
}

function renderCartPage(cart) {
    const body = document.getElementById("cartBody");
    const summary = document.getElementById("cartSummary");

    if (cart.items.length === 0) {
        body.innerHTML = `
            <div class="cart-empty-state">
                <div class="cart-empty-icon">&#128722;</div>
                <div class="cart-empty-text">购物车还是空的哦</div>
                <p style="color:var(--text-light);font-size:14px">去挑选心仪的单品吧~</p>
                <button class="btn-primary" onclick="window.location.href='index.html'" style="margin-top:16px">逛逛商城</button>
            </div>`;
        summary.style.display = "none";
        return;
    }

    body.innerHTML = `<table class="cart-table">
        <thead>
            <tr>
                <th>商品</th>
                <th>名称</th>
                <th>单价</th>
                <th>数量</th>
                <th>小计</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
            ${cart.items.map(item => `
                <tr>
                    <td><div class="cart-table-img">${getProductIcon(item.product_id)}</div></td>
                    <td>
                        <div class="cart-item-name">${item.product_name}</div>
                        <div class="cart-item-brand">${item.product_brand}</div>
                    </td>
                    <td class="cart-item-price">¥${item.product_price}</td>
                    <td>
                        <div class="qty-control">
                            <button class="qty-btn" onclick="changeQty(${item.id}, ${item.quantity - 1})">-</button>
                            <span class="qty-num">${item.quantity}</span>
                            <button class="qty-btn" onclick="changeQty(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                    </td>
                    <td class="cart-item-price">¥${(item.product_price * item.quantity).toFixed(0)}</td>
                    <td><button class="cart-item-remove" onclick="removeItem(${item.id})">&#10005;</button></td>
                </tr>
            `).join("")}
        </tbody>
    </table>`;

    summary.style.display = "flex";
    document.getElementById("cartTotal").textContent = `¥${cart.total.toFixed(0)}`;
}

async function changeQty(cartItemId, newQty) {
    if (newQty <= 0) {
        removeItem(cartItemId);
        return;
    }
    try {
        await API.updateCart(cartItemId, newQty);
        loadCart();
        State.updateCartBadge();
    } catch (e) {
        showToast(e.message);
    }
}

async function removeItem(cartItemId) {
    try {
        await API.removeCart(cartItemId);
        loadCart();
        State.updateCartBadge();
        showToast("已删除");
    } catch (e) {
        showToast(e.message);
    }
}