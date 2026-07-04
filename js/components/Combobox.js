// ============================================================
// Combobox.js · 可搜索下拉框
// ============================================================

/**
 * 创建可搜索下拉
 * @param {object} opts
 *   - options: [{value, label}]
 *   - value: 当前选中值
 *   - placeholder
 *   - onChange: (value, option) => void
 *   - name: 表单名（用于查询）
 * @returns {HTMLElement} wrapper 元素
 */
export function createCombobox(opts) {
  const { options = [], value, placeholder = '请选择', onChange, name } = opts;

  const wrap = document.createElement('div');
  wrap.className = 'combobox';
  wrap.innerHTML = `
    <div class="combobox__trigger" tabindex="0">
      <span class="combobox__value"></span>
      <i data-lucide="chevrons-up-down" class="chev"></i>
    </div>
    <div class="combobox__panel" style="display:none">
      <div class="combobox__search">
        <i data-lucide="search" class="icon"></i>
        <input type="text" placeholder="搜索..." />
      </div>
      <div class="combobox__list"></div>
    </div>
  `;
  if (name) wrap.dataset.name = name;

  const trigger = wrap.querySelector('.combobox__trigger');
  const valueEl = wrap.querySelector('.combobox__value');
  const panel = wrap.querySelector('.combobox__panel');
  const searchInput = wrap.querySelector('.combobox__search input');
  const listEl = wrap.querySelector('.combobox__list');

  let selected = value ?? null;
  let filtered = [...options];

  function renderValue() {
    const opt = options.find((o) => String(o.value) === String(selected));
    if (opt) {
      valueEl.textContent = opt.label;
      valueEl.classList.remove('placeholder');
    } else {
      valueEl.textContent = placeholder;
      valueEl.classList.add('placeholder');
    }
  }

  function renderList(query = '') {
    const q = query.trim().toLowerCase();
    filtered = options.filter((o) => !q || String(o.label).toLowerCase().includes(q));
    if (!filtered.length) {
      listEl.innerHTML = `<div class="combobox__empty">无匹配项</div>`;
      return;
    }
    listEl.innerHTML = filtered.map((o) => `
      <div class="combobox__option ${String(o.value) === String(selected) ? 'selected' : ''}" data-value="${escapeAttr(o.value)}">
        <span>${escapeHtml(o.label)}</span>
        <i data-lucide="check" class="check"></i>
      </div>
    `).join('');
    if (window.lucide) window.lucide.createIcons({ root: listEl });

    listEl.querySelectorAll('.combobox__option').forEach((el) => {
      el.addEventListener('click', () => {
        selected = el.dataset.value;
        renderValue();
        close();
        if (onChange) onChange(selected, options.find((o) => String(o.value) === String(selected)));
      });
    });
  }

  function open() {
    wrap.classList.add('open');
    panel.style.display = 'block';
    searchInput.value = '';
    renderList('');
    setTimeout(() => searchInput.focus(), 30);
    document.addEventListener('click', outsideClose);
  }
  function close() {
    wrap.classList.remove('open');
    panel.style.display = 'none';
    document.removeEventListener('click', outsideClose);
  }
  function outsideClose(e) {
    if (!wrap.contains(e.target)) close();
  }

  trigger.addEventListener('click', () => {
    if (wrap.classList.contains('open')) close();
    else open();
  });
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
  searchInput.addEventListener('input', () => renderList(searchInput.value));
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  renderValue();
  if (window.lucide) window.lucide.createIcons({ root: wrap });

  wrap.getValue = () => selected;
  wrap.setOptions = (newOptions) => {
    options.length = 0;
    options.push(...newOptions);
    renderValue();
  };
  wrap.setValue = (v) => { selected = v; renderValue(); };

  return wrap;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;');
}
