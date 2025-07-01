import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";

interface Player {
  id: string;
  name: string;
  avatar: string;
  bet: number;
  chance: number;
}

interface GameState {
  players: Player[];
  totalPot: number;
  timeLeft: number;
  gameStatus: "waiting" | "countdown" | "spinning" | "finished";
  winner: Player | null;
}

const JackpotPage = () => {
  const [user, setUser] = useState<{
    name: string;
    balance: number;
    avatar: string;
  } | null>(null);
  const [betAmount, setBetAmount] = useState<string>("");
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    totalPot: 0,
    timeLeft: 0,
    gameStatus: "waiting",
    winner: null,
  });

  // Mock Telegram auth
  const handleTelegramAuth = () => {
    setUser({
      name: "User" + Math.floor(Math.random() * 1000),
      balance: 1000,
      avatar: "👤",
    });
  };

  // Add bet
  const handleBet = () => {
    if (
      !user ||
      !betAmount ||
      parseFloat(betAmount) <= 0 ||
      parseFloat(betAmount) > user.balance
    )
      return;

    const bet = parseFloat(betAmount);
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: user.name,
      avatar: user.avatar,
      bet,
      chance: 0,
    };

    setGameState((prev) => {
      const newPlayers = [...prev.players, newPlayer];
      const newTotalPot = prev.totalPot + bet;

      // Calculate chances
      const playersWithChances = newPlayers.map((player) => ({
        ...player,
        chance: (player.bet / newTotalPot) * 100,
      }));

      // Start countdown if we have 2+ players
      let newStatus = prev.gameStatus;
      let newTimeLeft = prev.timeLeft;

      if (newPlayers.length >= 2 && prev.gameStatus === "waiting") {
        newStatus = "countdown";
        newTimeLeft = 30;
      }

      return {
        ...prev,
        players: playersWithChances,
        totalPot: newTotalPot,
        gameStatus: newStatus,
        timeLeft: newTimeLeft,
      };
    });

    setUser((prev) => (prev ? { ...prev, balance: prev.balance - bet } : null));
    setBetAmount("");
  };

  // Timer countdown
  useEffect(() => {
    if (gameState.gameStatus === "countdown" && gameState.timeLeft > 0) {
      const timer = setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
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
    setGameState((prev) => ({ ...prev, gameStatus: "spinning" }));

    // Simulate spinning for 3 seconds
    setTimeout(() => {
      const random = Math.random() * gameState.totalPot;
      let cumulative = 0;
      let winner = gameState.players[0];

      for (const player of gameState.players) {
        cumulative += player.bet;
        if (random <= cumulative) {
          winner = player;
          break;
        }
      }

      setGameState((prev) => ({
        ...prev,
        gameStatus: "finished",
        winner,
      }));

      // Reset after 10 seconds
      setTimeout(() => {
        setGameState({
          players: [],
          totalPot: 0,
          timeLeft: 0,
          gameStatus: "waiting",
          winner: null,
        });
      }, 10000);
    }, 3000);
  };

  const getStatusText = () => {
    switch (gameState.gameStatus) {
      case "waiting":
        return `Ожидание игроков (${gameState.players.length}/2)`;
      case "countdown":
        return `Начало через ${gameState.timeLeft}с`;
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
          <div className="flex items-center space-x-2">
            <Icon name="Crown" className="text-yellow-400" size={28} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              JACKPOT ROULETTE
            </h1>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-300">{user.name}</div>
                <div className="text-lg font-bold text-green-400">
                  ${user.balance.toFixed(2)}
                </div>
              </div>
              <div className="text-2xl">{user.avatar}</div>
            </div>
          ) : (
            <Button
              onClick={handleTelegramAuth}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Icon name="MessageCircle" className="mr-2" size={20} />
              Войти через Telegram
            </Button>
          )}
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
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((2 * Math.PI * (30 - gameState.timeLeft)) / 30 - Math.PI / 2)}% ${50 + 50 * Math.sin((2 * Math.PI * (30 - gameState.timeLeft)) / 30 - Math.PI / 2)}%, 50% 0%)`,
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {gameState.timeLeft}
                        </span>
                      </div>
                    </div>
                  )}

                  {gameState.gameStatus === "spinning" && (
                    <div className="w-32 h-32 mx-auto">
                      <div className="animate-spin rounded-full h-32 w-32 border-8 border-yellow-400 border-t-transparent"></div>
                    </div>
                  )}

                  {gameState.winner && (
                    <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <div className="text-xl font-bold text-green-400">
                        🎉 {gameState.winner.name} выиграл $
                        {gameState.totalPot.toFixed(2)}!
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Betting */}
            {user && gameState.gameStatus === "waiting" && (
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
                    />
                    <Button
                      onClick={handleBet}
                      disabled={
                        !betAmount ||
                        parseFloat(betAmount) <= 0 ||
                        parseFloat(betAmount) > user.balance
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
                    >
                      $10
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAmount("50")}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      $50
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAmount("100")}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      $100
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAmount(user.balance.toString())}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      ALL IN
                    </Button>
                  </div>
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
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-gray-400">
                            {player.chance.toFixed(1)}% шанс
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

            {/* Game Rules */}
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Icon name="Info" className="mr-2" size={20} />
                  Правила игры
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-300">
                <p>• Минимум 2 игрока для старта</p>
                <p>• Таймер 30 секунд после 2-й ставки</p>
                <p>• Шанс победы = ваша ставка / общий банк</p>
                <p>• Победитель забирает весь банк</p>
                <p>• Комиссия сайта: 5%</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JackpotPage;
