// ============================================================
// productInfo.js · 产品信息管理（类型联动可搜索下拉）
// ============================================================

import { products, types } from '../store.js';
import { renderTopbar } from '../components/Topbar.js';
import { openModal } from '../components/Modal.js';
import { createCombobox } from '../components/Combobox.js';
import { toast } from '../components/Toast.js';
import { navigate } from '../router.js';

let searchTerm = '';

export function renderProductInfo() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.appendChild(renderTopbar({ crumb: ['工作台', '产品信息'] }));

  const main = document.createElement('main');
  main.className = 'container data-page page-enter';
  main.innerHTML = `
    <a class="back-link" data-route="/dashboard"><i data-lucide="arrow-left" class="icon"></i>返回工作台</a>

    <div class="data-page__toolbar">
      <div class="data-page__title">
        <h1>
          <span class="ico"><i data-lucide="package" class="icon"></i></span>
          产品信息管理
        </h1>
        <p>维护产品明细，类型字段联动产品类型数据，支持搜索与增删改。</p>
      </div>
      <div class="data-page__tools">
        <div class="data-page__search">
          <i data-lucide="search" class="icon"></i>
          <input type="text" id="pi-search" placeholder="搜索产品名称 / 类型..." value="${escapeAttr(searchTerm)}" />
        </div>
        <button class="btn btn--primary" id="pi-add">
          <i data-lucide="plus" class="icon"></i>添加产品
        </button>
      </div>
    </div>

    <div class="table-wrap">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-id">ID</th>
              <th>类型</th>
              <th>产品名称</th>
              <th>保修期限</th>
              <th class="col-time">添加时间</th>
              <th>功能</th>
            </tr>
          </thead>
          <tbody id="pi-body"></tbody>
        </table>
      </div>
      <div class="table-foot">
        <div class="table-foot__total">
          <span class="label">数量合计</span>
          <b id="pi-total">0</b>
          <span>条记录</span>
        </div>
        <div class="table-foot__legend">
          <span><i style="background:var(--accent-cyan)"></i>类型</span>
          <span><i style="background:var(--accent-amber)"></i>保修</span>
        </div>
      </div>
    </div>
  `;

  app.appendChild(main);
  if (window.lucide) window.lucide.createIcons({ root: app });

  main.querySelector('.back-link').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/dashboard');
  });
  main.querySelector('#pi-add').addEventListener('click', () => openAddModal());
  main.querySelector('#pi-search').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderRows();
  });

  renderRows();
}

