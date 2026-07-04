// ============================================================
// api.js · 外部登录接口 + 验证码（含 CORS 降级 Mock）
// ============================================================

const LOGIN_URL = 'http://www.ytgdxt.com/login.asp';
const CODE_URL = 'http://www.ytgdxt.com/inc/Code.asp';

// Mock 凭据（CORS 降级时使用）
const MOCK = { user: 'admin', pass: '123456' };

/**
 * 生成验证码图片 URL（带时间戳防止缓存）
 * 直接用 <img> 加载，浏览器会自动保存 cookie
 */
export function captchaUrl() {
  return `${CODE_URL}?_t=${Date.now()}`;
}

/**
 * 登录：POST 到外部接口
 * @returns {Promise<{ok: boolean, user?: string, mock?: boolean, error?: string}>}
 */
export async function login({ admin, pass, code }) {
  const body = new URLSearchParams({
    admin, pass, code,
    send: 'ok', x: '70', y: '9',
  });

  try {
    const res = await fetch(LOGIN_URL, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const text = await res.text();

    // 根据响应内容判断是否登录成功（ASP 站点通常失败会返回包含"错误/失败/验证码"等字样）
    const failKeywords = ['错误', '失败', '验证码', '密码', 'login', 'error', 'incorrect', 'wrong'];
    const isFail = failKeywords.some((k) => text.toLowerCase().includes(k.toLowerCase()));

    if (isFail) {
      return { ok: false, error: '账号、密码或验证码错误' };
    }
    return { ok: true, user: admin };
  } catch (err) {
    // CORS / 网络错误 → 降级 Mock 登录
    if (admin === MOCK.user && pass === MOCK.pass) {
      return { ok: true, user: admin, mock: true };
    }
    // 非 mock 凭据也尝试 mock 提示
    if (admin && pass && code) {
      // 给一个友好降级：任意非空都允许，便于预览（注释可关闭）
      return { ok: true, user: admin, mock: true };
    }
    return { ok: false, error: '网络或 CORS 限制，请使用预览凭据 admin / 123456' };
  }
}
