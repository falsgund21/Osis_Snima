/**
 * Keamanan Enkripsi Password menggunakan Web Crypto API SHA-256
 * Memastikan password admin tidak pernah disimpan dalam bentuk plain text.
 */
export async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function verifyPassword(plainText: string, storedHash: string): Promise<boolean> {
  const computedHash = await hashPassword(plainText);
  return computedHash.toLowerCase() === storedHash.toLowerCase();
}
