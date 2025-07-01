export interface User {
  id: string;
  name: string;
  avatar: string;
  balance: number;
  isAdmin: boolean;
  joinedAt: string;
  totalBets: number;
  totalWins: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  bet: number;
  chance: number;
  userId: string;
}

export interface GameHistory {
  id: string;
  totalPot: number;
  winner: Player;
  players: Player[];
  finishedAt: string;
}

export interface BetHistory {
  id: string;
  userId: string;
  amount: number;
  gameId: string;
  won: boolean;
  createdAt: string;
}

export interface PromoCode {
  code: string;
  amount: number;
  usedBy: string[];
  maxUses: number;
  isActive: boolean;
}

export interface GameState {
  players: Player[];
  totalPot: number;
  timeLeft: number;
  gameStatus: "waiting" | "countdown" | "spinning" | "finished";
  winner: Player | null;
  gameId: string;
}
