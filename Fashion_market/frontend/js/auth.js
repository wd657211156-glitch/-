let authMode = "login";

function switchAuth(mode) {
    authMode = mode;
    document.querySelectorAll(".auth-tab").forEach(t => {
        t.classList.toggle("active", t.dataset.mode === mode);
    });

    const registerFields = document.getElementById("registerFields");
    registerFields.style.display = mode === "register" ? "block" : "none";

    document.getElementById("authSubmitBtn").textContent = mode === "login" ? "登 录" : "注 册";
    const switchEl = document.getElementById("authSwitch");
    if (mode === "login") {
        switchEl.innerHTML = '还没有账号？<a href="#" onclick="switchAuth(\'register\'); return false;" id="authSwitchLink">注册新账号</a>';
    } else {
        switchEl.innerHTML = '已有账号，<a href="#" onclick="switchAuth(\'login\'); return false;" id="authSwitchLink">去登录</a>';
    }
    clearAllErrors();
}

function clearAllErrors() {
    const errorEl = document.getElementById("authError");
    errorEl.textContent = "";
    errorEl.classList.remove("show");

    document.querySelectorAll(".auth-field input").forEach(inp => inp.classList.remove("input-error"));
    document.querySelectorAll(".auth-field .field-error").forEach(el => {
        el.textContent = "";
        el.classList.remove("show");
    });
}

function showFieldError(fieldId, msg) {
    const input = document.getElementById(fieldId);
    const error = input.parentElement.querySelector(".field-error");
    if (input) input.classList.add("input-error");
    if (error) {
        error.textContent = msg;
        error.classList.add("show");
    }
}

function showGlobalError(msg) {
    const errorEl = document.getElementById("authError");
    errorEl.innerHTML = `<span class="auth-error-icon">&#9888;</span>${msg}`;
    errorEl.classList.add("show");
}

function validateForm() {
    clearAllErrors();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    let valid = true;

    if (!username) {
        showFieldError("username", "用户名不能为空");
        valid = false;
    } else if (username.length < 2) {
        showFieldError("username", "用户名至少2个字符");
        valid = false;
    } else if (username.length > 20) {
        showFieldError("username", "用户名不能超过20个字符");
        valid = false;
    }

    if (!password) {
        showFieldError("password", "密码不能为空");
        valid = false;
    } else if (password.length < 6) {
        showFieldError("password", "密码至少6个字符");
        valid = false;
    }

    if (authMode === "register") {
        const email = document.getElementById("email").value.trim();
        if (!email) {
            showFieldError("email", "邮箱不能为空");
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldError("email", "请输入有效的邮箱地址");
            valid = false;
        }
    }

    return valid;
}

async function handleAuth() {
    if (!validateForm()) return;

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        let result;
        if (authMode === "login") {
            result = await API.login({ username, password });
        } else {
            const email = document.getElementById("email").value.trim();
            result = await API.register({ username, email, password });
        }

        State.setAuth(result.access_token, result.user);
        showToast(authMode === "login" ? "登录成功" : "注册成功");
        setTimeout(() => window.location.href = "index.html", 1500);
    } catch (e) {
        let msg = e.message || "操作失败，请稍后再试";

        // Map common backend errors to clearer Chinese messages
        if (msg.includes("用户名已存在")) msg = "该用户名已被注册，请换一个";
        if (msg.includes("邮箱已被注册")) msg = "该邮箱已被注册，请换一个";
        if (msg.includes("用户名或密码错误")) msg = "用户名或密码不正确，请重新输入";
        if (msg.includes("token 无效") || msg.includes("未登录")) msg = "认证失败，请重新登录";

        showGlobalError(msg);
    }
}