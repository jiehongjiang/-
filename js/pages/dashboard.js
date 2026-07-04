// ============================================================
// dashboard.js · 仪表盘
// ============================================================

import { stats, session } from '../store.js';
import { navigate } from '../router.js';
import { renderTopbar } from '../components/Topbar.js';

const FUNC_CARDS = [
  { key: 'product-types', title: '产品类型', desc: '管理产品分类与目录', icon: 'tags', color: 'cyan', glow: 'var(--accent-cyan-glow)', bg: 'var(--accent-cyan-soft)', route: '/product-types', enabled: true },
  { key: 'product-info',  title: '产品信息', desc: '维护产品明细与保修', icon: 'package', color: 'cyan', glow: 'var(--accent-cyan-glow)', bg: 'var(--accent-cyan-soft)', route: '/product-info', enabled: true },
  { key: 'inbound',       title: '入库',     desc: '登记新入库的产品',   icon: 'package-plus', color: 'emerald', glow: 'rgba(16, 185, 129, 0.4)', bg: 'var(--accent-emerald-soft)', route: '/inbound', enabled: false },
  { key: 'inbound-list',  title: '入库清单', desc: '查看历史入库记录',   icon: 'clipboard-list', color: 'emerald', glow: 'rgba(16, 185, 129, 0.4)', bg: 'var(--accent-emerald-soft)', route: '/inbound-list', enabled: false },
  { key: 'outbound',      title: '出库',     desc: '登记产品出库领用',   icon: 'package-minus', color: 'rose', glow: 'rgba(244, 63, 94, 0.4)', bg: 'var(--accent-rose-soft)', route: '/outbound', enabled: false },
  { key: 'outbound-list', title: '出库清单', desc: '查看历史出库记录',   icon: 'scroll-text', color: 'amber', glow: 'var(--accent-amber-glow)', bg: 'var(--accent-amber-soft)', route: '/outbound-list', enabled: false },
];

const STAT_CARDS = [
  { key: 'todayIn',   label: '今日入库',   icon: 'arrow-down-to-line', color: 'var(--accent-emerald)', bg: 'var(--accent-emerald-soft)', trend: '+12%', up: true, w: 0.78 },
  { key: 'todayOut',  label: '今日出库',   icon: 'arrow-up-from-line', color: 'var(--accent-rose)',    bg: 'var(--accent-rose-soft)',    trend: '-4%',  up: false, w: 0.45 },
  { key: 'monthIn',   label: '本月入库',   icon: 'layers',             color: 'var(--accent-cyan)',    bg: 'var(--accent-cyan-soft)',    trend: '+23%', up: true, w: 0.86 },
  { key: 'monthOut',  label: '本月出库',   icon: 'ship',               color: 'var(--accent-amber)',   bg: 'var(--accent-amber-soft)',   trend: '+8%',  up: true, w: 0.62 },
];

export function renderDashboard() {
  const app = document.getElementById('app');
  const s = session.get() || { user: 'admin' };
  const data = stats.compute();
  const hour = new Date().getHours();
  const greeting = hour < 6 ? '凌晨好' : hour < 12 ? '上午好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';

  app.innerHTML = '';
  app.appendChild(renderTopbar({ crumb: ['工作台'] }));

  const main = document.createElement('main');
  main.className = 'container dashboard page-enter';
  main.innerHTML = `
    <div class="dashboard__header">
      <div>
        <h1>${greeting}，<span class="grad">${escapeHtml(s.user || 'admin')}</span></h1>
        <p>欢迎回到 Inventory 工作台，今日出入库动态一览无余。</p>
      </div>
      <div class="time-pill">
        <span class="dot"></span>
        <span id="dash-clock">${formatNow()}</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-grid">
      ${STAT_CARDS.map((c) => `
        <div class="stat-card" style="--bar-color:${c.color}; --icon-bg:${c.bg}; --w:${c.w}">
          <div class="stat-card__top">
            <div class="stat-card__icon"><i data-lucide="${c.icon}" class="icon"></i></div>
            <span class="stat-card__trend ${c.up ? 'up' : 'down'}">
              <i data-lucide="${c.up ? 'trending-up' : 'trending-down'}" class="icon"></i>${c.trend}
            </span>
          </div>
          <div class="stat-card__value" data-target="${data[c.key] ?? 0}">0<span class="unit">件</span></div>
          <div class="stat-card__label">${c.label}</div>
          <div class="stat-card__bar"><span></span></div>
        </div>
      `).join('')}
    </div>

    <!-- 功能入口 -->
    <div class="section-title">
      <h2>功能入口</h2>
      <span class="hint">点击卡片进入对应模块</span>
    </div>
    <div class="func-grid">
      ${FUNC_CARDS.map((c) => `
        <div class="func-card ${c.enabled ? '' : 'func-card--disabled'}"
             data-route="${c.route}"
             style="--card-color:${c.color === 'cyan' ? 'var(--accent-cyan)' : c.color === 'emerald' ? 'var(--accent-emerald)' : c.color === 'rose' ? 'var(--accent-rose)' : 'var(--accent-amber)'}; --card-bg:${c.bg}; --card-glow:${c.glow}">
          <div class="func-card__icon"><i data-lucide="${c.icon}" class="icon"></i></div>
          <div class="func-card__body">
            <div class="func-card__title">${c.title}</div>
            <div class="func-card__desc">${c.desc}</div>
          </div>
          <div class="func-card__foot">
            <span>${c.enabled ? '进入' : '<span class="chip-coming">即将开放</span>'}</span>
            <span class="arrow"><i data-lucide="arrow-right" class="icon"></i></span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  app.appendChild(main);
  if (window.lucide) window.lucide.createIcons({ root: app });

  // —— 数字滚动动画 ——
  main.querySelectorAll('.stat-card__value').forEach((el) => {
    const target = Number(el.dataset.target || 0);
    animateNumber(el, target, 1100);
  });

  // —— 时钟 ——
  const clock = document.getElementById('dash-clock');
  if (clock) {
    const tick = () => { clock.textContent = formatNow(); };
    tick();
    const timer = setInterval(tick, 1000);
    // 路由切换时清理（简单处理：页面被替换时 clearInterval 由新渲染接管，这里保留一个全局清理钩子）
    window.__dashTimer && clearInterval(window.__dashTimer);
    window.__dashTimer = timer;
  }

  // —— 功能卡片交互 ——
  main.querySelectorAll('.func-card').forEach((card) => {
    // 鼠标跟随光晕
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
    card.addEventListener('click', () => {
      const route = card.dataset.route;
      const cfg = FUNC_CARDS.find((c) => c.route === route);
      if (cfg && cfg.enabled) navigate(route);
      else navigate(route); // 占位页也会渲染
    });
  });
}

function animateNumber(el, target, duration) {
  const start = performance.now();
  const unit = el.querySelector('.unit');
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.round(target * eased);
    el.firstChild.nodeValue = val;
    if (t < 1) requestAnimationFrame(step);
    else el.firstChild.nodeValue = target;
  };
  requestAnimationFrame(step);
}

function formatNow() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
