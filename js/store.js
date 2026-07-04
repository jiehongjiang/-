// ============================================================
// store.js · localStorage 数据层 + 种子数据 + CRUD
// ============================================================

const KEYS = {
  session: 'inventory_session',
  types: 'inventory_types',
  products: 'inventory_products',
  inbound: 'inventory_inbound',
  outbound: 'inventory_outbound',
};

const SEED_TYPES = [
  { id: 1, name: '笔记本电脑', createdAt: '2026-06-15 10:30' },
  { id: 2, name: '台式主机',   createdAt: '2026-06-16 14:20' },
  { id: 3, name: '显示器',     createdAt: '2026-06-18 09:15' },
  { id: 4, name: '键鼠套装',   createdAt: '2026-06-20 16:45' },
  { id: 5, name: '打印机',     createdAt: '2026-06-22 11:00' },
  { id: 6, name: '网络设备',   createdAt: '2026-06-25 13:40' },
];

const SEED_PRODUCTS = [
  { id: 1, typeId: 1, name: 'ThinkPad X1 Carbon Gen11', warranty: '36个月', createdAt: '2026-06-15 10:35' },
  { id: 2, typeId: 1, name: 'MacBook Pro 14 M3 Pro',     warranty: '12个月', createdAt: '2026-06-15 11:00' },
  { id: 3, typeId: 1, name: 'Dell XPS 15 9530',          warranty: '24个月', createdAt: '2026-06-17 09:48' },
  { id: 4, typeId: 2, name: 'Dell OptiPlex 7010 SFF',    warranty: '36个月', createdAt: '2026-06-16 14:30' },
  { id: 5, typeId: 2, name: 'HP EliteDesk 800 G9',       warranty: '36个月', createdAt: '2026-06-19 10:12' },
  { id: 6, typeId: 3, name: 'Dell U2723QE 27寸 4K',      warranty: '36个月', createdAt: '2026-06-18 09:20' },
  { id: 7, typeId: 3, name: 'LG 27UP850-W 4K',           warranty: '24个月', createdAt: '2026-06-21 15:05' },
  { id: 8, typeId: 4, name: 'Logitech MX Keys S',        warranty: '12个月', createdAt: '2026-06-20 16:50' },
  { id: 9, typeId: 4, name: 'Keychron K8 Pro',           warranty: '12个月', createdAt: '2026-06-23 11:30' },
  { id: 10, typeId: 5, name: 'HP LaserJet Pro M404',     warranty: '12个月', createdAt: '2026-06-22 11:10' },
  { id: 11, typeId: 6, name: 'Cisco Catalyst 2960-X',    warranty: '60个月', createdAt: '2026-06-25 13:50' },
  { id: 12, typeId: 6, name: 'Ubiquiti UniFi Switch 24', warranty: '24个月', createdAt: '2026-06-28 09:25' },
];

// —— 内部读写 ——
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

// —— 初始化种子数据 ——
export function initStore() {
  if (!localStorage.getItem(KEYS.types)) write(KEYS.types, SEED_TYPES);
  if (!localStorage.getItem(KEYS.products)) write(KEYS.products, SEED_PRODUCTS);
  if (!localStorage.getItem(KEYS.inbound)) write(KEYS.inbound, buildMockInbound());
  if (!localStorage.getItem(KEYS.outbound)) write(KEYS.outbound, buildMockOutbound());
}

