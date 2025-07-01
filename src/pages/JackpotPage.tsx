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
import { authService } from "@/services/authService";
import { mockGameApi } from "@/services/mockGameApi";
import { GameState as ApiGameState, Bet, User as ApiUser } from "@/types/game";

const JackpotPage = () => {
  // Server State
  const [gameState, setGameState] = useState<ApiGameState | null>(null);
  const [currentBets, setCurrentBets] = useState<Bet[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ApiUser[]>([]);

  // Local State
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [betAmount, setBetAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Legacy state for compatibility (empty for now)
  const [users] = useState<User[]>([]);
  const [gameHistory] = useState<GameHistory[]>([]);
  const [betHistory] = useState<BetHistory[]>([]);
  const [promoCodes] = useState<PromoCode[]>([]);

  // Modals
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Rigging system (disabled for server version)
  const riggedWinnerId = "";

  // Initialize data from server
  useEffect(() => {
    loadServerData();

    // Set up polling for real-time updates
    const interval = setInterval(loadServerData, 2000);

    return () => clearInterval(interval);
  }, []);

  // Initialize current user from auth
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Handle user going offline when tab closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        mockGameApi.setUserOffline(currentUser.id);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (currentUser) {
        mockGameApi.setUserOffline(currentUser.id);
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

  // Server data loading functions
  const loadServerData = async () => {
    try {
      const [game, bets, online] = await Promise.all([
        mockGameApi.getCurrentGame(),
        mockGameApi.getCurrentBets(),
        mockGameApi.getOnlineUsers(),
      ]);

      if (game) setGameState(game);
      setCurrentBets(bets);
      setOnlineUsers(online);
    } catch (error) {
      console.error("Failed to load server data:", error);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        await mockGameApi.setUserOnline(user.id);
      }
    } catch (error) {
      console.error("Failed to load current user:", error);
    }
  };

  const clearCacheAndReload = () => {
    authService.clearSiteCache();
    window.location.reload();
  };

  // Real Telegram auth
  const handleTelegramAuth = async (telegramUser: TelegramUser) => {
    const userId = `tg_${telegramUser.id}`;
    const displayName =
      telegramUser.username ||
      `${telegramUser.first_name}${telegramUser.last_name ? " " + telegramUser.last_name : ""}`;

    try {
      // Check if user already exists on server
      let user = await mockGameApi.getUser(userId);

      if (!user) {
        // Create new user
        user = await authService.createUser({
          id: userId,
          name: displayName,
          avatar: telegramUser.photo_url ? "📷" : "👤",
        });
      }

      setCurrentUser(user);
      await mockGameApi.setUserOnline(userId);
    } catch (error) {
      console.error("Telegram auth failed:", error);
    }
  };

  // Fallback mock auth for development
  const handleMockAuth = async () => {
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

    try {
      const user = await authService.createUser({
        id: userId,
        name: "User" + Math.floor(Math.random() * 1000),
        avatar: randomAvatar,
      });

      setCurrentUser(user);
      await mockGameApi.setUserOnline(userId);
    } catch (error) {
      console.error("Mock auth failed:", error);
    }
  };

  // Update user (simplified for server version)
  const updateUser = async (updates: Partial<User>) => {
    if (!currentUser) return;
    
    // TODO: Implement server-side user updates
    console.log('User update requested:', updates);
  };

  // Admin update user (simplified for server version)
  const adminUpdateUser = async (userId: string, updates: Partial<User>) => {
    // TODO: Implement server-side admin user updates
    console.log('Admin user update requested:', { userId, updates });
  };

  // Activate promo code (simplified for server version)
  const activatePromoCode = async (code: string): Promise<boolean> => {
    // TODO: Implement server-side promo code activation
    console.log('Promo code activation requested:', code);
    return false;
  };

  // Create promo code (simplified for server version)
  const createPromoCode = async (promo: PromoCode) => {
    // TODO: Implement server-side promo code creation
    console.log('Promo code creation requested:', promo);
  };

  // Toggle promo code (simplified for server version)
  const togglePromoCode = async (code: string) => {
    // TODO: Implement server-side promo code toggle
    console.log('Promo code toggle requested:', code);
  };

  // Add bet
  const handleBet = async () => {
    if (
      !currentUser ||
      !betAmount ||
      parseFloat(betAmount) <= 0 ||
      parseFloat(betAmount) > currentUser.balance ||
      !gameState ||
      gameState.status !== "betting"
    )
      return;

    const bet = parseFloat(betAmount);
    setLoading(true);

    try {
      const result = await mockGameApi.placeBet(currentUser.id, bet);
      
      if (result.success) {
        setBetAmount("");
        // Refresh user data and game state
        await loadCurrentUser();
        await loadServerData();
      } else {
        alert(result.message || "Ошибка при размещении ставки");
      }
    } catch (error) {
      console.error("Failed to place bet:", error);
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

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
    if (!gameState) return "Загрузка...";
    
    const uniquePlayers = currentBets.reduce((acc, bet) => {
      acc.add(bet.userId);
      return acc;
    }, new Set()).size;

    switch (gameState.status) {
      case "betting":
        return uniquePlayers < 2
          ? `Ожидание игроков (${uniquePlayers}/2 минимум)`
          : `Игроков в игре: ${uniquePlayers}`;
      case "spinning":
        return "Определяем победителя...";
      case "finished":
        return gameState.winner ? `Победитель: ${onlineUsers.find(u => u.id === gameState.winner?.userId)?.name}` : "Игра завершена";
      default:
        return "Ожидание игры...";
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
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCacheAndReload}
              className="text-gray-400 hover:text-gray-300"
              title="Очистить кеш"
            >
              <Icon name="RefreshCw" size={16} />
            </Button>
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

                {currentUser.id === 'mock_admin' && (
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
                  onClick={async () => {
                    if (currentUser) {
                      await authService.logout();
                      setCurrentUser(null);
                    }
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
                    ${gameState?.totalPot.toFixed(2) || '0.00'}
                  </h2>
                  <div className="text-lg text-purple-300">
                    {getStatusText()}
                  </div>

                  {gameState?.countdown && gameState.countdown > 0 && (
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-purple-500/30"></div>
                      <div
                        className="absolute inset-0 rounded-full border-4 border-yellow-400 transition-all duration-1000"
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((2 * Math.PI * (60 - gameState.countdown)) / 60 - Math.PI / 2)}% ${50 + 50 * Math.sin((2 * Math.PI * (60 - gameState.countdown)) / 60 - Math.PI / 2)}%, 50% 0%)`,
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {gameState.countdown}
                        </span>
                      </div>
                    </div>
                  )}

                  {currentBets.length > 0 && (
                    <div className="mt-4">
                      <div className="text-lg text-purple-300 mb-2">
                        Текущие ставки: {currentBets.length}
                      </div>
                    </div>
                  )}

                  {gameState?.winner && (
                    <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <div className="text-xl font-bold text-green-400">
                        🎉 {onlineUsers.find(u => u.id === gameState.winner?.userId)?.name} выиграл $
                        {gameState.totalPot.toFixed(2)}!
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Betting */}
            {currentUser &&
              gameState?.status === "betting" && (
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
                          loading ||
                          !gameState ||
                          gameState.status !== "betting"
                        }
                      />
                      <Button
                        onClick={handleBet}
                        disabled={
                          loading ||
                          !betAmount ||
                          parseFloat(betAmount) <= 0 ||
                          parseFloat(betAmount) > currentUser.balance ||
                          !gameState ||
                          gameState.status !== "betting"
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
                        disabled={loading || !gameState || gameState.status !== "betting"}
                      >
                        $10
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount("50")}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        disabled={loading || !gameState || gameState.status !== "betting"}
                      >
                        $50
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount("100")}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        disabled={loading || !gameState || gameState.status !== "betting"}
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
                  Участники ({currentBets.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentBets.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    Пока нет участников
                  </div>
                ) : (
                  currentBets.map((bet, index) => {
                    const user = onlineUsers.find(u => u.id === bet.userId);
                    const totalPot = gameState?.totalPot || 0;
                    const chance = totalPot > 0 ? (bet.amount / totalPot) * 100 : 0;
                    
                    return (
                      <div
                        key={bet.id}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{user?.avatar || '👤'}</div>
                          <div>
                            <div className="font-medium flex items-center space-x-2">
                              <span>{user?.name || 'Неизвестный'}</span>
                              <span className="text-xs text-gray-500">
                                (#{bet.userId.slice(-6)})
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {chance.toFixed(1)}%
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-400">
                              Шанс на победу
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400">
                            ${bet.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })
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

          {currentUser.id === 'mock_admin' && (
            <AdminPanel
              isOpen={adminPanelOpen}
              onClose={() => setAdminPanelOpen(false)}
              users={users}
              promoCodes={promoCodes}
              onUpdateUser={adminUpdateUser}
              onCreatePromoCode={createPromoCode}
              onTogglePromoCode={togglePromoCode}
              onSetRiggedWinner={() => console.log('Rigging disabled in server mode')}
              riggedWinnerId={riggedWinnerId}
            />
          )}
        </>
      )}
    </div>
  );
};

export default JackpotPage;