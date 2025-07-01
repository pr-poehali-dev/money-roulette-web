import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { GameHistory, BetHistory } from "@/types";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameHistory: GameHistory[];
  betHistory: BetHistory[];
  userId?: string;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  gameHistory,
  betHistory,
  userId,
}) => {
  const userBetHistory = userId
    ? betHistory.filter((bet) => bet.userId === userId)
    : betHistory;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-900 border-purple-500/30 text-white max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-purple-400 flex items-center">
            <Icon name="History" className="mr-2" size={20} />
            История игр
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger
              value="games"
              className="data-[state=active]:bg-purple-600"
            >
              Последние игры
            </TabsTrigger>
            <TabsTrigger
              value="bets"
              className="data-[state=active]:bg-purple-600"
            >
              {userId ? "Мои ставки" : "Все ставки"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-4">
            {gameHistory.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                История игр пуста
              </div>
            ) : (
              gameHistory.slice(0, 5).map((game) => (
                <Card key={game.id} className="bg-black/40 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-yellow-400">
                        Игра #{game.id.slice(-6)}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(game.finishedAt).toLocaleString()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-green-400">
                        Банк: ${game.totalPot.toFixed(2)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon
                          name="Crown"
                          className="text-yellow-400"
                          size={20}
                        />
                        <span className="text-yellow-400 font-bold">
                          {game.winner.name}
                        </span>
                        <span className="text-lg">{game.winner.avatar}</span>
                        <Badge
                          variant="secondary"
                          className="bg-yellow-600/20 text-yellow-400"
                        >
                          {game.winner.chance.toFixed(1)}% шанс
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-400 font-medium">
                        Участники ({game.players.length}):
                      </div>
                      <div className="grid gap-2">
                        {game.players.map((player) => (
                          <div
                            key={player.id}
                            className={`flex items-center justify-between p-2 rounded ${
                              player.userId === game.winner.userId
                                ? "bg-yellow-600/20 border border-yellow-600/50"
                                : "bg-gray-800/50"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{player.avatar}</span>
                              <span className="font-medium">{player.name}</span>
                              {player.userId === game.winner.userId && (
                                <Icon
                                  name="Crown"
                                  className="text-yellow-400"
                                  size={16}
                                />
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-green-400 font-bold">
                                ${player.bet.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-400">
                                {player.chance.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="bets" className="space-y-4">
            {userBetHistory.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                История ставок пуста
              </div>
            ) : (
              userBetHistory.slice(0, 20).map((bet) => (
                <Card key={bet.id} className="bg-black/40 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            bet.won ? "bg-green-400" : "bg-red-400"
                          }`}
                        ></div>
                        <div>
                          <div className="font-medium">
                            Ставка ${bet.amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-400">
                            Игра #{bet.gameId.slice(-6)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge
                          variant={bet.won ? "default" : "destructive"}
                          className={bet.won ? "bg-green-600" : "bg-red-600"}
                        >
                          {bet.won ? "Победа" : "Поражение"}
                        </Badge>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(bet.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal;
