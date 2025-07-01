import { GameState, User, GameHistory, BetHistory, PromoCode } from "@/types";

// Global state management using localStorage with cross-tab synchronization
class GlobalStateManager {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    // Listen to localStorage changes from other tabs
    window.addEventListener("storage", (e) => {
      if (e.key && e.newValue) {
        try {
          this.notifyListeners(e.key, JSON.parse(e.newValue));
        } catch (error) {
          console.error("Failed to parse localStorage value:", error);
        }
      }
    });

    // Listen to custom events within the same tab
    window.addEventListener("localStateChange", (e: any) => {
      if (e.detail.key) {
        this.notifyListeners(e.detail.key, e.detail.value);
      }
    });
  }

  // Set data and notify all listeners
  setData<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));

      // Dispatch custom event for same-tab communication
      window.dispatchEvent(
        new CustomEvent("localStateChange", {
          detail: { key, value: data },
        }),
      );
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  // Get data from localStorage
  getData<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Failed to get from localStorage:", error);
      return defaultValue;
    }
  }

  // Subscribe to changes for a specific key
  subscribe<T>(key: string, callback: (data: T) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  // Notify listeners when data changes
  private notifyListeners(key: string, data: any): void {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  // Clear all data (for testing purposes)
  clearAll(): void {
    localStorage.clear();
  }
}

// Create global instance
export const globalState = new GlobalStateManager();

// Predefined keys for our application
export const STORAGE_KEYS = {
  GAME_STATE: "jackpot_game_state_global",
  USERS: "jackpot_users_global",
  GAME_HISTORY: "jackpot_history_global",
  BET_HISTORY: "jackpot_bets_global",
  PROMO_CODES: "jackpot_promos_global",
  CURRENT_USER: "jackpot_current_user_global",
  RIGGED_WINNER: "jackpot_rigged_winner_global",
  ONLINE_USERS: "jackpot_online_users_global",
} as const;

// Initialize default data
export const initializeGlobalState = () => {
  // Initialize default game state if not exists
  if (!localStorage.getItem(STORAGE_KEYS.GAME_STATE)) {
    globalState.setData<GameState>(STORAGE_KEYS.GAME_STATE, {
      players: [],
      totalPot: 0,
      timeLeft: 0,
      gameStatus: "waiting",
      winner: null,
      gameId: "",
    });
  }

  // Initialize default promo codes if not exists
  if (!localStorage.getItem(STORAGE_KEYS.PROMO_CODES)) {
    globalState.setData<PromoCode[]>(STORAGE_KEYS.PROMO_CODES, [
      {
        code: "WELCOME100",
        amount: 100,
        usedBy: [],
        maxUses: 100,
        isActive: true,
      },
      { code: "BONUS50", amount: 50, usedBy: [], maxUses: 50, isActive: true },
    ]);
  }

  // Initialize empty arrays for other data
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    globalState.setData<User[]>(STORAGE_KEYS.USERS, []);
  }

  if (!localStorage.getItem(STORAGE_KEYS.GAME_HISTORY)) {
    globalState.setData<GameHistory[]>(STORAGE_KEYS.GAME_HISTORY, []);
  }

  if (!localStorage.getItem(STORAGE_KEYS.BET_HISTORY)) {
    globalState.setData<BetHistory[]>(STORAGE_KEYS.BET_HISTORY, []);
  }

  if (!localStorage.getItem(STORAGE_KEYS.ONLINE_USERS)) {
    globalState.setData<string[]>(STORAGE_KEYS.ONLINE_USERS, []);
  }
};

// Helper functions for specific data types
export const gameStateManager = {
  get: (): GameState =>
    globalState.getData(STORAGE_KEYS.GAME_STATE, {
      players: [],
      totalPot: 0,
      timeLeft: 0,
      gameStatus: "waiting",
      winner: null,
      gameId: "",
    }),

  set: (data: GameState) => globalState.setData(STORAGE_KEYS.GAME_STATE, data),

  subscribe: (callback: (data: GameState) => void) =>
    globalState.subscribe(STORAGE_KEYS.GAME_STATE, callback),
};

export const usersManager = {
  get: (): User[] => globalState.getData(STORAGE_KEYS.USERS, []),
  set: (data: User[]) => globalState.setData(STORAGE_KEYS.USERS, data),
  subscribe: (callback: (data: User[]) => void) =>
    globalState.subscribe(STORAGE_KEYS.USERS, callback),
};

export const onlineUsersManager = {
  get: (): string[] => globalState.getData(STORAGE_KEYS.ONLINE_USERS, []),
  set: (data: string[]) => globalState.setData(STORAGE_KEYS.ONLINE_USERS, data),
  subscribe: (callback: (data: string[]) => void) =>
    globalState.subscribe(STORAGE_KEYS.ONLINE_USERS, callback),

  // Add user to online list
  addUser: (userId: string) => {
    const current = onlineUsersManager.get();
    if (!current.includes(userId)) {
      onlineUsersManager.set([...current, userId]);
    }
  },

  // Remove user from online list
  removeUser: (userId: string) => {
    const current = onlineUsersManager.get();
    onlineUsersManager.set(current.filter((id) => id !== userId));
  },
};
