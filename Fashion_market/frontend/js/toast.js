function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    document.getElementById("toastMsg").textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

function scrollToProducts() {
    const section = document.getElementById("productsSection");
    if (section) section.scrollIntoView({ behavior: "smooth" });
}

const CATEGORY_ICONS = {
    1: "\u{1F457}",
    2: "\u{1F454}",
    3: "\u{1F456}",
    4: "\u{1F458}",
    5: "\u{1F484}",
};

function getProductIcon(categoryId) {
    return CATEGORY_ICONS[categoryId] || "\u{1F457}";
}

function getTagLabel(tag) {
    if (!tag) return "";
    return tag === "new" ? "新品" : tag === "hot" ? "热销" : tag === "sale" ? "特惠" : "";
}

function getTagClass(tag) {
    if (!tag) return "";
    return tag;
}