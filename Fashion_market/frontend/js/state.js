const State = {
    user: null,
    token: localStorage.getItem("token"),
    cartCount: 0,

    init() {
        if (this.token) {
            const userData = localStorage.getItem("user");
            if (userData) {
                this.user = JSON.parse(userData);
            }
        }
        this.updateCartBadge();
    },

    isLoggedIn() {
        return !!this.token;
    },

    isAdmin() {
        return this.user && (this.user.role === "admin" || this.user.role === "super_admin");
    },

    isSuperAdmin() {
        return this.user && this.user.role === "super_admin";
    },

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        this.updateNavbar();
    },

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.updateNavbar();
    },

    updateCartBadge() {
        const badge = document.getElementById("cartCount");
        if (!badge) return;
        if (this.isLoggedIn()) {
            API.getCart().then(cart => {
                const count = cart.items.reduce((s, i) => s + i.quantity, 0);
                badge.textContent = count;
                this.cartCount = count;
            }).catch(() => {
                badge.textContent = "0";
            });
        } else {
            badge.textContent = "0";
        }
    },

    updateNavbar() {
        const userBtn = document.getElementById("userBtn");
        const adminLink = document.getElementById("adminLink");
        if (!userBtn) return;

        if (this.isLoggedIn()) {
            const roleLabel = this.isSuperAdmin() ? "超级管理员" : this.isAdmin() ? "管理员" : this.user.username;
            userBtn.innerHTML = `<span style="font-size:14px">&#128100;</span>`;
            userBtn.title = `已登录：${this.user.username}（${roleLabel}）`;

            if (adminLink) {
                adminLink.style.display = this.isAdmin() ? "inline-block" : "none";
            }
        } else {
            userBtn.innerHTML = `<span style="font-size:14px">&#128100;</span>`;
            userBtn.title = "登录/注册";
            if (adminLink) adminLink.style.display = "none";
        }
    },
};