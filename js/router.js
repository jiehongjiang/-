// ============================================================
// router.js · Hash 路由器
// ============================================================

const routes = new Map();
let currentPath = null;
let guard = null; // 鉴权守卫

export function define(path, handler) {
  routes.set(path, handler);
}

export function setGuard(fn) {
  guard = fn;
}

export function current() {
  return parse(location.hash);
}

function parse(hash) {
  // #/dashboard → /dashboard
  const m = hash.match(/^#?\/?([^\?]*)/);
  const path = '/' + (m ? m[1] : '').replace(/^\/+/, '');
  return path === '/' ? '/login' : path;
}

export function navigate(path) {
  if (!path.startsWith('/')) path = '/' + path;
  location.hash = '#' + path;
}

function resolve() {
  const path = parse(location.hash);

  // 守卫：未登录且非登录页 → 跳登录
  if (guard && !guard(path)) {
    if (path !== '/login') {
      navigate('/login');
    }
    return;
  }

  // 已登录访问 /login → 跳仪表盘
  if (path === '/login' && guard && guard('/dashboard')) {
    navigate('/dashboard');
    return;
  }

  const handler = routes.get(path) || routes.get('/404');
  currentPath = path;
  if (handler) handler({ path });
  else if (routes.has('/login')) routes.get('/login')({ path: '/login' });
}

export function start() {
  window.addEventListener('hashchange', resolve);
  // 首次进入若无 hash，跳到 /login
  if (!location.hash) {
    location.hash = '#/login';
  } else {
    resolve();
  }
}

export function getPath() {
  return currentPath;
}
