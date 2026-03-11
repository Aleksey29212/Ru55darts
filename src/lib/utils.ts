import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * ГАРАНТИЯ: Стабильное форматирование даты без ошибок гидратации.
 * Использует UTC методы для идентичного отображения на сервере и клиенте.
 */
export function formatDate(dateSource: any): string {
  if (!dateSource) return '';

  let date: Date;

  if (typeof dateSource === 'object' && dateSource !== null) {
    if (typeof dateSource.toDate === 'function') {
      date = dateSource.toDate();
    } else if (typeof dateSource.seconds === 'number') {
      date = new Date(dateSource.seconds * 1000);
    } else if (dateSource instanceof Date) {
      date = dateSource;
    } else {
      date = new Date(dateSource);
    }
  } else if (typeof dateSource === 'string') {
    date = new Date(dateSource);
  } else {
    date = new Date(dateSource);
  }

  if (isNaN(date.getTime())) {
    return '00.00.0000';
  }

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
 * Рекурсивно очищает данные Firestore для безопасной передачи в Client Components.
 * Предотвращает ошибки "Objects with toJSON methods are not supported" для объектов Timestamp.
 * Также конвертирует все даты и Timestamp в ISO-строки.
 */
export function sanitizeFirestore(data: any): any {
  if (data === null || data === undefined) return data;

  // Если это Firestore Timestamp или объект, похожий на него
  if (typeof data === 'object') {
    if (typeof data.toDate === 'function') {
      return data.toDate().toISOString();
    }
    
    // Проверка структуры {seconds, nanoseconds}, которую часто возвращает SDK в Node.js
    if (typeof data.seconds === 'number' && typeof data.nanoseconds === 'number') {
      return new Date(data.seconds * 1000).toISOString();
    }

    if (data instanceof Date) {
      return data.toISOString();
    }
  }

  // Если это массив, обрабатываем каждый элемент
  if (Array.isArray(data)) {
    return data.map(sanitizeFirestore);
  }

  // Если это простой объект, обрабатываем каждое поле рекурсивно
  if (typeof data === 'object' && data !== null) {
    const proto = Object.getPrototypeOf(data);
    if (proto === null || proto === Object.prototype) {
      const sanitized: any = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          sanitized[key] = sanitizeFirestore(data[key]);
        }
      }
      return sanitized;
    }
  }

  // Для примитивных типов возвращаем как есть
  return data;
}
