// ============================================================
// placeholder.js · 占位页（入库/出库/清单）
// ============================================================

import { renderTopbar } from '../components/Topbar.js';
import { navigate } from '../router.js';

const META = {
  '/inbound':       { title: '入库',       desc: '登记新入库的电脑产品，记录数量、来源与入库时间。', icon: 'package-plus',     crumb: ['工作台', '入库'] },
  '/inbound-list':  { title: '入库清单',   desc: '按时间倒序查看所有入库记录，支持按类型与日期筛选。', icon: 'clipboard-list',   crumb: ['工作台', '入库清单'] },
  '/outbound':      { title: '出库',       desc: '登记产品出库领用，关联领用人与用途。',            icon: 'package-minus',    crumb: ['工作台', '出库'] },
  '/outbound-list': { title: '出库清单',   desc: '查看历史出库记录与去向统计。',                    icon: 'scroll-text',      crumb: ['工作台', '出库清单'] },
};

export function renderPlaceholder(path) {
  const meta = META[path] || { title: '页面', desc: '该页面正在建设中。', icon: 'construction', crumb: ['工作台', '页面'] };
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(renderTopbar({ crumb: meta.crumb }));

  const main = document.createElement('main');
  main.className = 'container page-enter';
  main.innerHTML = `
    <a class="back-link" data-route="/dashboard"><i data-lucide="arrow-left" class="icon"></i>返回工作台</a>
    <div class="placeholder">
      <div class="placeholder__card">
        <span class="placeholder__chip"><i data-lucide="hammer" style="width:12px;height:12px"></i>Coming Soon</span>
        <div class="placeholder__icon"><i data-lucide="${meta.icon}" class="icon"></i></div>
        <h2>${escapeHtml(meta.title)} · 建设中</h2>
        <p>${escapeHtml(meta.desc)}<br>该模块将在后续版本迭代中开放，敬请期待。</p>
        <button class="btn btn--ghost" id="ph-back">
          <i data-lucide="arrow-left" class="icon"></i>返回工作台
        </button>
      </div>
    </div>
  `;

  app.appendChild(main);
  if (window.lucide) window.lucide.createIcons({ root: app });

  main.querySelectorAll('[data-route="/dashboard"], #ph-back').forEach((el) => {
    el.addEventListener('click', (e) => { e.preventDefault(); navigate('/dashboard'); });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
