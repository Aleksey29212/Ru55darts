import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateSource: any): string {
  if (!dateSource) return '';

  let date: Date;

  // Handle Firestore Timestamp object which has a toDate() method
  if (typeof dateSource === 'object' && dateSource !== null && typeof dateSource.toDate === 'function') {
    date = dateSource.toDate();
  } else {
    // Handle ISO string or Date object
    date = new Date(dateSource);
  }

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'NaN.NaN.NaN';
  }

  // Using getUTCDate, getUTCMonth, getUTCFullYear to avoid timezone issues
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

export function safeNumber(value: any): number {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Recursively sanitizes Firestore data by converting Timestamps to ISO strings.
 * Prevents "Objects with toJSON methods are not supported" errors in Client Components.
 */
export function sanitizeFirestore(data: any): any {
  if (data === null || data === undefined) return data;

  // Detect Firestore Timestamp
  if (typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeFirestore);
  }

  if (typeof data === 'object' && data !== null) {
    // Only sanitize plain objects
    const proto = Object.getPrototypeOf(data);
    if (proto === null || proto === Object.prototype) {
      const sanitized: any = {};
      for (const key in data) {
        sanitized[key] = sanitizeFirestore(data[key]);
      }
      return sanitized;
    }
  }

  return data;
}
