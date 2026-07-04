// ============================================================
// Modal.js · 模态框
// ============================================================

/**
 * 打开模态框
 * @param {object} opts
 *   - title: 标题
 *   - subtitle: 副标题
 *   - icon: lucide 图标名
 *   - body: HTMLElement | string  内容
 *   - onSubmit: () => boolean|Promise<boolean>  确认回调，返回 false 阻止关闭
 *   - submitText / cancelText
 *   - danger: boolean  确认按钮为危险样式
 */
export function openModal(opts) {
  const root = document.getElementById('modal-root');
  if (!root) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal__head">
        <h3><i data-lucide="${opts.icon || 'square-pen'}" class="icon"></i>${escapeHtml(opts.title || '操作')}</h3>
        ${opts.subtitle ? `<p>${escapeHtml(opts.subtitle)}</p>` : ''}
        <button class="modal__close" aria-label="关闭"><i data-lucide="x" class="icon"></i></button>
      </div>
      <div class="modal__body"></div>
      <div class="modal__foot">
        <button class="btn btn--ghost modal__cancel">${escapeHtml(opts.cancelText || '取消')}</button>
        <button class="btn ${opts.danger ? 'btn--danger' : 'btn--primary'} modal__confirm">
          ${opts.danger ? '' : '<span class="spinner" style="display:none"></span>'}
          ${escapeHtml(opts.submitText || '确认')}
        </button>
      </div>
    </div>
  `;

  const body = overlay.querySelector('.modal__body');
  if (typeof opts.body === 'string') body.innerHTML = opts.body;
  else if (opts.body instanceof HTMLElement) body.appendChild(opts.body);

  root.appendChild(overlay);
  if (window.lucide) window.lucide.createIcons({ root: overlay });

  const close = () => {
    overlay.style.animation = 'fade-in 0.2s reverse both';
    setTimeout(() => overlay.remove(), 180);
  };

  overlay.querySelector('.modal__close').addEventListener('click', close);
  overlay.querySelector('.modal__cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });

  const confirmBtn = overlay.querySelector('.modal__confirm');
  const spinner = confirmBtn.querySelector('.spinner');
  confirmBtn.addEventListener('click', async () => {
    if (opts.onSubmit) {
      confirmBtn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';
      const ok = await opts.onSubmit();
      confirmBtn.disabled = false;
      if (spinner) spinner.style.display = 'none';
      if (ok !== false) close();
    } else {
      close();
    }
  });

  // 自动聚焦第一个输入框
  setTimeout(() => {
    const firstInput = body.querySelector('input, select, textarea');
    if (firstInput) firstInput.focus();
  }, 60);

  return { close, body };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
