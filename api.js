const TOKEN_KEY = "scs_token";
const USER_KEY = "scs_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
export { USER_KEY };

async function readError(res) {
  let message = `Something went wrong (${res.status})`;
  try {
    const body = await res.json();
    if (typeof body.detail === "string") message = body.detail;
    else if (Array.isArray(body.detail))
      message = body.detail.map((d) => `${(d.loc || []).slice(-1)[0]}: ${d.msg}`).join(". ");
  } catch {
    /* response had no JSON body */
  }
  const err = new Error(message);
  err.status = res.status;
  return err;
}

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function handleExpired(res, path) {
  // A 401 on any call except login means the session is gone: go back to sign in.
  if (res.status === 401 && getToken() && !path.startsWith("/auth/")) {
    clearSession();
    window.location.assign("/login");
  }
}

export async function api(path, { method = "GET", body, form } = {}) {
  const headers = authHeaders();
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}`, { method, headers, body: payload });
  handleExpired(res, path);
  if (!res.ok) throw await readError(res);
  return res.status === 204 ? null : res.json();
}

// POST that returns a file; saves it through the browser.
export async function downloadFile(path, body, filename) {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  handleExpired(res, path);
  if (!res.ok) throw await readError(res);
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
