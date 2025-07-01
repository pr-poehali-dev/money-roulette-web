import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";
import ProfileModal from "@/components/ProfileModal";
import AdminPanel from "@/components/AdminPanel";
import HistoryModal from "@/components/HistoryModal";
import RouletteWheel from "@/components/RouletteWheel";
import TelegramLogin from "@/components/TelegramLogin";
import {
  User,
  Player,
  GameState,
  GameHistory,
  BetHistory,
  PromoCode,
} from "@/types";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}
import {
  gameStateManager,
  usersManager,
  onlineUsersManager,
  globalState,
  STORAGE_KEYS,
  initializeGlobalState,
  forceSyncAllData,
} from "@/services/globalState";

const JackpotPage = () => {
  // Initialize global state
  useEffect(() => {
    initializeGlobalState();
  }, []);

  // Global State
  const [users, setUsers] = useState<User[]>([]);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [betHistory, setBetHistory] = useState<BetHistory[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    totalPot: 0,
    timeLeft: 0,
    gameStatus: "waiting",
    winner: null,
    gameId: "",
  });

  // Local State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [betAmount, setBetAmount] = useState<string>("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Modals
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Rigging system
  const [riggedWinnerId, setRiggedWinnerId] = useState<string>("");

  // Subscribe to global state changes
  useEffect(() => {
    // Force sync all data for new users first
    forceSyncAllData();

    // Small delay to ensure sync is complete
    setTimeout(() => {
      // Load initial data
      setUsers(usersManager.get());
      setGameState(gameStateManager.get());
      setGameHistory(globalState.getData(STORAGE_KEYS.GAME_HISTORY, []));
      setBetHistory(globalState.getData(STORAGE_KEYS.BET_HISTORY, []));
      setPromoCodes(globalState.getData(STORAGE_KEYS.PROMO_CODES, []));
      setRiggedWinnerId(globalState.getData(STORAGE_KEYS.RIGGED_WINNER, ""));
      setOnlineUsers(onlineUsersManager.get());
    }, 100);

    // Subscribe to changes
    const unsubscribes = [
      usersManager.subscribe((newUsers) => {
        setUsers(newUsers);
      }),
      gameStateManager.subscribe((newGameState) => {
        setGameState(newGameState);
      }),
      globalState.subscribe(STORAGE_KEYS.GAME_HISTORY, (newHistory) => {
        setGameHistory(newHistory);
      }),
      globalState.subscribe(STORAGE_KEYS.BET_HISTORY, (newBetHistory) => {
        setBetHistory(newBetHistory);
      }),
      globalState.subscribe(STORAGE_KEYS.PROMO_CODES, (newPromoCodes) => {
        setPromoCodes(newPromoCodes);
      }),
      globalState.subscribe(STORAGE_KEYS.RIGGED_WINNER, (newRiggedWinner) => {
        setRiggedWinnerId(newRiggedWinner);
      }),
      onlineUsersManager.subscribe((newOnlineUsers) => {
        setOnlineUsers(newOnlineUsers);
      }),
    ];

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // Initialize current user from global storage
  useEffect(() => {
    const savedUserId = globalState.getData(STORAGE_KEYS.CURRENT_USER, "");
    if (savedUserId && users.length > 0) {
      const user = users.find((u) => u.id === savedUserId);
      if (user) {
        setCurrentUser(user);
        onlineUsersManager.addUser(user.id);
      }
    }
  }, [users]);

  // Handle user going offline when tab closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        onlineUsersManager.removeUser(currentUser.id);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (currentUser) {
        onlineUsersManager.removeUser(currentUser.id);
      }
    };
  }, [currentUser]);

  // Periodically update user's online status
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        onlineUsersManager.addUser(currentUser.id);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Real Telegram auth
  const handleTelegramAuth = (telegramUser: TelegramUser) => {
    const userId = `tg_${telegramUser.id}`;
    const displayName =
      telegramUser.username ||
      `${telegramUser.first_name}${telegramUser.last_name ? " " + telegramUser.last_name : ""}`;

    // Check if user already exists
    let existingUser = users.find((u) => u.id === userId);

    if (existingUser) {
      // User exists, just log them in
      setCurrentUser(existingUser);
      globalState.setData(STORAGE_KEYS.CURRENT_USER, userId);
      onlineUsersManager.addUser(userId);
    } else {
      // Create new user
      const newUser: User = {
        id: userId,
        name: displayName,
        balance: 1000, // Starting balance
        avatar: telegramUser.photo_url ? "📷" : "👤",
        isAdmin: users.length === 0, // First user is admin
        joinedAt: new Date().toISOString(),
        totalBets: 0,
        totalWins: 0,
      };

      const updatedUsers = [...users, newUser];
      usersManager.set(updatedUsers);
      setCurrentUser(newUser);
      globalState.setData(STORAGE_KEYS.CURRENT_USER, userId);
      onlineUsersManager.addUser(userId);
    }
  };

  // Fallback mock auth for development
  const handleMockAuth = () => {
    const avatars = [
      "👤",
      "🚀",
      "⭐",
      "🎯",
      "🔥",
      "💎",
      "🌟",
      "⚡",
      "🎪",
      "🎲",
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    const userId = "mock_" + Date.now();

    const newUser: User = {
      id: userId,
      name: "User" + Math.floor(Math.random() * 1000),
      balance: 1000,
      avatar: randomAvatar,
      isAdmin: users.length === 0,
      joinedAt: new Date().toISOString(),
      totalBets: 0,
      totalWins: 0,
    };

    const updatedUsers = [...users, newUser];
    usersManager.set(updatedUsers);
    setCurrentUser(newUser);
    globalState.setData(STORAGE_KEYS.CURRENT_USER, userId);
    onlineUsersManager.addUser(userId);
  };

  // Update user with nickname uniqueness check
  const updateUser = (updates: Partial<User>) => {
    if (!currentUser) return;

    // Check nickname uniqueness if name is being changed
    if (updates.name && updates.name !== currentUser.name) {
      const isNameTaken = users.some(
        (u) =>
          u.id !== currentUser.id &&
          u.name.toLowerCase() === updates.name.toLowerCase(),
      );
      if (isNameTaken) {
        alert("Пользователь с таким ником уже существует!");
        return;
      }
    }

    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id ? updatedUser : u,
    );
    usersManager.set(updatedUsers);
  };

  // Admin update user
  const adminUpdateUser = (userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, ...updates } : u,
    );
    usersManager.set(updatedUsers);
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  // Activate promo code
  const activatePromoCode = (code: string): boolean => {
    if (!currentUser) return false;

    const promo = promoCodes.find((p) => p.code === code && p.isActive);
    if (
      !promo ||
      promo.usedBy.includes(currentUser.id) ||
      promo.usedBy.length >= promo.maxUses
    ) {
      return false;
    }

    // Update promo code
    const updatedPromoCodes = promoCodes.map((p) =>
      p.code === code ? { ...p, usedBy: [...p.usedBy, currentUser.id] } : p,
    );
    globalState.setData(STORAGE_KEYS.PROMO_CODES, updatedPromoCodes);

    // Update user balance
    updateUser({ balance: currentUser.balance + promo.amount });
    return true;
  };

  // Create promo code (admin)
  const createPromoCode = (promo: PromoCode) => {
    const updatedPromoCodes = [...promoCodes, promo];
    globalState.setData(STORAGE_KEYS.PROMO_CODES, updatedPromoCodes);
  };

  // Toggle promo code (admin)
  const togglePromoCode = (code: string) => {
    const updatedPromoCodes = promoCodes.map((p) =>
      p.code === code ? { ...p, isActive: !p.isActive } : p,
    );
    globalState.setData(STORAGE_KEYS.PROMO_CODES, updatedPromoCodes);
  };

  // Add bet
  const handleBet = () => {
    if (
      !currentUser ||
      !betAmount ||
      parseFloat(betAmount) <= 0 ||
      parseFloat(betAmount) > currentUser.balance ||
      gameState.gameStatus !== "waiting"
    )
      return;

    const bet = parseFloat(betAmount);
    const gameId = gameState.gameId || "game_" + Date.now();

    // Add bet to history
    const betRecord: BetHistory = {
      id: "bet_" + Date.now(),
      userId: currentUser.id,
      amount: bet,
      gameId,
      won: false,
      createdAt: new Date().toISOString(),
    };
    const updatedBetHistory = [betRecord, ...betHistory];
    globalState.setData(STORAGE_KEYS.BET_HISTORY, updatedBetHistory);

    const currentGameState = gameState;

    // Find existing player or create new one
    const existingPlayerIndex = currentGameState.players.findIndex(
      (p) => p.userId === currentUser.id,
    );
    let newPlayers;

    if (existingPlayerIndex >= 0) {
      // Update existing player's bet
      newPlayers = currentGameState.players.map((player, index) =>
        index === existingPlayerIndex
          ? { ...player, bet: player.bet + bet }
          : player,
      );
    } else {
      // Add new player
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: currentUser.name,
        avatar: currentUser.avatar,
        bet,
        chance: 0,
        userId: currentUser.id,
      };
      newPlayers = [...currentGameState.players, newPlayer];
    }

    const newTotalPot = currentGameState.totalPot + bet;

    // Calculate chances
    const playersWithChances = newPlayers.map((player) => ({
      ...player,
      chance: (player.bet / newTotalPot) * 100,
    }));

    // Start countdown if we have 2+ players from different users
    let newStatus = currentGameState.gameStatus;
    let newTimeLeft = currentGameState.timeLeft;

    const uniquePlayers = new Set(newPlayers.map((p) => p.userId));

    if (uniquePlayers.size >= 2 && currentGameState.gameStatus === "waiting") {
      newStatus = "countdown";
      newTimeLeft = 60; // Увеличиваем до 60 секунд
    }

    const newGameState = {
      ...currentGameState,
      players: playersWithChances,
      totalPot: newTotalPot,
      gameStatus: newStatus,
      timeLeft: newTimeLeft,
    };

    gameStateManager.set(newGameState);

    // Update user balance and stats
    updateUser({
      balance: currentUser.balance - bet,
      totalBets: currentUser.totalBets + 1,
    });
    setBetAmount("");
  };

  // Timer countdown
  useEffect(() => {
    if (gameState.gameStatus === "countdown" && gameState.timeLeft > 0) {
      const timer = setTimeout(() => {
        const updatedGameState = {
          ...gameState,
          timeLeft: gameState.timeLeft - 1,
        };
        gameStateManager.set(updatedGameState);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (
      gameState.gameStatus === "countdown" &&
      gameState.timeLeft === 0
    ) {
      startSpin();
    }
  }, [gameState.timeLeft, gameState.gameStatus]);

  const startSpin = () => {
    const updatedGameState = { ...gameState, gameStatus: "spinning" };
    gameStateManager.set(updatedGameState);

    // Simulate spinning for 3 seconds
    setTimeout(() => {
      let winner = gameState.players[0];

      // Check if game is rigged
      if (riggedWinnerId) {
        const riggedPlayer = gameState.players.find(
          (p) => p.userId === riggedWinnerId,
        );
        if (riggedPlayer) {
          winner = riggedPlayer;
          // Reset rigging after use
          setRiggedWinnerId("");
        } else {
          // If rigged player not in game, use normal random selection
          const random = Math.random() * gameState.totalPot;
          let cumulative = 0;

          for (const player of gameState.players) {
            cumulative += player.bet;
            if (random <= cumulative) {
              winner = player;
              break;
            }
          }
        }
      } else {
        // Normal random selection
        const random = Math.random() * gameState.totalPot;
        let cumulative = 0;

        for (const player of gameState.players) {
          cumulative += player.bet;
          if (random <= cumulative) {
            winner = player;
            break;
          }
        }
      }

      // Update bet history - mark winner
      const updatedBetHistory = betHistory.map((bet) =>
        bet.gameId === gameState.gameId && bet.userId === winner.userId
          ? { ...bet, won: true }
          : bet,
      );
      globalState.setData(STORAGE_KEYS.BET_HISTORY, updatedBetHistory);

      // Update winner stats
      const winnerUser = users.find((u) => u.id === winner.userId);
      if (winnerUser) {
        adminUpdateUser(winner.userId, {
          balance: winnerUser.balance + gameState.totalPot,
          totalWins: winnerUser.totalWins + 1,
        });
      }

      // Add to game history
      const gameRecord: GameHistory = {
        id: gameState.gameId,
        totalPot: gameState.totalPot,
        winner,
        players: gameState.players,
        finishedAt: new Date().toISOString(),
      };
      const updatedGameHistory = [gameRecord, ...gameHistory];
      globalState.setData(STORAGE_KEYS.GAME_HISTORY, updatedGameHistory);

      const finishedGameState = {
        ...gameState,
        gameStatus: "finished",
        winner,
      };
      gameStateManager.set(finishedGameState);

      // Auto-restart after 5 seconds
      setTimeout(() => {
        const newGameState = {
          players: [],
          totalPot: 0,
          timeLeft: 0,
          gameStatus: "waiting" as const,
          winner: null,
          gameId: "game_" + Date.now(),
        };
        gameStateManager.set(newGameState);
      }, 5000);
    }, 3000);
  };

  const getStatusText = () => {
    const uniquePlayers = new Set(gameState.players.map((p) => p.userId)).size;

    switch (gameState.gameStatus) {
      case "waiting":
        return uniquePlayers < 2
          ? `Ожидание игроков (${uniquePlayers}/2 минимум)`
          : `Игроков в игре: ${uniquePlayers}`;
      case "countdown":
        return `Начало через ${gameState.timeLeft}с (ставки принимаются)`;
      case "spinning":
        return "Определяем победителя...";
      case "finished":
        return `Победитель: ${gameState.winner?.name}`;
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="Crown" className="text-yellow-400" size={28} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                JACKPOT ROULETTE
              </h1>
            </div>

            <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-300 font-medium">
                {onlineUsers.length} онлайн
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistoryModalOpen(true)}
                  className="text-purple-300 hover:text-purple-200"
                >
                  <Icon name="History" className="mr-2" size={16} />
                  История
                </Button>

                {currentUser.isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAdminPanelOpen(true)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Icon name="Shield" className="mr-2" size={16} />
                    Админ
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => setProfileModalOpen(true)}
                  className="flex items-center space-x-2 hover:bg-gray-800"
                >
                  <div className="text-right">
                    <div className="text-sm text-gray-300">
                      {currentUser.name}
                    </div>
                    <div className="text-lg font-bold text-green-400">
                      ${currentUser.balance.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-2xl">{currentUser.avatar}</div>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (currentUser) {
                      onlineUsersManager.removeUser(currentUser.id);
                    }
                    globalState.setData(STORAGE_KEYS.CURRENT_USER, "");
                    setCurrentUser(null);
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Icon name="LogOut" className="mr-2" size={16} />
                  Выход
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Real Telegram Login */}
                <TelegramLogin
                  onAuth={handleTelegramAuth}
                  botName="YourBotName"
                />

                {/* Fallback for development */}
                <Button
                  onClick={handleMockAuth}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Тест
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Status */}
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-yellow-400">
                    ${gameState.totalPot.toFixed(2)}
                  </h2>
                  <div className="text-lg text-purple-300">
                    {getStatusText()}
                  </div>

                  {gameState.gameStatus === "countdown" && (
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-purple-500/30"></div>
                      <div
                        className="absolute inset-0 rounded-full border-4 border-yellow-400 transition-all duration-1000"
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((2 * Math.PI * (60 - gameState.timeLeft)) / 60 - Math.PI / 2)}% ${50 + 50 * Math.sin((2 * Math.PI * (60 - gameState.timeLeft)) / 60 - Math.PI / 2)}%, 50% 0%)`,
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {gameState.timeLeft}
                        </span>
                      </div>
                    </div>
                  )}

                  {(gameState.gameStatus === "spinning" ||
                    gameState.players.length > 0) && (
                    <RouletteWheel
                      players={gameState.players}
                      isSpinning={gameState.gameStatus === "spinning"}
                      winner={gameState.winner}
                    />
                  )}

                  {gameState.winner && (
                    <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <div className="text-xl font-bold text-green-400">
                        🎉 {gameState.winner.name} выиграл $
                        {gameState.totalPot.toFixed(2)}!
                      </div>
                      <div className="text-sm text-green-300 mt-1">
                        Шанс на победу: {gameState.winner.chance.toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Betting */}
            {currentUser &&
              (gameState.gameStatus === "waiting" ||
                gameState.gameStatus === "countdown") && (
                <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">
                      Сделать ставку
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Сумма ставки"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                        disabled={
                          gameState.gameStatus === "spinning" ||
                          gameState.gameStatus === "finished"
                        }
                      />
                      <Button
                        onClick={handleBet}
                        disabled={
                          !betAmount ||
                          parseFloat(betAmount) <= 0 ||
                          parseFloat(betAmount) > currentUser.balance ||
                          gameState.gameStatus === "spinning" ||
                          gameState.gameStatus === "finished"
                        }
                        className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
                      >
                        Поставить
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount("10")}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        disabled={gameState.gameStatus === "countdown"}
                      >
                        $10
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount("50")}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        disabled={gameState.gameStatus === "countdown"}
                      >
                        $50
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount("100")}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        disabled={gameState.gameStatus === "countdown"}
                      >
                        $100
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setBetAmount(currentUser.balance.toString())
                        }
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        disabled={gameState.gameStatus === "countdown"}
                      >
                        ALL IN
                      </Button>
                    </div>
                    {gameState.gameStatus === "countdown" && (
                      <div className="text-sm text-orange-400 font-medium">
                        ⏰ Ставки закрыты! Игра начинается...
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Players Panel */}
          <div className="space-y-6">
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Icon name="Users" className="mr-2" size={20} />
                  Участники ({gameState.players.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gameState.players.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    Пока нет участников
                  </div>
                ) : (
                  gameState.players.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{player.avatar}</div>
                        <div>
                          <div className="font-medium flex items-center space-x-2">
                            <span>{player.name}</span>
                            <span className="text-xs text-gray-500">
                              (#{player.userId.slice(-6)})
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {player.chance.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400">
                            Шанс на победу
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-400">
                          ${player.bet.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recent Games */}
            {gameHistory.length > 0 && (
              <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon name="Trophy" className="mr-2" size={20} />
                      Последние игры
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHistoryModalOpen(true)}
                      className="text-purple-300 hover:text-purple-200"
                    >
                      Все
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {gameHistory.slice(0, 3).map((game) => (
                    <div
                      key={game.id}
                      className="p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="text-lg">{game.winner.avatar}</div>
                          <div>
                            <div className="font-medium text-sm">
                              {game.winner.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              #{game.id.slice(-6)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-sm">
                            ${game.totalPot.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {game.winner.chance.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Game Rules */}
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Icon name="Info" className="mr-2" size={20} />
                  Правила игры
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-300">
                <p>• Минимум 2 разных игрока для старта</p>
                <p>• Таймер 60 секунд после 2-й ставки</p>
                <p>• Ставки принимаются во время обратного отсчета</p>
                <p>• Шанс победы = ваша ставка / общий банк</p>
                <p>• Победитель забирает весь банк</p>
                <p>• Новая игра через 5 секунд после завершения</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {currentUser && (
        <>
          <ProfileModal
            isOpen={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            user={currentUser}
            onUpdateUser={updateUser}
            onActivatePromo={activatePromoCode}
          />

          <HistoryModal
            isOpen={historyModalOpen}
            onClose={() => setHistoryModalOpen(false)}
            gameHistory={gameHistory}
            betHistory={betHistory}
            userId={currentUser.id}
          />

          {currentUser.isAdmin && (
            <AdminPanel
              isOpen={adminPanelOpen}
              onClose={() => setAdminPanelOpen(false)}
              users={users}
              promoCodes={promoCodes}
              onUpdateUser={adminUpdateUser}
              onCreatePromoCode={createPromoCode}
              onTogglePromoCode={togglePromoCode}
              onSetRiggedWinner={setRiggedWinnerId}
              riggedWinnerId={riggedWinnerId}
            />
          )}
        </>
      )}
    </div>
  );
};

export default JackpotPage;
