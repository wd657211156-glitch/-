let currentCategory = null;

async function loadCategories() {
    const categories = await API.getCategories();
    const nav = document.getElementById("categoryNav");
    if (!nav) return;

    nav.innerHTML = categories.map(c => `
        <div class="category-item" onclick="filterByCategory(${c.id})">
            <div class="category-icon">${c.icon}</div>
            <span class="category-name">${c.name}</span>
        </div>
    `).join("");

    // Also populate section tabs
    const tabs = document.getElementById("sectionTabs");
    if (tabs) {
        tabs.innerHTML = `<button class="section-tab active" onclick="filterByCategory(null)">全部</button>` +
            categories.map(c => `<button class="section-tab" onclick="filterByCategory(${c.id})">${c.name}</button>`).join("");
    }
}

function filterByCategory(categoryId) {
    currentCategory = categoryId;

    // Update active tab
    document.querySelectorAll(".section-tab").forEach(t => {
        t.classList.toggle("active", categoryId === null ? t.textContent === "全部" : false);
    });
    if (categoryId !== null) {
        document.querySelectorAll(".section-tab").forEach(t => {
            t.classList.remove("active");
        });
        const clickedTab = document.querySelector(`.section-tab[onclick*="(${categoryId})"]`);
        if (clickedTab) clickedTab.classList.add("active");
    } else {
        document.querySelector('.section-tab[onclick*="(null)"]')?.classList.add("active");
    }

    renderProducts(categoryId, document.getElementById("searchInput")?.value.trim() || null);
    scrollToProducts();
}

async function renderProducts(categoryId = null, search = null) {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    try {
        const products = await API.getProducts(categoryId, search);
        if (products.length === 0) {
            grid.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-light)">暂无商品</div>`;
            return;
        }

        grid.innerHTML = products.map(p => `
            <div class="product-card">
                <div class="product-img">
                    ${getProductIcon(p.category_id)}
                    ${p.tag ? `<span class="product-tag ${getTagClass(p.tag)}">${getTagLabel(p.tag)}</span>` : ""}
                    <button class="product-wishlist" onclick="toggleWish(this)">&#9825;</button>
                </div>
                <div class="product-info">
                    <div class="product-brand">${p.brand}</div>
                    <div class="product-name">${p.name}</div>
                    <div class="product-price">
                        <span class="price-current">¥${p.price}</span>
                        <span class="price-original">¥${p.original_price}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="handleAddToCart(${p.id})">加入购物车</button>
                        <button class="btn-detail" onclick="window.location.href='product.html?id=${p.id}'">查看详情</button>
                    </div>
                </div>
            </div>
        `).join("");
    } catch (e) {
        grid.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-light)">加载失败，请检查后端服务</div>`;
    }
}

async function handleAddToCart(productId) {
    if (!State.isLoggedIn()) {
        showToast("请先登录");
        setTimeout(() => window.location.href = "login.html", 1500);
        return;
    }
    try {
        await API.addToCart(productId);
        showToast("已加入购物车");
        State.updateCartBadge();
    } catch (e) {
        showToast(e.message || "添加失败");
    }
}

function toggleWish(btn) {
    btn.classList.toggle("liked");
    btn.innerHTML = btn.classList.contains("liked") ? "&#10084;" : "&#9825;";
    showToast(btn.classList.contains("liked") ? "已添加收藏" : "已取消收藏");
}