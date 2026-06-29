export interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  list(): Promise<string[]>;
}

export const localStorageAdapter: StorageAdapter = {
  get: async (key: string): Promise<string | null> => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error("Failed to read from localStorage:", e);
      return null;
    }
  },
  
  set: async (key: string, value: string): Promise<void> => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("Failed to write to localStorage:", e);
    }
  },
  
  list: async (): Promise<string[]> => {
    if (typeof window === "undefined") return [];
    try {
      return Object.keys(localStorage);
    } catch (e) {
      console.error("Failed to list localStorage keys:", e);
      return [];
    }
  }
};

// Default export uses the local storage MVP adapter.
export const store = localStorageAdapter;
