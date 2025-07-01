import React, { useEffect, useState } from "react";
import { Player } from "@/types";

interface RouletteWheelProps {
  players: Player[];
  isSpinning: boolean;
  winner: Player | null;
  onSpinComplete?: () => void;
}

const RouletteWheel: React.FC<RouletteWheelProps> = ({
  players,
  isSpinning,
  winner,
  onSpinComplete,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Создаем массив сегментов на основе шансов игроков
  const createSegments = () => {
    const segments: Array<{
      player: Player;
      width: number;
      startAngle: number;
      endAngle: number;
    }> = [];
    let currentAngle = 0;

    players.forEach((player) => {
      const segmentWidth = (player.chance / 100) * 360;
      segments.push({
        player,
        width: segmentWidth,
        startAngle: currentAngle,
        endAngle: currentAngle + segmentWidth,
      });
      currentAngle += segmentWidth;
    });

    return segments;
  };

  const segments = createSegments();

  // Запуск анимации когда начинается прокрутка
  useEffect(() => {
    if (isSpinning && !isAnimating) {
      setIsAnimating(true);

      // Определяем угол победителя
      let winnerAngle = 0;
      if (winner) {
        const winnerSegment = segments.find(
          (s) => s.player.userId === winner.userId,
        );
        if (winnerSegment) {
          // Берем середину сегмента победителя
          winnerAngle = winnerSegment.startAngle + winnerSegment.width / 2;
        }
      }

      // Добавляем несколько полных оборотов + точный угол победителя
      const finalRotation = 360 * 5 + (360 - winnerAngle); // 5 полных оборотов

      setTimeout(() => {
        setRotation(finalRotation);
      }, 100);

      // Завершение анимации
      setTimeout(() => {
        setIsAnimating(false);
        if (onSpinComplete) {
          onSpinComplete();
        }
      }, 3000);
    }
  }, [isSpinning, winner, segments]);

  // Генерация цветов для сегментов
  const getSegmentColor = (index: number) => {
    const colors = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#06b6d4",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f59e0b",
      "#10b981",
      "#6366f1",
      "#d946ef",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Рулетка */}
      <svg
        className={`w-full h-full transition-transform duration-3000 ease-out ${
          isAnimating ? "animate-spin-custom" : ""
        }`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transitionDuration: isAnimating ? "3s" : "0s",
        }}
        viewBox="0 0 400 400"
      >
        {segments.map((segment, index) => {
          const startAngleRad = (segment.startAngle * Math.PI) / 180;
          const endAngleRad = (segment.endAngle * Math.PI) / 180;
          const largeArcFlag = segment.width > 180 ? 1 : 0;

          const x1 = 200 + 180 * Math.cos(startAngleRad);
          const y1 = 200 + 180 * Math.sin(startAngleRad);
          const x2 = 200 + 180 * Math.cos(endAngleRad);
          const y2 = 200 + 180 * Math.sin(endAngleRad);

          const midAngleRad =
            (((segment.startAngle + segment.endAngle) / 2) * Math.PI) / 180;
          const textX = 200 + 120 * Math.cos(midAngleRad);
          const textY = 200 + 120 * Math.sin(midAngleRad);

          return (
            <g key={`${segment.player.userId}-${index}`}>
              <path
                d={`M 200 200 L ${x1} ${y1} A 180 180 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={getSegmentColor(index)}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
              />
              <text
                x={textX}
                y={textY - 10}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="24"
                fontWeight="bold"
              >
                {segment.player.avatar}
              </text>
              <text
                x={textX}
                y={textY + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {segment.player.name}
              </text>
              <text
                x={textX}
                y={textY + 20}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="8"
              >
                {segment.player.chance.toFixed(1)}%
              </text>
            </g>
          );
        })}

        {/* Внешний круг */}
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="4"
        />
      </svg>

      {/* Указатель */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
      </div>

      {/* Центральный круг */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-4 border-white flex items-center justify-center">
        <span className="text-2xl">🎲</span>
      </div>

      {/* Статус */}
      {isSpinning && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-yellow-400 font-bold animate-pulse">
            Прокручиваем...
          </div>
        </div>
      )}
    </div>
  );
};

export default RouletteWheel;
