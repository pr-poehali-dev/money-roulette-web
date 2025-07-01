import { User } from "@/types/game";
import { mockGameApi } from "./mockGameApi";

const AUTH_STORAGE_KEY = "jackpot_auth";

export interface AuthData {
  userId: string;
  loginTime: string;
}

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  saveAuth(userId: string): void {
    const authData: AuthData = {
      userId,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  }

  getAuth(): AuthData | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to parse auth data:", error);
      this.clearAuth();
      return null;
    }
  }

  clearAuth(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    const auth = this.getAuth();
    if (!auth) return null;

    // Try to get user from server (using mock for now)
    const user = await mockGameApi.getUser(auth.userId);

    if (!user) {
      // User not found on server, clear local auth
      this.clearAuth();
      return null;
    }

    return user;
  }

  async createUser(userData: Omit<User, "balance">): Promise<User> {
    const user: User = {
      ...userData,
      balance: 1000, // Starting balance
    };

    // Add to mock server
    mockGameApi.addUser(user);

    // Save auth
    this.saveAuth(user.id);

    return user;
  }

  async logout(): Promise<void> {
    const auth = this.getAuth();
    if (auth) {
      // Set user offline on server
      await mockGameApi.setUserOffline(auth.userId);

      // Clear local auth
      this.clearAuth();
    }
  }

  clearSiteCache(): void {
    // Clear all localStorage except auth
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);

    localStorage.clear();

    // Restore auth if it existed
    if (authData) {
      localStorage.setItem(AUTH_STORAGE_KEY, authData);
    }

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear any cached data in memory
    // This would be where you'd clear any global state managers
  }
}

export const authService = AuthService.getInstance();
