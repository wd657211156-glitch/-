const API_BASE = "http://localhost:8000";

async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } catch (networkErr) {
        throw new Error("无法连接服务器，请确认后端已启动（http://localhost:8000）");
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || "请求失败");
    }
    return res.json();
}

const API = {
    // Auth
    register: (data) => apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data) => apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),

    // Products
    getProducts: (categoryId = null, search = null) => {
        const params = new URLSearchParams();
        if (categoryId) params.set("category_id", categoryId);
        if (search) params.set("search", search);
        return apiFetch(`/api/products/?${params}`);
    },
    getProduct: (id) => apiFetch(`/api/products/${id}`),

    // Categories
    getCategories: () => apiFetch("/api/products/categories/"),

    // Cart
    getCart: () => apiFetch("/api/cart/"),
    addToCart: (productId, quantity = 1) =>
        apiFetch("/api/cart/add", { method: "POST", body: JSON.stringify({ product_id: productId, quantity }) }),
    updateCart: (cartItemId, quantity) =>
        apiFetch("/api/cart/update", { method: "PUT", body: JSON.stringify({ cart_item_id: cartItemId, quantity }) }),
    removeCart: (cartItemId) =>
        apiFetch(`/api/cart/remove/${cartItemId}`, { method: "DELETE" }),

    // Admin - User Management (super_admin only)
    getAdminUsers: () => apiFetch("/api/admin/users"),
    createAdminUser: (data) => apiFetch("/api/admin/users", { method: "POST", body: JSON.stringify(data) }),
    updateAdminUser: (id, data) => apiFetch(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteAdminUser: (id) => apiFetch(`/api/admin/users/${id}`, { method: "DELETE" }),
    getAdminConfig: () => apiFetch("/api/admin/config"),
    updateAdminConfig: (data) => apiFetch("/api/admin/config", { method: "PUT", body: JSON.stringify(data) }),

    // Admin - Product Management (admin + super_admin)
    getAdminProducts: () => apiFetch("/api/admin/products"),
    adminCreateProduct: (data) => apiFetch("/api/admin/products", { method: "POST", body: JSON.stringify(data) }),
    adminUpdateProduct: (id, data) => apiFetch(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    adminDeleteProduct: (id) => apiFetch(`/api/admin/products/${id}`, { method: "DELETE" }),
    adminToggleProductStatus: (id, isActive) =>
        apiFetch(`/api/admin/products/${id}/status`, { method: "PUT", body: JSON.stringify({ is_active: isActive }) }),
};