// 生成出入库 mock 记录（用于统计）
function buildMockInbound() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const rec = (daysAgo, qty, productId, typeName) => {
    const d = new Date(now.getTime() - daysAgo * 86400000);
    return {
      id: daysAgo + 1000,
      productId, typeName,
      qty,
      date: d.toISOString().slice(0, 10),
      datetime: d.toISOString().slice(0, 16).replace('T', ' '),
    };
  };
  return [
    rec(0, 5, 1, '笔记本电脑'),
    rec(0, 3, 6, '显示器'),
    rec(1, 2, 4, '台式主机'),
    rec(2, 8, 8, '键鼠套装'),
    rec(5, 4, 10, '打印机'),
    rec(12, 6, 11, '网络设备'),
    rec(20, 10, 2, '笔记本电脑'),
  ];
}
function buildMockOutbound() {
  const now = new Date();
  const rec = (daysAgo, qty, productId, typeName) => {
    const d = new Date(now.getTime() - daysAgo * 86400000);
    return {
      id: daysAgo + 2000,
      productId, typeName,
      qty,
      date: d.toISOString().slice(0, 10),
      datetime: d.toISOString().slice(0, 16).replace('T', ' '),
    };
  };
  return [
    { ...rec(0, 2, 1, '笔记本电脑'), id: 2001 },
    { ...rec(0, 1, 7, '显示器'), id: 2002 },
    { ...rec(3, 3, 9, '键鼠套装'), id: 2003 },
    { ...rec(8, 2, 5, '台式主机'), id: 2004 },
    { ...rec(15, 4, 12, '网络设备'), id: 2005 },
  ];
}

// ============================================================
// 会话
// ============================================================
export const session = {
  get() { return read(KEYS.session, null); },
  set(user) {
    return write(KEYS.session, { loggedIn: true, user, loginAt: Date.now() });
  },
  clear() { localStorage.removeItem(KEYS.session); },
  isLoggedIn() {
    const s = read(KEYS.session, null);
    return !!(s && s.loggedIn);
  },
};

// ============================================================
// 产品类型
// ============================================================
export const types = {
  all() { return read(KEYS.types, []); },
  save(list) { return write(KEYS.types, list); },
  add(name) {
    const list = types.all();
    const next = { id: nextId(list), name, createdAt: nowStr() };
    list.push(next);
    write(KEYS.types, list);
    return next;
  },
  update(id, name) {
    const list = types.all();
    const item = list.find((t) => t.id === id);
    if (item) item.name = name;
    write(KEYS.types, list);
    return item;
  },
  remove(id) {
    const list = types.all().filter((t) => t.id !== id);
    write(KEYS.types, list);
    // 联动删除产品信息中的相关记录？此处仅删除类型，保留产品（业务可调）
    return list;
  },
  nameOf(id) {
    const t = types.all().find((x) => x.id === id);
    return t ? t.name : '—';
  },
};

// ============================================================
// 产品信息
// ============================================================
export const products = {
  all() { return read(KEYS.products, []); },
  save(list) { return write(KEYS.products, list); },
  add({ typeId, name, warranty }) {
    const list = products.all();
    const next = { id: nextId(list), typeId: Number(typeId), name, warranty, createdAt: nowStr() };
    list.push(next);
    write(KEYS.products, list);
    return next;
  },
  update(id, { typeId, name, warranty }) {
    const list = products.all();
    const item = list.find((p) => p.id === id);
    if (item) {
      item.typeId = Number(typeId);
      item.name = name;
      item.warranty = warranty;
    }
    write(KEYS.products, list);
    return item;
  },
  remove(id) {
    const list = products.all().filter((p) => p.id !== id);
    write(KEYS.products, list);
    return list;
  },
};

// ============================================================
// 统计（仪表盘）
// ============================================================
export const stats = {
  compute() {
    const today = new Date().toISOString().slice(0, 10);
    const month = today.slice(0, 7);
    const inb = read(KEYS.inbound, []);
    const out = read(KEYS.outbound, []);
    const sumBy = (arr, predicate) => arr.filter(predicate).reduce((s, r) => s + (r.qty || 0), 0);
    return {
      todayIn: sumBy(inb, (r) => r.date === today),
      todayOut: sumBy(out, (r) => r.date === today),
      monthIn: sumBy(inb, (r) => r.date.startsWith(month)),
      monthOut: sumBy(out, (r) => r.date.startsWith(month)),
    };
  },
};

// —— 工具 ——
function nextId(list) {
  return list.reduce((m, x) => Math.max(m, x.id), 0) + 1;
}
function nowStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
