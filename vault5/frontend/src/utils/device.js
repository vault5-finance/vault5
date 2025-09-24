/**
 * Device ID utilities for Vault5
 * - Generates a stable, pseudo-random device ID persisted in localStorage
 * - Used for trusted device checks during pre-login 2FA
 */
export function getOrCreateDeviceId(storageKey = 'v5_device_id') {
  try {
    let id = localStorage.getItem(storageKey);
    if (id) return id;

    // Prefer crypto for strong randomness
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint8Array(16);
      window.crypto.getRandomValues(arr);
      id = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback to Math.random (less secure)
      id = ('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx').replace(/x/g, () => (Math.random() * 16 | 0).toString(16));
    }

    id = `v5_${id}`;
    localStorage.setItem(storageKey, id);
    return id;
  } catch (e) {
    // As a last resort, return a session-scoped ID
    return `v5_fallback_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}