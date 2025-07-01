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
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";
import { User } from "@/types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
  onActivatePromo: (code: string) => boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onActivatePromo,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [newAvatar, setNewAvatar] = useState(user.avatar);
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");

  const avatarOptions = [
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
    "🎭",
    "🎨",
    "🎸",
    "🎹",
    "🎺",
    "🎻",
  ];

  const handleSave = () => {
    onUpdateUser({ name: newName, avatar: newAvatar });
    setEditMode(false);
  };

  const handlePromoActivation = () => {
    if (!promoCode.trim()) return;

    const success = onActivatePromo(promoCode.trim().toUpperCase());
    if (success) {
      setPromoMessage("✅ Промокод успешно активирован!");
      setPromoCode("");
    } else {
      setPromoMessage("❌ Промокод недействителен или уже использован");
    }

    setTimeout(() => setPromoMessage(""), 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 border-purple-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 flex items-center">
            <Icon name="User" className="mr-2" size={20} />
            Профиль пользователя
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-sm text-gray-300">
                Информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                  {user.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Дата регистрации:</span>
                <span className="text-sm">
                  {new Date(user.joinedAt).toLocaleDateString()}
                </span>
              </div>

              <Separator className="bg-gray-700" />

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Всего ставок:</span>
                <span className="text-green-400 font-bold">
                  {user.totalBets}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Выигрышей:</span>
                <span className="text-green-400 font-bold">
                  {user.totalWins}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Винрейт:</span>
                <span className="text-blue-400 font-bold">
                  {user.totalBets > 0
                    ? ((user.totalWins / user.totalBets) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile */}
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-sm text-gray-300 flex items-center justify-between">
                Настройки профиля
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <Icon name="Edit" size={16} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editMode ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-gray-400">Никнейм</Label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      maxLength={20}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400">Аватар</Label>
                    <div className="grid grid-cols-8 gap-2">
                      {avatarOptions.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => setNewAvatar(avatar)}
                          className={`text-2xl p-2 rounded border-2 transition-colors ${
                            newAvatar === avatar
                              ? "border-yellow-400 bg-yellow-400/20"
                              : "border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Сохранить
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditMode(false);
                        setNewName(user.name);
                        setNewAvatar(user.avatar);
                      }}
                      className="border-gray-600 text-gray-300"
                    >
                      Отмена
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{user.avatar}</div>
                  <div>
                    <div className="font-bold">{user.name}</div>
                    <div className="text-sm text-gray-400">
                      Текущие настройки
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Promo Codes */}
          <Card className="bg-black/40 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-sm text-gray-300 flex items-center">
                <Icon name="Gift" className="mr-2" size={16} />
                Промокод
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Введите промокод"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Button
                  onClick={handlePromoActivation}
                  disabled={!promoCode.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Активировать
                </Button>
              </div>
              {promoMessage && (
                <div className="text-sm p-2 rounded bg-gray-800/50">
                  {promoMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
