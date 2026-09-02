/**
 * Secure Licensing and Subscription Utility for Al-Rafidain Aqar
 * Pure cryptographic-like generator that doesn't need external server connection.
 */

const LICENSE_SALT = "AL_RAFIDAIN_AQAR_SECURE_SALT_2026_SAAS";

/**
 * Generates a license key for a given expiry date (YYYY-MM-DD)
 */
export function generateLicenseKey(expiryDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD.");
  }
  
  const cleanDate = expiryDate.replace(/-/g, ''); // e.g. "20261231"
  
  // Calculate a secure checksum/signature from the date + secret salt
  let hash = 0;
  const combined = cleanDate + LICENSE_SALT;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert hash to an 8-character base-36 uppercase string
  const signature = Math.abs(hash).toString(36).toUpperCase().padStart(8, '0').substring(0, 8);
  
  return `AQAR-${cleanDate}-${signature}`;
}

/**
 * Verifies if a given license key is authentic and has not been tampered with
 */
export function verifyLicenseKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  
  const parts = key.trim().toUpperCase().split('-');
  if (parts.length !== 3) return false;
  if (parts[0] !== 'AQAR') return false;
  
  const cleanDate = parts[1]; // e.g. "20261231"
  if (cleanDate.length !== 8 || !/^\d{8}$/.test(cleanDate)) return false;
  
  // Format cleanDate back to YYYY-MM-DD
  const year = cleanDate.substring(0, 4);
  const month = cleanDate.substring(4, 6);
  const day = cleanDate.substring(6, 8);
  const formattedDate = `${year}-${month}-${day}`;
  
  try {
    const expectedKey = generateLicenseKey(formattedDate);
    return expectedKey === key.trim().toUpperCase();
  } catch (e) {
    return false;
  }
}

/**
 * Extract the expiration date from an authentic license key
 */
export function getExpiryDateFromKey(key: string): string | null {
  if (!verifyLicenseKey(key)) return null;
  
  const parts = key.trim().toUpperCase().split('-');
  const cleanDate = parts[1];
  const year = cleanDate.substring(0, 4);
  const month = cleanDate.substring(4, 6);
  const day = cleanDate.substring(6, 8);
  return `${year}-${month}-${day}`;
}

/**
 * Calculates remaining days from a target date.
 * Returns negative value if already expired.
 */
export function getRemainingDays(expiryDateStr: string): number {
  const expiry = new Date(expiryDateStr + 'T23:59:59');
  const now = new Date();
  
  // Zero out times for date-only comparison
  expiry.setHours(23, 59, 59, 999);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