function renderRows() {
  const tbody = document.getElementById('pi-body');
  const totalEl = document.getElementById('pi-total');
  if (!tbody) return;

  const all = products.all();
  const q = searchTerm.trim().toLowerCase();
  const list = q
    ? all.filter((p) => {
        const typeName = types.nameOf(p.typeId);
        return p.name.toLowerCase().includes(q) || typeName.toLowerCase().includes(q);
      })
    : all;

  if (!list.length) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="table-empty">
          <div class="ico"><i data-lucide="package-search" class="icon"></i></div>
          <h3>${all.length ? '未匹配到产品' : '暂无产品信息'}</h3>
          <p>${all.length ? '试试更换关键词' : '点击右上角"添加产品"开始创建'}</p>
        </div>
      </td></tr>
    `;
  } else {
    tbody.innerHTML = list.map((p) => `
      <tr data-id="${p.id}">
        <td class="col-id">#${String(p.id).padStart(3, '0')}</td>
        <td><span class="col-type-tag"><i data-lucide="tag" style="width:12px;height:12px"></i>${escapeHtml(types.nameOf(p.typeId))}</span></td>
        <td class="col-name">${escapeHtml(p.name)}</td>
        <td class="col-warranty">${escapeHtml(p.warranty)}</td>
        <td class="col-time">${escapeHtml(p.createdAt)}</td>
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

// —— 类型下拉选项（实时联动产品类型数据） ——
function typeOptions() {
  return types.all().map((t) => ({ value: String(t.id), label: t.name }));
}

// —— 添加 ——
function openAddModal() {
  const opts = typeOptions();
  if (!opts.length) {
    toast('请先在「产品类型」中添加至少一个分类', 'warn');
    return;
  }

  const body = document.createElement('div');
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.gap = '16px';
  body.innerHTML = `
    <div class="field">
      <label class="field-label">产品类型 <span style="color:var(--accent-cyan)">(联动)</span></label>
      <div id="pi-combo"></div>
    </div>
    <div class="field">
      <label class="field-label">产品名称</label>
      <input class="input" id="pi-name" type="text" placeholder="例如：ThinkPad X1 Carbon Gen11" maxlength="60" />
    </div>
    <div class="field">
      <label class="field-label">保修期限</label>
      <input class="input" id="pi-warranty" type="text" placeholder="例如：36个月" maxlength="20" value="12个月" />
    </div>
    <div style="font-size:12px;color:var(--text-muted);display:flex;gap:6px;align-items:flex-start">
      <i data-lucide="link" style="width:14px;height:14px;margin-top:1px;flex-shrink:0"></i>
      <span>类型下拉自动同步「产品类型」模块数据，可输入关键字搜索。</span>
    </div>
  `;

  const combo = createCombobox({
    options: opts,
    placeholder: '请选择产品类型',
    name: 'typeId',
  });
  body.querySelector('#pi-combo').appendChild(combo);

  openModal({
    title: '添加产品信息',
    subtitle: '录入一条新的产品明细',
    icon: 'package-plus',
    body,
    submitText: '创建',
    onSubmit: () => {
      const typeId = combo.getValue();
      const name = body.querySelector('#pi-name').value.trim();
      const warranty = body.querySelector('#pi-warranty').value.trim();
      if (!typeId) { toast('请选择产品类型', 'warn'); return false; }
      if (!name) { toast('请输入产品名称', 'warn'); return false; }
      if (!warranty) { toast('请输入保修期限', 'warn'); return false; }
      products.add({ typeId, name, warranty });
      toast('产品已添加', 'success');
      renderRows();
    },
  });

  if (window.lucide) window.lucide.createIcons({ root: body });
}

// —— 修改 ——
function openEditModal(id) {
  const item = products.all().find((p) => p.id === id);
  if (!item) return;
  const opts = typeOptions();
  if (!opts.length) { toast('请先在「产品类型」中添加分类', 'warn'); return; }

  const body = document.createElement('div');
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.gap = '16px';
  body.innerHTML = `
    <div class="field">
      <label class="field-label">产品类型</label>
      <div id="pi-combo"></div>
    </div>
    <div class="field">
      <label class="field-label">产品名称</label>
      <input class="input" id="pi-name" type="text" value="${escapeAttr(item.name)}" maxlength="60" />
    </div>
    <div class="field">
      <label class="field-label">保修期限</label>
      <input class="input" id="pi-warranty" type="text" value="${escapeAttr(item.warranty)}" maxlength="20" />
    </div>
  `;

  const combo = createCombobox({
    options: opts,
    value: String(item.typeId),
    placeholder: '请选择产品类型',
    name: 'typeId',
  });
  body.querySelector('#pi-combo').appendChild(combo);

  openModal({
    title: '修改产品信息',
    subtitle: `编辑 #${String(item.id).padStart(3, '0')}`,
    icon: 'pencil',
    body,
    submitText: '保存',
    onSubmit: () => {
      const typeId = combo.getValue();
      const name = body.querySelector('#pi-name').value.trim();
      const warranty = body.querySelector('#pi-warranty').value.trim();
      if (!typeId) { toast('请选择产品类型', 'warn'); return false; }
      if (!name) { toast('请输入产品名称', 'warn'); return false; }
      if (!warranty) { toast('请输入保修期限', 'warn'); return false; }
      products.update(id, { typeId, name, warranty });
      toast('已保存修改', 'success');
      renderRows();
    },
  });
}

// —— 删除 ——
function openDeleteModal(id) {
  const item = products.all().find((p) => p.id === id);
  if (!item) return;

  const body = document.createElement('div');
  body.innerHTML = `
    <div style="display:flex;gap:14px;align-items:flex-start;padding:4px 0">
      <div style="width:44px;height:44px;border-radius:11px;display:grid;place-items:center;background:var(--accent-rose-soft);color:var(--accent-rose);flex-shrink:0">
        <i data-lucide="alert-triangle" style="width:22px;height:22px"></i>
      </div>
      <div>
        <div style="font-weight:600;margin-bottom:4px">确定删除「${escapeHtml(item.name)}」？</div>
        <div style="font-size:12.5px;color:var(--text-tertiary);line-height:1.5">删除后无法恢复，该产品记录将永久移除。</div>
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
      products.remove(id);
      toast('产品已删除', 'success');
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
