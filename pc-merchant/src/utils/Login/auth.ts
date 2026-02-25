const TokenKey = "token";

export function getToken(): string | null {
  return localStorage.getItem(TokenKey);
}

export function setToken(token: string): void {
  localStorage.setItem(TokenKey, token);
}

export function removeToken(): void {
  localStorage.removeItem(TokenKey);
}

export default {
  getToken,
  setToken,
  removeToken,
};
