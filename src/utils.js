export const withLogging = (originalFn, level = "INFO") => {
  return async (...args) => {
    const start = performance.now();
    const timestamp = new Date().toLocaleString();

    try {
      console.log(`[${timestamp}] [${level}] Виклик функції з аргументами:`, args);
      
      const result = await originalFn(...args);
      
      const end = performance.now();
      console.log(`[${timestamp}] [${level}] Успішно! Результат:`, result);
      console.log(`Час виконання: ${(end - start).toFixed(2)} ms`);
      
      return result;
    } catch (error) {
      console.error(`[${timestamp}] [ERROR] Помилка:`, error);
      throw error;
    }
  };
};