// ============================================================
// Topbar.js · 共享顶部导航
// ============================================================

import { session } from '../store.js';
import { navigate } from '../router.js';
import { toast } from './Toast.js';

/**
 * @param {object} opts
 *   - title: 顶栏标题
 *   - crumb: 面包屑（数组，如 ['仪表盘', '产品类型']）
 */
export function renderTopbar(opts = {}) {
  const s = session.get() || { user: 'admin' };
  const initial = (s.user || 'A').slice(0, 1).toUpperCase();
  const crumb = opts.crumb || [];
  const crumbHtml = crumb.length
    ? `<div class="topbar__crumb">
        ${crumb.map((c, i) => i < crumb.length - 1
          ? `<span>${escapeHtml(c)}</span><i data-lucide="chevron-right" class="icon"></i>`
          : `<b>${escapeHtml(c)}</b>`
        ).join('')}
      </div>`
    : '';

  const bar = document.createElement('header');
  bar.className = 'topbar';
  bar.innerHTML = `
    <div class="topbar__brand">
      <div class="topbar__logo"><i data-lucide="boxes" class="icon"></i></div>
      <div class="topbar__title">
        <b>Inventory OS</b>
        <span>出入库管理系统</span>
      </div>
    </div>
    <div class="topbar__nav">
      ${crumbHtml}
      <div class="topbar__user">
        <span class="topbar__user-name">${escapeHtml(s.user || 'admin')}</span>
        <div class="topbar__user-avatar">${initial}</div>
        <button class="topbar__logout" title="退出登录" aria-label="退出登录">
          <i data-lucide="log-out" class="icon"></i>
        </button>
      </div>
    </div>
  `;

  bar.querySelector('.topbar__brand').addEventListener('click', () => navigate('/dashboard'));
  bar.querySelector('.topbar__logout').addEventListener('click', () => {
    session.clear();
    toast('已退出登录', 'info');
    setTimeout(() => navigate('/login'), 200);
  });

  return bar;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
