function initNavbar() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const keyword = this.value.trim();
            if (typeof renderProducts === "function") {
                renderProducts(null, keyword);
            }
        });
    }

    const userBtn = document.getElementById("userBtn");
    if (userBtn) {
        userBtn.addEventListener("click", () => {
            if (State.isLoggedIn()) {
                if (confirm("确定退出登录？")) {
                    State.clearAuth();
                    showToast("已退出登录");
                }
            } else {
                window.location.href = "login.html";
            }
        });
    }

    const cartBtn = document.getElementById("cartBtn");
    if (cartBtn) {
        cartBtn.addEventListener("click", () => {
            if (State.isLoggedIn()) {
                window.location.href = "cart.html";
            } else {
                showToast("请先登录");
                window.location.href = "login.html";
            }
        });
    }

    State.updateNavbar();
}