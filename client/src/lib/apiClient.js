const BASE = '/api';

async function request(method, path, { body, params, isForm = false } = {}) {
  const qs = params ? '?' + new URLSearchParams(stripUndef(params)).toString() : '';
  const init = { method, headers: {} };
  if (body !== undefined) {
    if (isForm) {
      init.body = body;
    } else {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
  }
  const res = await fetch(`${BASE}${path}${qs}`, init);
  if (!res.ok) {
    let payload = null;
    try { payload = await res.json(); } catch { /* ignore */ }
    const err = new Error(payload?.error || `Request failed: ${res.status}`);
    err.status = res.status;
    err.details = payload?.details;
    throw err;
  }
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

function stripUndef(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
}

export const api = {
  get: (path, params) => request('GET', path, { params }),
  post: (path, body) => request('POST', path, { body }),
  postForm: (path, formData) => request('POST', path, { body: formData, isForm: true }),
  put: (path, body) => request('PUT', path, { body }),
  del: (path) => request('DELETE', path),
};

export function buildUrl(path, params = {}) {
  const qs = new URLSearchParams(stripUndef(params)).toString();
  return `${BASE}${path}${qs ? `?${qs}` : ''}`;
}
