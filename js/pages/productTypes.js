// ============================================================
// productTypes.js · 产品类型管理（增删改 + 合计）
// ============================================================

import { types } from '../store.js';
import { renderTopbar } from '../components/Topbar.js';
import { openModal } from '../components/Modal.js';
import { toast } from '../components/Toast.js';
import { navigate } from '../router.js';

let searchTerm = '';

export function renderProductTypes() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(renderTopbar({ crumb: ['工作台', '产品类型'] }));

  const main = document.createElement('main');
  main.className = 'container data-page page-enter';
  main.innerHTML = `
    <a class="back-link" data-route="/dashboard"><i data-lucide="arrow-left" class="icon"></i>返回工作台</a>

    <div class="data-page__toolbar">
      <div class="data-page__title">
        <h1>
          <span class="ico"><i data-lucide="tags" class="icon"></i></span>
          产品类型管理
        </h1>
        <p>维护电脑产品的分类目录，支持新增、修改与删除。</p>
      </div>
      <div class="data-page__tools">
        <div class="data-page__search">
          <i data-lucide="search" class="icon"></i>
          <input type="text" id="pt-search" placeholder="搜索类型名称..." value="${escapeAttr(searchTerm)}" />
        </div>
        <button class="btn btn--primary" id="pt-add">
          <i data-lucide="plus" class="icon"></i>添加类型
        </button>
      </div>
    </div>

    <div class="table-wrap">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-id">ID</th>
              <th>产品类型</th>
              <th class="col-time">添加时间</th>
              <th>功能</th>
            </tr>
          </thead>
          <tbody id="pt-body"></tbody>
        </table>
      </div>
      <div class="table-foot">
        <div class="table-foot__total">
          <span class="label">数量合计</span>
          <b id="pt-total">0</b>
          <span>个分类</span>
        </div>
        <div class="table-foot__legend">
          <span><i style="background:var(--accent-cyan)"></i>类型</span>
          <span><i style="background:var(--text-muted)"></i>已存档</span>
        </div>
      </div>
    </div>
  `;

  app.appendChild(main);
  if (window.lucide) window.lucide.createIcons({ root: app });

  // —— 事件绑定 ——
  main.querySelector('.back-link').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/dashboard');
  });
  main.querySelector('#pt-add').addEventListener('click', () => openAddModal());
  main.querySelector('#pt-search').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderRows();
  });

  renderRows();
}

function renderRows() {
  const tbody = document.getElementById('pt-body');
  const totalEl = document.getElementById('pt-total');
  if (!tbody) return;

  const all = types.all();
  const q = searchTerm.trim().toLowerCase();
  const list = q ? all.filter((t) => t.name.toLowerCase().includes(q)) : all;

  if (!list.length) {
    tbody.innerHTML = `
      <tr><td colspan="4">
        <div class="table-empty">
          <div class="ico"><i data-lucide="inbox" class="icon"></i></div>
          <h3>${all.length ? '未匹配到类型' : '暂无产品类型'}</h3>
          <p>${all.length ? '试试更换关键词' : '点击右上角"添加类型"开始创建'}</p>
        </div>
      </td></tr>
    `;
  } else {
    tbody.innerHTML = list.map((t) => `
      <tr data-id="${t.id}">
        <td class="col-id">#${String(t.id).padStart(3, '0')}</td>
        <td class="col-name">${escapeHtml(t.name)}</td>
        <td class="col-time">${escapeHtml(t.createdAt)}</td>
        <td>
          <div class="row-actions">
            <button class="icon-btn edit" data-act="edit" title="修改"><i data-lucide="pencil" class="icon"></i></button>
            <button class="icon-btn del" data-act="del" title="删除"><i data-lucide="trash-2" class="icon"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('tr[data-id]').forEach((tr) => {
      const id = Number(tr.dataset.id);
      tr.querySelector('[data-act="edit"]').addEventListener('click', () => openEditModal(id));
      tr.querySelector('[data-act="del"]').addEventListener('click', () => openDeleteModal(id));
    });
  }

  totalEl.textContent = all.length;
  if (window.lucide) window.lucide.createIcons({ root: tbody });
}

// —— 添加 ——
function openAddModal() {
  const body = document.createElement('div');
  body.innerHTML = `
    <div class="field">
      <label class="field-label">类型名称</label>
      <input class="input" id="pt-name" type="text" placeholder="例如：笔记本电脑" maxlength="30" />
    </div>
    <div style="font-size:12px;color:var(--text-muted);display:flex;gap:6px;align-items:flex-start">
      <i data-lucide="info" style="width:14px;height:14px;margin-top:1px;flex-shrink:0"></i>
      <span>类型名称将用于产品信息页的联动下拉选项。</span>
    </div>
  `;

  openModal({
    title: '添加产品类型',
    subtitle: '创建一个新的产品分类',
    icon: 'tag-plus',
    body,
    submitText: '创建',
    onSubmit: () => {
      const name = body.querySelector('#pt-name').value.trim();
      if (!name) { toast('请输入类型名称', 'warn'); return false; }
      if (types.all().some((t) => t.name === name)) { toast('该类型已存在', 'warn'); return false; }
      types.add(name);
      toast('类型已添加', 'success');
      renderRows();
    },
  });

  if (window.lucide) window.lucide.createIcons({ root: body });
}

// —— 修改 ——
function openEditModal(id) {
  const item = types.all().find((t) => t.id === id);
  if (!item) return;

  const body = document.createElement('div');
  body.innerHTML = `
    <div class="field">
      <label class="field-label">类型名称</label>
      <input class="input" id="pt-name" type="text" value="${escapeAttr(item.name)}" maxlength="30" />
    </div>
  `;

  openModal({
    title: '修改产品类型',
    subtitle: `编辑 #${String(item.id).padStart(3, '0')} 的信息`,
    icon: 'pencil',
    body,
    submitText: '保存',
    onSubmit: () => {
      const name = body.querySelector('#pt-name').value.trim();
      if (!name) { toast('请输入类型名称', 'warn'); return false; }
      if (name !== item.name && types.all().some((t) => t.name === name)) {
        toast('该类型已存在', 'warn'); return false;
      }
      types.update(id, name);
      toast('已保存修改', 'success');
      renderRows();
    },
  });
}

// —— 删除 ——
function openDeleteModal(id) {
  const item = types.all().find((t) => t.id === id);
  if (!item) return;

  const body = document.createElement('div');
  body.innerHTML = `
    <div style="display:flex;gap:14px;align-items:flex-start;padding:4px 0">
      <div style="width:44px;height:44px;border-radius:11px;display:grid;place-items:center;background:var(--accent-rose-soft);color:var(--accent-rose);flex-shrink:0">
        <i data-lucide="alert-triangle" style="width:22px;height:22px"></i>
      </div>
      <div>
        <div style="font-weight:600;margin-bottom:4px">确定删除「${escapeHtml(item.name)}」？</div>
        <div style="font-size:12.5px;color:var(--text-tertiary);line-height:1.5">删除后无法恢复，关联的产品信息将保留但类型显示为「—」。</div>
      </div>
    </div>
  `;

  openModal({
    title: '删除确认',
    icon: 'trash-2',
    body,
    danger: true,
    submitText: '确认删除',
    onSubmit: () => {
      types.remove(id);
      toast('类型已删除', 'success');
      renderRows();
    },
  });

  if (window.lucide) window.lucide.createIcons({ root: body });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;');
}
