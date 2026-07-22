const storage = {
  getString(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  getJson<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // storage unavailable or full
    }
  },

  setJson(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable or full
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // storage unavailable
    }
  },
};

export { storage };
