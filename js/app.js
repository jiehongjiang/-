// ============================================================
// app.js · 应用入口
// ============================================================

import { initStore, session } from './store.js';
import { define, setGuard, start, navigate } from './router.js';
import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderProductTypes } from './pages/productTypes.js';
import { renderProductInfo } from './pages/productInfo.js';
import { renderPlaceholder } from './pages/placeholder.js';

// —— 初始化数据 ——
initStore();

// —— 路由守卫：除登录页外都需登录 ——
setGuard((path) => {
  if (path === '/login') return true;
  return session.isLoggedIn();
});

// —— 注册路由 ——
define('/login',           () => renderLogin());
define('/dashboard',       () => renderDashboard());
define('/product-types',   () => renderProductTypes());
define('/product-info',    () => renderProductInfo());
define('/inbound',         () => renderPlaceholder('/inbound'));
define('/inbound-list',    () => renderPlaceholder('/inbound-list'));
define('/outbound',        () => renderPlaceholder('/outbound'));
define('/outbound-list',   () => renderPlaceholder('/outbound-list'));

// —— 启动 ——
start();

// —— 自定义光标 ——
initCursor();

// —— 清理上一个页面的定时器（路由切换时） ——
window.addEventListener('hashchange', () => {
  if (window.__dashTimer) { clearInterval(window.__dashTimer); window.__dashTimer = null; }
});

function initCursor() {
  const dot = document.querySelector('.cursor-dot');
  if (!dot) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let x = 0, y = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });
  const loop = () => {
    cx += (x - cx) * 0.18;
    cy += (y - cy) * 0.18;
    dot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();

  // 悬停可点击元素时放大
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('button, a, input, .func-card, .combobox__trigger, .login__captcha-wrap, .row-actions .icon-btn')) {
      dot.style.width = '24px'; dot.style.height = '24px';
      dot.style.background = 'transparent';
      dot.style.border = '1px solid var(--accent-cyan)';
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('button, a, input, .func-card, .combobox__trigger, .login__captcha-wrap, .row-actions .icon-btn')) {
      dot.style.width = '8px'; dot.style.height = '8px';
      dot.style.background = 'var(--accent-cyan)';
      dot.style.border = 'none';
    }
  });
}
