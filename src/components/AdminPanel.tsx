import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { User, PromoCode } from "@/types";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  promoCodes: PromoCode[];
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onCreatePromoCode: (code: PromoCode) => void;
  onTogglePromoCode: (code: string) => void;
  onSetRiggedWinner: (userId: string) => void;
  riggedWinnerId: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  users,
  promoCodes,
  onUpdateUser,
  onCreatePromoCode,
  onTogglePromoCode,
  onSetRiggedWinner,
  riggedWinnerId,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceChange, setBalanceChange] = useState("");
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoAmount, setNewPromoAmount] = useState("");
  const [newPromoMaxUses, setNewPromoMaxUses] = useState("");

  const handleBalanceUpdate = () => {
    if (!selectedUser || !balanceChange) return;

    const change = parseFloat(balanceChange);
    const newBalance = Math.max(0, selectedUser.balance + change);

    onUpdateUser(selectedUser.id, { balance: newBalance });
    setBalanceChange("");
    setSelectedUser(null);
  };

  const handleCreatePromo = () => {
    if (!newPromoCode || !newPromoAmount || !newPromoMaxUses) return;

    const promoCode: PromoCode = {
      code: newPromoCode.toUpperCase(),
      amount: parseFloat(newPromoAmount),
      maxUses: parseInt(newPromoMaxUses),
      usedBy: [],
      isActive: true,
    };

    onCreatePromoCode(promoCode);
    setNewPromoCode("");
    setNewPromoAmount("");
    setNewPromoMaxUses("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-900 border-red-500/30 text-white max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-red-400 flex items-center">
            <Icon name="Shield" className="mr-2" size={20} />
            Админ-панель
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-red-600"
            >
              Пользователи
            </TabsTrigger>
            <TabsTrigger
              value="rigging"
              className="data-[state=active]:bg-red-600"
            >
              Подкрутка
            </TabsTrigger>
            <TabsTrigger
              value="promo"
              className="data-[state=active]:bg-red-600"
            >
              Промокоды
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id} className="bg-black/40 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{user.avatar}</div>
                        <div>
                          <div className="font-bold flex items-center space-x-2">
                            <span>{user.name}</span>
                            {user.isAdmin && (
                              <Badge variant="destructive" className="text-xs">
                                ADMIN
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            ID: {user.id}
                          </div>
                          <div className="text-sm text-gray-400">
                            Баланс:{" "}
                            <span className="text-green-400">
                              ${user.balance.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm">
                          <div>Ставок: {user.totalBets}</div>
                          <div>Побед: {user.totalWins}</div>
                          <div>
                            Винрейт:{" "}
                            {user.totalBets > 0
                              ? (
                                  (user.totalWins / user.totalBets) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Icon name="Edit" size={16} className="mr-1" />
                          Изменить
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Balance Update Modal */}
            {selectedUser && (
              <Card className="bg-red-900/20 border-red-500/50">
                <CardHeader>
                  <CardTitle className="text-red-400">
                    Изменить баланс: {selectedUser.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Label className="text-gray-400">Текущий баланс:</Label>
                    <span className="text-green-400 font-bold">
                      ${selectedUser.balance.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">Изменение (+ или -)</Label>
                    <Input
                      type="number"
                      placeholder="например: +100 или -50"
                      value={balanceChange}
                      onChange={(e) => setBalanceChange(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label className="text-gray-400">Новый баланс:</Label>
                    <span className="text-yellow-400 font-bold">
                      $
                      {Math.max(
                        0,
                        selectedUser.balance + (parseFloat(balanceChange) || 0),
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleBalanceUpdate}
                      disabled={!balanceChange}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Применить
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(null);
                        setBalanceChange("");
                      }}
                      className="border-gray-600 text-gray-300"
                    >
                      Отмена
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rigging" className="space-y-4">
            <Card className="bg-black/40 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center">
                  <Icon name="Target" className="mr-2" size={20} />
                  Подкрутка результатов
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-400 mb-4">
                  Выберите игрока, который должен выиграть следующую игру
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="no-rigging"
                        name="rigging"
                        checked={!riggedWinnerId}
                        onChange={() => onSetRiggedWinner("")}
                        className="text-orange-500"
                      />
                      <label htmlFor="no-rigging" className="text-gray-300">
                        Без подкрутки (случайный результат)
                      </label>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-600/20 text-green-400"
                    >
                      Честная игра
                    </Badge>
                  </div>

                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        riggedWinnerId === user.id
                          ? "bg-orange-600/20 border border-orange-600/50"
                          : "bg-gray-800/50 hover:bg-gray-800/70"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id={`rigging-${user.id}`}
                          name="rigging"
                          checked={riggedWinnerId === user.id}
                          onChange={() => onSetRiggedWinner(user.id)}
                          className="text-orange-500"
                        />
                        <div className="text-2xl">{user.avatar}</div>
                        <div>
                          <label
                            htmlFor={`rigging-${user.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {user.name}
                          </label>
                          <div className="text-sm text-gray-400">
                            ID: {user.id} • Баланс: ${user.balance.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {riggedWinnerId === user.id && (
                        <Badge variant="destructive" className="bg-orange-600">
                          Победитель
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                {riggedWinnerId && (
                  <div className="p-4 bg-orange-600/20 border border-orange-600/50 rounded-lg">
                    <div className="flex items-center space-x-2 text-orange-400">
                      <Icon name="AlertTriangle" size={16} />
                      <span className="font-medium">Внимание!</span>
                    </div>
                    <div className="text-sm text-orange-300 mt-1">
                      Следующую игру выиграет:{" "}
                      {users.find((u) => u.id === riggedWinnerId)?.name}
                    </div>
                    <div className="text-xs text-orange-200 mt-1">
                      Подкрутка автоматически отключится после игры
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promo" className="space-y-4">
            {/* Create Promo Code */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400">
                  Создать промокод
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400">Код</Label>
                    <Input
                      placeholder="BONUS100"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">Сумма ($)</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={newPromoAmount}
                      onChange={(e) => setNewPromoAmount(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">Макс. использований</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={newPromoMaxUses}
                      onChange={(e) => setNewPromoMaxUses(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreatePromo}
                  disabled={
                    !newPromoCode || !newPromoAmount || !newPromoMaxUses
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Создать промокод
                </Button>
              </CardContent>
            </Card>

            {/* Existing Promo Codes */}
            <div className="space-y-3">
              {promoCodes.map((promo) => (
                <Card key={promo.code} className="bg-black/40 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="font-mono text-lg font-bold text-purple-400">
                          {promo.code}
                        </div>
                        <Badge
                          variant={promo.isActive ? "default" : "secondary"}
                        >
                          {promo.isActive ? "Активен" : "Отключен"}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <div className="text-green-400">+${promo.amount}</div>
                          <div className="text-gray-400">
                            {promo.usedBy.length}/{promo.maxUses} использований
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onTogglePromoCode(promo.code)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          {promo.isActive ? "Отключить" : "Включить"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
