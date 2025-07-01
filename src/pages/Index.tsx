import Roulette from "@/components/Roulette";
import BettingPanel from "@/components/BettingPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-dark via-purple-900 to-casino-dark">
      {/* Header */}
      <header className="border-b border-casino-gold/30 bg-casino-dark/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-casino-gold to-yellow-600 rounded-full flex items-center justify-center">
                <Icon name="Crown" className="text-casino-dark" size={20} />
              </div>
              <h1 className="text-2xl font-heading font-bold text-casino-gold">
                Royal Roulette
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className="border-casino-gold text-casino-gold hover:bg-casino-gold hover:text-casino-dark"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Пополнить
              </Button>
              <Button
                variant="outline"
                className="border-casino-purple text-casino-purple hover:bg-casino-purple hover:text-white"
              >
                <Icon name="Minus" size={16} className="mr-2" />
                Вывести
              </Button>
              <Button
                variant="outline"
                className="border-casino-neon text-casino-neon hover:bg-casino-neon hover:text-white"
              >
                <Icon name="User" size={16} className="mr-2" />
                Профиль
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Roulette Section */}
          <div className="flex flex-col">
            <Card className="bg-casino-dark/50 border-casino-gold/30 p-6 mb-6">
              <div className="text-center mb-4">
                <h2 className="text-3xl font-heading font-bold text-casino-gold mb-2">
                  Европейская рулетка
                </h2>
                <p className="text-gray-400">
                  Сделайте ставку и испытайте удачу на колесе фортуны
                </p>
              </div>
            </Card>

            <div className="flex-1">
              <Roulette />
            </div>
          </div>

          {/* Betting Panel */}
          <div className="space-y-6">
            <BettingPanel />

            {/* Quick Stats */}
            <Card className="bg-casino-dark/50 border-casino-gold/30 p-6">
              <h3 className="text-xl font-heading font-bold text-casino-gold mb-4">
                Быстрая статистика
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-casino-dark/50 rounded-lg border border-casino-red/30">
                  <div className="text-2xl font-bold text-casino-red mb-1">
                    12
                  </div>
                  <div className="text-sm text-gray-400">Красные</div>
                </div>

                <div className="text-center p-3 bg-casino-dark/50 rounded-lg border border-gray-600">
                  <div className="text-2xl font-bold text-white mb-1">8</div>
                  <div className="text-sm text-gray-400">Черные</div>
                </div>

                <div className="text-center p-3 bg-casino-dark/50 rounded-lg border border-casino-green/30">
                  <div className="text-2xl font-bold text-casino-green mb-1">
                    1
                  </div>
                  <div className="text-sm text-gray-400">Зеро</div>
                </div>

                <div className="text-center p-3 bg-casino-dark/50 rounded-lg border border-casino-neon/30">
                  <div className="text-2xl font-bold text-casino-neon mb-1">
                    19
                  </div>
                  <div className="text-sm text-gray-400">Последний</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
