export function normalizeUsername(value: string) {
  return value.trim().normalize("NFKC").toLocaleLowerCase("zh-Hant");
}

export async function usernameToInternalEmail(username: string) {
  const normalized = normalizeUsername(username);
  const bytes = new TextEncoder().encode(normalized);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex}@users.example.com`;
}
