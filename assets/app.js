const STORAGE_KEY = "hg_digital_user";
const THEME_KEY = "hg_digital_theme";

const ADMIN_LOGIN = "dev";
const ADMIN_PASS = "220512";
const ADMIN_EMAIL = "dev123123@gmail.com";

function loadUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function logout() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = "index.html";
}

function isAdmin(user) {
  return !!(user && user.admin === true);
}

function generateRFNumber() {
  const codes = ["900", "901", "902", "903", "904", "905", "906", "909", "910", "911", "912", "913", "914", "915", "916", "917", "918", "919"];
  const code = codes[Math.floor(Math.random() * codes.length)];
  const rest = () => Math.floor(100 + Math.random() * 900);
  return `+7 ${code} ${rest()}-${rest()}`;
}

function generateIMEI() {
  const hex = () => Math.floor(Math.random() * 16).toString(16).toUpperCase();
  return `${hex()}${hex()}${hex()}${hex()}-${hex()}${hex()}${hex()}${hex()}-${hex()}${hex()}${hex()}${hex()}-${hex()}${hex()}${hex()}${hex()}`;
}

function generateProto() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 12; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

// 50+ тарифов
const PLANS = [];
(function buildPlans() {
  const base = [
    { name: "Lite", gb: 5, min: 100, price: 99 },
    { name: "Start", gb: 10, min: 200, price: 149 },
    { name: "Smart", gb: 20, min: 400, price: 199 },
    { name: "Pro", gb: 35, min: 700, price: 249 },
    { name: "Ultra", gb: 50, min: 1000, price: 299 }
  ];
  let id = 1;
  for (let i = 0; i < base.length; i++) {
    for (let k = 0; k < 10; k++) {
      PLANS.push({
        id: `p${id++}`,
        name: `${base[i].name} ${k + 1}`,
        gb: base[i].gb + k * 2,
        minutes: base[i].min + k * 50,
        price: base[i].price + k * 20
      });
    }
  }
})();

// Тема
function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(saved);
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = document.body.getAttribute("data-theme") || "light";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }
  const settingsToggle = document.getElementById("settings-theme-toggle");
  if (settingsToggle) {
    settingsToggle.addEventListener("click", () => {
      const current = document.body.getAttribute("data-theme") || "light";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }
}

// Регистрация
function initRegister() {
  const form = document.getElementById("register-form");
  if (!form) return;

  const user = loadUser();
  if (user && !user.admin) {
    form.classList.add("hidden");
    document.getElementById("reg-result").classList.remove("hidden");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = fd.get("name") || "User";
    const email = fd.get("email") || "";

    const user = {
      name,
      email,
      number: generateRFNumber(),
      imei: generateIMEI(),
      proto: generateProto(),
      gb: 0,
      minutes: 0,
      planId: null,
      balance: 0,
      admin: false
    };
    saveUser(user);
    form.classList.add("hidden");
    document.getElementById("reg-result").classList.remove("hidden");
  });
}

function scrollToReg() {
  const el = document.getElementById("reg-card");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth" });
}
window.scrollToReg = scrollToReg;

// Логин админа
function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const login = fd.get("login");
    const pass = fd.get("pass");
    const email = fd.get("email");

    if (login === ADMIN_LOGIN && pass === ADMIN_PASS && email === ADMIN_EMAIL) {
      const adminUser = {
        name: ADMIN_LOGIN,
        email: ADMIN_EMAIL,
        number: generateRFNumber(),
        imei: generateIMEI(),
        proto: generateProto(),
        gb: 100,
        minutes: 5000,
        planId: null,
        balance: 10000,
        admin: true
      };
      saveUser(adminUser);
      window.location.href = "admin.html";
    } else {
      document.getElementById("login-error").classList.remove("hidden");
    }
  });
}

