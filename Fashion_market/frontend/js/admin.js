let adminTab = "products";

function switchAdminTab(tab) {
    adminTab = tab;
    document.querySelectorAll(".admin-tab").forEach(t => {
        t.classList.toggle("active", t.dataset.tab === tab);
    });
    document.getElementById("productSection").style.display = tab === "products" ? "block" : "none";
    document.getElementById("userSection").style.display = tab === "users" ? "block" : "none";

    if (tab === "products") loadAdminProducts();
    if (tab === "users") loadAdminUsers();
}

// ========== Product Management ==========

async function loadAdminProducts() {
    try {
        const products = await API.getAdminProducts();
        const tbody = document.getElementById("productTableBody");
        tbody.innerHTML = products.map(p => `
            <tr>
                <td>${getProductIcon(p.category_id)}</td>
                <td>${p.name}</td>
                <td>${p.brand}</td>
                <td>¥${p.price}</td>
                <td>¥${p.original_price}</td>
                <td>${p.stock}</td>
                <td><span class="status-badge ${p.is_active ? 'active' : 'inactive'}">${p.is_active ? '上架' : '下架'}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-sm edit" onclick="openEditProductModal(${p.id})">编辑</button>
                        ${p.is_active
                            ? `<button class="btn-sm warning" onclick="toggleProduct(${p.id}, false)">下架</button>`
                            : `<button class="btn-sm success" onclick="toggleProduct(${p.id}, true)">上架</button>`}
                        <button class="btn-sm danger" onclick="deleteProduct(${p.id})">删除</button>
                    </div>
                </td>
            </tr>
        `).join("");
    } catch (e) {
        showToast(e.message);
    }
}

async function toggleProduct(id, isActive) {
    try {
        await API.adminToggleProductStatus(id, isActive);
        showToast(isActive ? "已上架" : "已下架");
        loadAdminProducts();
    } catch (e) {
        showToast(e.message);
    }
}

async function deleteProduct(id) {
    if (!confirm("确定删除该商品？")) return;
    try {
        await API.adminDeleteProduct(id);
        showToast("已删除");
        loadAdminProducts();
    } catch (e) {
        showToast(e.message);
    }
}

function openAddProductModal() {
    document.getElementById("modalTitle").textContent = "新增商品";
    document.getElementById("modalProductForm").reset();
    document.getElementById("modalProductId").value = "";
    document.getElementById("modalError").textContent = "";
    document.getElementById("modalOverlay").classList.add("open");
}

async function openEditProductModal(id) {
    try {
        const products = await API.getAdminProducts();
        const p = products.find(x => x.id === id);
        if (!p) return;

        document.getElementById("modalTitle").textContent = "编辑商品";
        document.getElementById("modalProductId").value = id;
        document.getElementById("modalProductName").value = p.name;
        document.getElementById("modalProductBrand").value = p.brand;
        document.getElementById("modalProductPrice").value = p.price;
        document.getElementById("modalProductOriginalPrice").value = p.original_price;
        document.getElementById("modalProductCategoryId").value = p.category_id;
        document.getElementById("modalProductStock").value = p.stock;
        document.getElementById("modalProductTag").value = p.tag || "";
        document.getElementById("modalProductDesc").value = p.description || "";
        document.getElementById("modalError").textContent = "";
        document.getElementById("modalOverlay").classList.add("open");
    } catch (e) {
        showToast(e.message);
    }
}

function closeModal() {
    document.getElementById("modalOverlay").classList.remove("open");
}

async function handleProductModal() {
    const id = document.getElementById("modalProductId").value;
    const data = {
        name: document.getElementById("modalProductName").value.trim(),
        brand: document.getElementById("modalProductBrand").value.trim(),
        price: parseFloat(document.getElementById("modalProductPrice").value),
        original_price: parseFloat(document.getElementById("modalProductOriginalPrice").value),
        category_id: parseInt(document.getElementById("modalProductCategoryId").value),
        stock: parseInt(document.getElementById("modalProductStock").value),
        tag: document.getElementById("modalProductTag").value.trim() || null,
        description: document.getElementById("modalProductDesc").value.trim() || null,
    };

    const errorEl = document.getElementById("modalError");

    if (!data.name || !data.brand || !data.price || !data.original_price || !data.category_id) {
        errorEl.textContent = "请填写所有必填字段";
        return;
    }

    try {
        if (id) {
            await API.adminUpdateProduct(parseInt(id), data);
            showToast("商品已更新");
        } else {
            await API.adminCreateProduct(data);
            showToast("商品已创建");
        }
        closeModal();
        loadAdminProducts();
    } catch (e) {
        errorEl.textContent = e.message;
    }
}

