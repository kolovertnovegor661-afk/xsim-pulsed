// assets/app.js

const STORAGE_KEY = 'hg_digital_user';

function loadUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function generateVisualNumber() {
  const part = () => Math.floor(100 + Math.random() * 900);
  return `+9 ${part()} ${part()} ${part()}`;
}

function generateIMEI() {
  const hex = () => Math.floor(Math.random() * 16).toString(16).toUpperCase();
  return `${hex()}${hex()}${hex()}${hex()}-${hex()}${hex()}${hex()}${hex()}-${hex()}${hex()}${hex()}${hex()}-${hex()}${hex()}${hex()}${hex()}`;
}

function generateProto() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 12; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

const PLANS = [
  { id: 'lite', name: 'Digital SIM Lite', gb: 5, minutes: 100 },
  { id: 'pro', name: 'Digital SIM Pro', gb: 25, minutes: 500 },
  { id: 'anon', name: 'Anonymous Mode', gb: 10, minutes: 200 }
];

// --- index: регистрация ---
document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('register-form');
  if (regForm) {
    const user = loadUser();
    if (user) {
      document.getElementById('reg-result').style.display = 'block';
      regForm.style.display = 'none';
    }

    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(regForm);
      const name = formData.get('name') || 'User';
      const email = formData.get('email') || '';

      const user = {
        name,
        email,
        number: generateVisualNumber(),
        imei: generateIMEI(),
        proto: generateProto(),
        gb: 0,
        minutes: 0,
        planId: null
      };
      saveUser(user);
      regForm.style.display = 'none';
      document.getElementById('reg-result').style.display = 'block';
    });
  }

  // buy: вывод пакетов
  const plansContainer = document.getElementById('plans');
  if (plansContainer) {
    const user = loadUser();
    if (!user) {
      plansContainer.innerHTML = `
        <div class="card">
          <p class="muted">Сначала создай аккаунт.</p>
          <a href="index.html" class="button secondary">Перейти к регистрации</a>
        </div>`;
      return;
    }

    PLANS.forEach(plan => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <h2>${plan.name}</h2>
        <p class="muted">${plan.gb} ГБ • ${plan.minutes} минут</p>
        <button class="button" data-plan="${plan.id}">Купить (условно)</button>
      `;
      plansContainer.appendChild(div);
    });

    plansContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-plan]');
      if (!btn) return;
      const planId = btn.dataset.plan;
      const plan = PLANS.find(p => p.id === planId);
      if (!plan) return;

      const user = loadUser();
      if (!user) return;

      user.gb += plan.gb;
      user.minutes += plan.minutes;
      user.planId = plan.id;
      saveUser(user);
      btn.textContent = 'Добавлено в кабинет';
    });
  }

  // dashboard: личный кабинет
  const dash = document.getElementById('dash-main');
  if (dash) {
    const user = loadUser();
    if (!user) {
      dash.innerHTML = `
        <h1>Нет активной цифровой SIM</h1>
        <p class="muted">Создай аккаунт и купи пакет, чтобы увидеть кабинет.</p>
        <a href="index.html" class="button secondary">Перейти к регистрации</a>
      `;
      return;
    }

    const plan = PLANS.find(p => p.id === user.planId);
    dash.innerHTML = `
      <h1>Личный кабинет</h1>
      <p class="muted">Цифровая SIM активна в этом браузере.</p>

      <div class="card" style="margin-top:16px;">
        <h2>${user.number}</h2>
        <p class="muted">IMEI: ${user.imei}</p>
        <p class="muted">PROTO: ${user.proto}</p>
      </div>

      <div class="card" style="margin-top:16px;display:flex;gap:16px;flex-wrap:wrap;">
        <div>
          <p class="muted">Гигабайты</p>
          <h2>${user.gb} ГБ</h2>
        </div>
        <div>
          <p class="muted">Минуты</p>
          <h2>${user.minutes}</h2>
        </div>
        <div>
          <p class="muted">Тариф</p>
          <h2>${plan ? plan.name : 'Не выбран'}</h2>
        </div>
      </div>

      <a href="buy.html" class="button secondary" style="margin-top:16px;">Докупить пакет</a>
    `;
  }

  // admin: дамп localStorage
  const adminDump = document.getElementById('admin-dump');
  if (adminDump) {
    adminDump.textContent = JSON.stringify(loadUser(), null, 2);
  }
});

function scrollToReg() {
  const el = document.getElementById('reg-card');
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth' });
}