import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface Bet {
  type: string;
  amount: number;
  odds: number;
}

export default function BettingPanel() {
  const [balance, setBalance] = useState(10000);
  const [currentBet, setCurrentBet] = useState(100);
  const [activeBets, setActiveBets] = useState<Bet[]>([]);

  const betOptions = [
    { name: "Красное", odds: 2, color: "bg-casino-red" },
    { name: "Черное", odds: 2, color: "bg-gray-800" },
    { name: "Четное", odds: 2, color: "bg-casino-purple" },
    { name: "Нечетное", odds: 2, color: "bg-casino-neon" },
    { name: "1-18", odds: 2, color: "bg-blue-600" },
    { name: "19-36", odds: 2, color: "bg-green-600" },
  ];

  const placeBet = (betType: string, odds: number) => {
    if (balance >= currentBet) {
      setActiveBets([
        ...activeBets,
        { type: betType, amount: currentBet, odds },
      ]);
      setBalance(balance - currentBet);
    }
  };

  const clearBets = () => {
    const totalReturn = activeBets.reduce((sum, bet) => sum + bet.amount, 0);
    setBalance(balance + totalReturn);
    setActiveBets([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-casino-dark to-purple-900 border-casino-gold p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="Wallet" className="text-casino-gold" size={24} />
            <div>
              <div className="text-sm text-gray-400">Баланс</div>
              <div className="text-2xl font-heading font-bold text-casino-gold">
                {balance.toLocaleString()} ₽
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Icon name="TrendingUp" className="text-casino-green" size={24} />
            <div className="text-right">
              <div className="text-sm text-gray-400">Общий выигрыш</div>
              <div className="text-xl font-bold text-casino-green">
                +2,340 ₽
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Bet Amount */}
      <Card className="bg-casino-dark/90 border-casino-gold/30 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="text-sm text-gray-400 mb-2 block">
              Размер ставки
            </label>
            <Input
              type="number"
              value={currentBet}
              onChange={(e) => setCurrentBet(Number(e.target.value))}
              className="bg-casino-dark border-casino-gold/50 text-white"
              min="10"
              max={balance}
            />
          </div>
          <div className="flex space-x-2">
            {[100, 500, 1000, 5000].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setCurrentBet(amount)}
                className="border-casino-gold/50 text-casino-gold hover:bg-casino-gold hover:text-casino-dark"
              >
                {amount}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Betting Options */}
      <Card className="bg-casino-dark/90 border-casino-gold/30 p-6">
        <div className="mb-4">
          <h3 className="text-xl font-heading font-bold text-casino-gold mb-2">
            Варианты ставок
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {betOptions.map((option) => (
            <Button
              key={option.name}
              onClick={() => placeBet(option.name, option.odds)}
              className={`${option.color} hover:scale-105 transition-transform duration-200 p-4 h-auto flex flex-col space-y-2`}
              disabled={balance < currentBet}
            >
              <span className="font-heading font-bold text-white">
                {option.name}
              </span>
              <Badge
                variant="secondary"
                className="bg-black/30 text-casino-gold"
              >
                x{option.odds}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Active Bets */}
        {activeBets.length > 0 && (
          <div className="border-t border-casino-gold/30 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-heading font-semibold text-casino-gold">
                Активные ставки ({activeBets.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={clearBets}
                className="border-casino-red text-casino-red hover:bg-casino-red hover:text-white"
              >
                <Icon name="X" size={16} className="mr-1" />
                Очистить
              </Button>
            </div>

            <div className="space-y-2">
              {activeBets.map((bet, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-casino-dark/50 rounded-lg p-3 border border-casino-gold/20"
                >
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant="outline"
                      className="border-casino-gold text-casino-gold"
                    >
                      {bet.type}
                    </Badge>
                    <span className="text-white">{bet.amount} ₽</span>
                  </div>
                  <div className="text-casino-green font-semibold">
                    Выигрыш: {bet.amount * bet.odds} ₽
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <div className="text-sm text-gray-400">Общая сумма ставок</div>
              <div className="text-xl font-bold text-casino-gold">
                {activeBets.reduce((sum, bet) => sum + bet.amount, 0)} ₽
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
