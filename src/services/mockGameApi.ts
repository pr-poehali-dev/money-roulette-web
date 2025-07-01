import { GameState, Bet, User } from "@/types/game";

// Mock API service for development/demo purposes
class MockGameApiService {
  private gameState: GameState | null = null;
  private bets: Bet[] = [];
  private users: Map<string, User> = new Map();
  private onlineUsers: Set<string> = new Set();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with a running game
    this.gameState = {
      id: `game_${Date.now()}`,
      status: "betting",
      totalPot: 0,
      countdown: 30,
      winner: null,
      createdAt: new Date().toISOString(),
    };

    // Add some mock users
    const mockUsers: User[] = [
      { id: "user_1", name: "Алексей", avatar: "🎮", balance: 1500 },
      { id: "user_2", name: "Мария", avatar: "🌟", balance: 2300 },
      { id: "user_3", name: "Дмитрий", avatar: "🚀", balance: 800 },
    ];

    mockUsers.forEach((user) => {
      this.users.set(user.id, user);
      this.onlineUsers.add(user.id);
    });
  }

  async getCurrentGame(): Promise<GameState | null> {
    return Promise.resolve(this.gameState);
  }

  async placeBet(
    userId: string,
    amount: number,
  ): Promise<{ success: boolean; message?: string }> {
    const user = this.users.get(userId);

    if (!user) {
      return { success: false, message: "Пользователь не найден" };
    }

    if (user.balance < amount) {
      return { success: false, message: "Недостаточно средств" };
    }

    if (!this.gameState || this.gameState.status !== "betting") {
      return { success: false, message: "Ставки не принимаются" };
    }

    // Check if user already has a bet
    const existingBet = this.bets.find((bet) => bet.userId === userId);
    if (existingBet) {
      return { success: false, message: "Вы уже сделали ставку" };
    }

    // Create bet
    const bet: Bet = {
      id: `bet_${Date.now()}_${userId}`,
      userId,
      amount,
      timestamp: new Date().toISOString(),
    };

    this.bets.push(bet);

    // Update user balance
    user.balance -= amount;

    // Update game pot
    if (this.gameState) {
      this.gameState.totalPot += amount;
    }

    return { success: true };
  }

  async getCurrentBets(): Promise<Bet[]> {
    return Promise.resolve([...this.bets]);
  }

  async getUser(userId: string): Promise<User | null> {
    return Promise.resolve(this.users.get(userId) || null);
  }

  async updateUserBalance(userId: string, balance: number): Promise<boolean> {
    const user = this.users.get(userId);
    if (user) {
      user.balance = balance;
      return true;
    }
    return false;
  }

  async getOnlineUsers(): Promise<User[]> {
    const online = Array.from(this.onlineUsers)
      .map((userId) => this.users.get(userId))
      .filter(Boolean) as User[];

    return Promise.resolve(online);
  }

  async setUserOnline(userId: string): Promise<boolean> {
    this.onlineUsers.add(userId);
    return true;
  }

  async setUserOffline(userId: string): Promise<boolean> {
    this.onlineUsers.delete(userId);
    return true;
  }

  // Helper methods for mock
  addUser(user: User) {
    this.users.set(user.id, user);
  }

  startNewGame() {
    // Clear bets
    this.bets = [];

    // Create new game
    this.gameState = {
      id: `game_${Date.now()}`,
      status: "betting",
      totalPot: 0,
      countdown: 30,
      winner: null,
      createdAt: new Date().toISOString(),
    };
  }

  endGame() {
    if (!this.gameState || this.bets.length === 0) return;

    // Calculate winner based on bet weights
    const totalPot = this.gameState.totalPot;
    const random = Math.random() * totalPot;

    let currentSum = 0;
    let winner: Bet | null = null;

    for (const bet of this.bets) {
      currentSum += bet.amount;
      if (random <= currentSum) {
        winner = bet;
        break;
      }
    }

    if (winner) {
      this.gameState.winner = winner;
      this.gameState.status = "finished";

      // Award winnings to winner
      const winnerUser = this.users.get(winner.userId);
      if (winnerUser) {
        winnerUser.balance += totalPot;
      }
    }
  }
}

export const mockGameApi = new MockGameApiService();