// Тарифы
function initPlans() {
  const container = document.getElementById("plans");
  if (!container) return;

  const user = loadUser();
  if (!user) {
    container.innerHTML = `
      <div class="card">
        <p class="muted">Сначала создай аккаунт.</p>
        <a href="index.html" class="button secondary mt">Перейти к регистрации</a>
      </div>`;
    return;
  }

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
  grid.style.gap = "12px";

  PLANS.forEach(plan => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h2>${plan.name}</h2>
      <p class="muted">${plan.gb} ГБ • ${plan.minutes} минут</p>
      <p class="muted">Цена: ${plan.price}₽</p>
      <button class="button pulse" data-plan="${plan.id}">Подключить</button>
    `;
    grid.appendChild(div);
  });

  container.appendChild(grid);

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-plan]");
    if (!btn) return;
    const planId = btn.dataset.plan;
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return;

    const user = loadUser();
    if (!user) return;

    if (user.balance < plan.price) {
      btn.textContent = "Недостаточно баланса";
      setTimeout(() => (btn.textContent = "Подключить"), 1500);
      return;
    }

    user.balance -= plan.price;
    user.gb += plan.gb;
    user.minutes += plan.minutes;
    user.planId = plan.id;
    saveUser(user);

    btn.textContent = "Подключено";
    setTimeout(() => (btn.textContent = "Подключить"), 1500);
  });
}

// РФ номера
function initRFNumbers() {
  const list = document.getElementById("rf-list");
  if (!list) return;

  const user = loadUser();
  if (!user) {
    list.innerHTML = `<p class="muted">Сначала создай аккаунт.</p>`;
    return;
  }

  function render() {
    list.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const num = generateRFNumber();
      const div = document.createElement("div");
      div.className = "rf-item";
      div.textContent = num;
      div.addEventListener("click", () => {
        user.number = num;
        saveUser(user);
        document.querySelectorAll(".rf-item").forEach(el => el.classList.remove("active"));
        div.classList.add("active");
      });
      if (num === user.number) div.classList.add("active");
      list.appendChild(div);
    }
  }

  render();

  const refresh = document.getElementById("rf-refresh");
  if (refresh) {
    refresh.addEventListener("click", () => {
      render();
    });
  }
}

// Кабинет
function initDashboard() {
  const dash = document.getElementById("dash-main");
  if (!dash) return;

  const user = loadUser();
  if (!user || user.admin) {
    dash.innerHTML = `
      <h1>Нет пользовательского профиля</h1>
      <p class="muted">Создай обычный аккаунт, чтобы увидеть кабинет.</p>
      <a href="index.html" class="button secondary mt">Перейти к регистрации</a>
    `;
    return;
  }

  const plan = PLANS.find(p => p.id === user.planId);

  dash.innerHTML = `
    <h1>Личный кабинет</h1>
    <p class="muted">Профиль активен в этом браузере.</p>

    <div class="card mt">
      <h2>${user.number}</h2>
      <p class="muted">IMEI: ${user.imei}</p>
      <p class="muted">PROTO: ${user.proto}</p>
    </div>

    <div class="card mt" style="display:flex;flex-wrap:wrap;gap:16px;">
      <div>
        <p class="muted">Гигабайты</p>
        <h2>${user.gb} ГБ</h2>
      </div>
      <div>
        <p class="muted">Минуты</p>
        <h2>${user.minutes}</h2>
      </div>
      <div>
        <p class="muted">Баланс</p>
        <h2>${user.balance}₽</h2>
      </div>
      <div>
        <p class="muted">Тариф</p>
        <h2>${plan ? plan.name : "Не выбран"}</h2>
      </div>
    </div>

    <a href="buy.html" class="button secondary mt">Подключить или изменить тариф</a>
  `;

  // автозаполнение формы подключения
  const connectForm = document.getElementById("connect-form");
  if (connectForm) {
    connectForm.elements["imei"].value = user.imei;
    connectForm.elements["proto"].value = user.proto;
    connectForm.elements["number"].value = user.number;

    connectForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = document.getElementById("connect-status");
      status.classList.remove("hidden");
      setTimeout(() => {
        status.innerHTML = `<div class="loader"></div><p>Подключено</p>`;
        setTimeout(() => {
          status.classList.add("hidden");
          status.innerHTML = `<div class="loader"></div><p>Идёт подключение...</p>`;
        }, 1500);
      }, 1200);
    });
  }
}

// Админ
function initAdmin() {
  const panel = document.getElementById("admin-panel");
  if (!panel) return;

  const user = loadUser();
  if (!user || !isAdmin(user)) {
    panel.innerHTML = `
      <h1>Нет доступа</h1>
      <p class="muted">Войдите как администратор.</p>
      <a href="login.html" class="button secondary mt">Перейти к входу</a>
    `;
    return;
  }

  panel.innerHTML = `
    <h1>Админ‑панель</h1>
    <p class="muted">Локальное управление текущим профилем.</p>

    <div class="card mt">
      <h2>Профиль</h2>
      <p>Номер: ${user.number}</p>
      <p>IMEI: ${user.imei}</p>
      <p>PROTO: ${user.proto}</p>
      <p>ГБ: ${user.gb}</p>
      <p>Минуты: ${user.minutes}</p>
      <p>Баланс: ${user.balance}₽</p>
    </div>

    <div class="card mt">
      <h2>Управление балансом</h2>
      <button class="button" id="admin-add-balance">Пополнить баланс</button>
      <button class="button secondary mt" id="admin-give-gb">Выдать 50 ГБ</button>
      <button class="button secondary mt" id="admin-give-min">Выдать 1000 минут</button>
    </div>

    <button class="button secondary mt" onclick="logout()">Выйти</button>
  `;

  document.getElementById("admin-add-balance").addEventListener("click", () => {
    const amount = Number(prompt("Сумма пополнения, ₽:"));
    if (!amount) return;
    user.balance += amount;
    saveUser(user);
    location.reload();
  });

  document.getElementById("admin-give-gb").addEventListener("click", () => {
    user.gb += 50;
    saveUser(user);
    location.reload();
  });

  document.getElementById("admin-give-min").addEventListener("click", () => {
    user.minutes += 1000;
    saveUser(user);
    location.reload();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initRegister();
  initLogin();
  initPlans();
  initRFNumbers();
  initDashboard();
  initAdmin();
});