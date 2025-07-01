import { GameState, Bet, User } from "@/types/game";

const API_BASE = "https://api.example.com"; // Replace with your actual API endpoint

export class GameApiService {
  private static instance: GameApiService;

  public static getInstance(): GameApiService {
    if (!GameApiService.instance) {
      GameApiService.instance = new GameApiService();
    }
    return GameApiService.instance;
  }

  async getCurrentGame(): Promise<GameState | null> {
    try {
      const response = await fetch(`${API_BASE}/game/current`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch current game:", error);
      return null;
    }
  }

  async placeBet(
    userId: string,
    amount: number,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE}/game/bet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, amount }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Failed to place bet:", error);
      return { success: false, message: "Ошибка сети" };
    }
  }

  async getCurrentBets(): Promise<Bet[]> {
    try {
      const response = await fetch(`${API_BASE}/game/bets`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch bets:", error);
      return [];
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE}/user/${userId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }

  async updateUserBalance(userId: string, balance: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/user/${userId}/balance`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ balance }),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to update user balance:", error);
      return false;
    }
  }

  async getOnlineUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE}/users/online`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch online users:", error);
      return [];
    }
  }

  async setUserOnline(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/user/${userId}/online`, {
        method: "POST",
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to set user online:", error);
      return false;
    }
  }

  async setUserOffline(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/user/${userId}/offline`, {
        method: "POST",
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to set user offline:", error);
      return false;
    }
  }
}

export const gameApi = GameApiService.getInstance();
