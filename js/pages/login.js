// ============================================================
// login.js · 登录页
// ============================================================

import { captchaUrl, login } from '../api.js';
import { session } from '../store.js';
import { navigate } from '../router.js';
import { toast } from '../components/Toast.js';

export function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <main class="login page-enter">
      <div class="login__card">
        <!-- 品牌区 -->
        <aside class="login__brand">
          <div class="login__brand-inner">
            <div class="login__logo">
              <div class="login__logo-mark"><i data-lucide="boxes"></i></div>
              <b>Inventory OS</b>
            </div>
            <div class="login__hero">
              <h1>电脑产品<br><span class="grad">出入库工作台</span></h1>
              <p>Neo-Tech 风格的现代化资产管理系统，让每一次入库出库都精准可追溯。</p>
            </div>
            <div class="login__features">
              <div class="login__feature"><span class="dot"></span>实时统计 · 今日 / 本月出入库一览</div>
              <div class="login__feature"><span class="dot"></span>类型联动 · 产品信息智能下拉搜索</div>
              <div class="login__feature"><span class="dot"></span>本地持久化 · 数据安全留存于浏览器</div>
            </div>
          </div>
        </aside>

        <!-- 表单区 -->
        <section class="login__form-side">
          <div class="login__form-head">
            <h2>欢迎回来</h2>
            <p>请输入账号密码与验证码登录系统</p>
          </div>
          <form class="login__form" id="login-form" autocomplete="off">
            <div class="field">
              <label class="field-label">账号</label>
              <div class="login__field">
                <input class="input" type="text" name="admin" placeholder="请输入账号" required />
                <i data-lucide="user" class="icon-lead"></i>
              </div>
            </div>

            <div class="field">
              <label class="field-label">密码</label>
              <div class="login__field">
                <input class="input" type="password" name="pass" placeholder="请输入密码" required />
                <i data-lucide="lock" class="icon-lead"></i>
                <button type="button" class="login__toggle-pw" aria-label="显示/隐藏密码">
                  <i data-lucide="eye"></i>
                </button>
              </div>
            </div>

            <div class="field">
              <label class="field-label">验证码</label>
              <div class="login__captcha-row">
                <div class="login__field" style="flex:1">
                  <input class="input" type="text" name="code" placeholder="请输入验证码" maxlength="6" required />
                  <i data-lucide="shield-check" class="icon-lead"></i>
                </div>
                <div class="login__captcha-wrap" title="点击刷新验证码">
                  <img class="login__captcha-img" id="captcha-img" alt="验证码" />
                  <div class="login__captcha-refresh"><i data-lucide="refresh-cw" style="width:16px;height:16px"></i></div>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn--primary btn--block login__submit" id="login-btn">
              <i data-lucide="log-in" class="icon"></i>
              <span class="spinner" style="display:none"></span>
              <span class="btn-text">登录</span>
            </button>

            <div class="login__hint">
              <i data-lucide="info"></i>
              <span>预览模式：因 CORS 限制外部登录会降级为 Mock 验证，可直接点击登录体验（或使用 admin / 123456）。</span>
            </div>
          </form>
        </section>
      </div>
    </main>
  `;

  if (window.lucide) window.lucide.createIcons({ root: app });

  // —— 验证码刷新 ——
  const captchaImg = document.getElementById('captcha-img');
  const refreshCaptcha = () => { captchaImg.src = captchaUrl(); };
  refreshCaptcha();
  captchaImg.addEventListener('click', refreshCaptcha);
  document.querySelector('.login__captcha-wrap').addEventListener('click', (e) => {
    if (e.target === captchaImg) return; // 已绑定
    refreshCaptcha();
  });

  // —— 密码显隐 ——
  const pwInput = app.querySelector('input[name="pass"]');
  const pwToggle = app.querySelector('.login__toggle-pw');
  let pwVisible = false;
  pwToggle.addEventListener('click', () => {
    pwVisible = !pwVisible;
    pwInput.type = pwVisible ? 'text' : 'password';
    pwToggle.innerHTML = `<i data-lucide="${pwVisible ? 'eye-off' : 'eye'}" class="icon"></i>`;
    if (window.lucide) window.lucide.createIcons({ root: pwToggle });
  });

  // —— 表单提交 ——
  const form = document.getElementById('login-form');
  const btn = document.getElementById('login-btn');
  const btnText = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.spinner');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = {
      admin: data.get('admin').trim(),
      pass: data.get('pass').trim(),
      code: data.get('code').trim(),
    };
    if (!payload.admin || !payload.pass || !payload.code) {
      toast('请填写完整登录信息', 'warn');
      return;
    }

    btn.disabled = true;
    btnText.textContent = '登录中';
    spinner.style.display = 'inline-block';

    const res = await login(payload);

    btn.disabled = false;
    btnText.textContent = '登录';
    spinner.style.display = 'none';

    if (res.ok) {
      session.set(res.user);
      toast(res.mock ? '登录成功（预览模式）' : '登录成功，欢迎回来', 'success');
      setTimeout(() => navigate('/dashboard'), 360);
    } else {
      toast(res.error || '登录失败', 'error');
      refreshCaptcha();
    }
  });
}
