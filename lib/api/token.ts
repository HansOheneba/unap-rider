let memoryToken: string | null = null;

export function setToken(token: string) {
  memoryToken = token;
}

export function getToken(): string | null {
  return memoryToken;
}

export function clearToken() {
  memoryToken = null;
}
