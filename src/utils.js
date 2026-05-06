export const withLogging = (originalFn, level = "INFO") => {
  return async (...args) => {
    const start = performance.now();
    const timestamp = new Date().toLocaleString();

    try {
      console.log(`[${timestamp}] [${level}] Виклик функції з аргументами:`, args);
      
      const result = await originalFn(...args);
      
      const end = performance.now();
      console.log(`[${timestamp}] [${level}] Успішно! Час виконання: ${(end - start).toFixed(2)} ms`);
      
      return result;
    } catch (error) {
      console.error(`[${timestamp}] [ERROR] Помилка у функції:`, error);
      throw error;
    }
  };
};

export const memoize = (fn, config = { maxSize: 50 }) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      console.log(`[Memoize] Взято з кешу для: ${key}`);
      return cache.get(key);
    }

    const result = fn(...args);

    if (cache.size >= config.maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, result);
    console.log(`[Memoize] Нове обчислення для: ${key}`);
    return result;
  };
};

export function* colorGenerator() {
  const colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', 
    '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
  ];
  let index = 0;
  while (true) {
    yield colors[index];
    index = (index + 1) % colors.length;
  }
}

export const createFandomIterator = (fandoms) => {
  let index = 0;
  return {
    next: () => {
      if (index < fandoms.length) {
        return { value: fandoms[index++], done: false };
      } else {
        return { done: true };
      }
    }
  };
};