// ========== User Management (super_admin only) ==========

let adminConfig = {};

async function loadAdminUsers() {
    if (!State.isSuperAdmin()) {
        document.getElementById("userSection").innerHTML = '<p style="text-align:center;color:var(--text-light)">仅超级管理员可管理用户</p>';
        return;
    }

    try {
        const users = await API.getAdminUsers();
        adminConfig = await API.getAdminConfig();

        // Config bar
        const adminCount = users.filter(u => u.role === "admin").length;
        document.getElementById("configBar").innerHTML = `
            <div style="display:flex;align-items:center;gap:8px">
                <span class="config-label">管理员上限</span>
                <span class="config-value">${adminConfig.admin_max_count}</span>
                <span style="font-size:14px;color:var(--text-light)">当前 ${adminCount} / ${adminConfig.admin_max_count}</span>
            </div>
            <div class="config-actions">
                <input type="number" class="config-input" id="newMaxInput" min="1" max="100" value="${adminConfig.admin_max_count}">
                <button class="btn-sm add" onclick="updateMaxCount()">更新上限</button>
                <button class="btn-sm add" onclick="openAddAdminModal()">新增管理员</button>
            </div>
        `;

        // User table
        const tbody = document.getElementById("userTableBody");
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td><span class="role-badge ${u.role}">${u.role === 'super_admin' ? '超级管理员' : '管理员'}</span></td>
                <td>${u.phone || '-'}</td>
                <td>
                    ${u.role === 'super_admin' ? '-' : `
                    <div class="action-btns">
                        <button class="btn-sm danger" onclick="deleteAdminUser(${u.id})">删除</button>
                    </div>`}
                </td>
            </tr>
        `).join("");
    } catch (e) {
        showToast(e.message);
    }
}

async function updateMaxCount() {
    const newMax = parseInt(document.getElementById("newMaxInput").value);
    if (newMax < 1) {
        showToast("上限不能小于1");
        return;
    }
    try {
        await API.updateAdminConfig({ admin_max_count: newMax });
        showToast("上限已更新为 " + newMax);
        loadAdminUsers();
    } catch (e) {
        showToast(e.message);
    }
}

function openAddAdminModal() {
    document.getElementById("adminModalTitle").textContent = "新增管理员";
    document.getElementById("adminModalForm").reset();
    document.getElementById("adminModalError").textContent = "";
    document.getElementById("adminModalOverlay").classList.add("open");
}

function closeAdminModal() {
    document.getElementById("adminModalOverlay").classList.remove("open");
}

async function handleAdminModal() {
    const data = {
        username: document.getElementById("adminModalUsername").value.trim(),
        email: document.getElementById("adminModalEmail").value.trim(),
        password: document.getElementById("adminModalPassword").value.trim(),
        role: "admin",
    };
    const errorEl = document.getElementById("adminModalError");

    if (!data.username || !data.email || !data.password) {
        errorEl.textContent = "请填写所有字段";
        return;
    }
    if (data.password.length < 6) {
        errorEl.textContent = "密码至少6个字符";
        return;
    }

    try {
        await API.createAdminUser(data);
        showToast("管理员已创建");
        closeAdminModal();
        loadAdminUsers();
    } catch (e) {
        let msg = e.message;
        if (msg.includes("管理员数量已达上限")) msg = "管理员数量已达上限，无法继续添加";
        errorEl.textContent = msg;
    }
}

async function deleteAdminUser(id) {
    if (!confirm("确定删除该管理员？")) return;
    try {
        await API.deleteAdminUser(id);
        showToast("已删除");
        loadAdminUsers();
    } catch (e) {
        showToast(e.message);
    }
}

// ========== Init ==========

function initAdminPage() {
    if (!State.isAdmin()) {
        showToast("权限不足，请以管理员身份登录");
        setTimeout(() => window.location.href = "login.html", 1500);
        return;
    }

    // Hide user tab for non-super_admin
    const userTab = document.querySelector('.admin-tab[data-tab="users"]');
    if (userTab && !State.isSuperAdmin()) {
        userTab.style.display = "none";
    }

    loadAdminProducts();
}