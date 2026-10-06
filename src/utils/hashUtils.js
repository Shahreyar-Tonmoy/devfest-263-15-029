/**
 * Calculate SHA-256 hash of an ArrayBuffer
 * @param {ArrayBuffer} buffer
 * @returns {Promise<string>} Hex representation of hash
 */
export async function computeSha256(buffer) {
  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('Failed to compute hash:', err);
    // Fallback simple checksum if crypto.subtle is unavailable
    const bytes = new Uint8Array(buffer);
    let hash = 0;
    for (let i = 0; i < bytes.length; i++) {
      hash = ((hash << 5) - hash) + bytes[i];
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
}
