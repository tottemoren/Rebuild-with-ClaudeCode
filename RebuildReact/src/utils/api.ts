// バックエンドの API を呼ぶときの共通の入口。
// ログインで受け取った合言葉（JWT）を、すべての呼び出しに Authorization ヘッダーとして付ける。
// 呼び出し方を1か所にまとめておくと、期限切れのときの扱いなどを後から1か所で足せる。

const TOKEN_KEY = "authToken";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAuthToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
}
