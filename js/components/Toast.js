// ============================================================
// Toast.js · 轻提示
// ============================================================

const ICONS = {
  success: 'check-circle-2',
  error: 'x-circle',
  warn: 'alert-triangle',
  info: 'info',
};

export function toast(message, type = 'info', duration = 2600) {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `
    <i data-lucide="${ICONS[type] || ICONS.info}" class="icon"></i>
    <span>${escapeHtml(message)}</span>
  `;
  stack.appendChild(el);
  if (window.lucide) window.lucide.createIcons({ root: el });

  const remove = () => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 320);
  };
  const timer = setTimeout(remove, duration);
  el.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
