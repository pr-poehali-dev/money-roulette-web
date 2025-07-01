import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

const numbers = [
  { value: 0, color: "green" },
  { value: 32, color: "red" },
  { value: 15, color: "black" },
  { value: 19, color: "red" },
  { value: 4, color: "black" },
  { value: 21, color: "red" },
  { value: 2, color: "black" },
  { value: 25, color: "red" },
  { value: 17, color: "black" },
  { value: 34, color: "red" },
  { value: 6, color: "black" },
  { value: 27, color: "red" },
  { value: 13, color: "black" },
  { value: 36, color: "red" },
  { value: 11, color: "black" },
  { value: 30, color: "red" },
  { value: 8, color: "black" },
  { value: 23, color: "red" },
  { value: 10, color: "black" },
  { value: 5, color: "red" },
  { value: 24, color: "black" },
  { value: 16, color: "red" },
  { value: 33, color: "black" },
  { value: 1, color: "red" },
  { value: 20, color: "black" },
  { value: 14, color: "red" },
  { value: 31, color: "black" },
  { value: 9, color: "red" },
  { value: 22, color: "black" },
  { value: 18, color: "red" },
  { value: 29, color: "black" },
  { value: 7, color: "red" },
  { value: 28, color: "black" },
  { value: 12, color: "red" },
  { value: 35, color: "black" },
  { value: 3, color: "red" },
  { value: 26, color: "black" },
];

export default function Roulette() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
    const spins = 5 + Math.random() * 5;
    const finalRotation = rotation + spins * 360 + Math.random() * 360;

    setRotation(finalRotation);

    setTimeout(() => {
      setResult(randomNumber.value);
      setIsSpinning(false);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-casino-dark via-purple-900 to-casino-dark p-4">
      <div className="relative">
        {/* Outer ring */}
        <div className="relative w-80 h-80 rounded-full border-4 border-casino-gold shadow-2xl shadow-casino-neon/50">
          {/* Roulette wheel */}
          <div
            className={`w-full h-full rounded-full bg-gradient-to-br from-casino-gold via-yellow-600 to-casino-gold relative overflow-hidden transition-transform duration-[4000ms] ease-out ${isSpinning ? "animate-spin-slow" : ""}`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Numbers around the wheel */}
            {numbers.map((num, index) => {
              const angle = (index * 360) / numbers.length;
              const isRed = num.color === "red";
              const isGreen = num.color === "green";

              return (
                <div
                  key={index}
                  className="absolute w-6 h-6 flex items-center justify-center text-xs font-bold text-white rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-130px)`,
                    backgroundColor: isGreen
                      ? "#10B981"
                      : isRed
                        ? "#EF4444"
                        : "#1F2937",
                  }}
                >
                  {num.value}
                </div>
              );
            })}

            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-casino-dark rounded-full border-4 border-casino-gold flex items-center justify-center">
              <Icon name="Crown" className="text-casino-gold" size={24} />
            </div>
          </div>

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-casino-gold z-10"></div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-casino-neon/20 blur-xl animate-pulse-glow"></div>
      </div>

      {/* Result display */}
      {result !== null && (
        <Card className="mt-8 p-6 bg-casino-dark/90 border-casino-gold">
          <div className="text-center">
            <div className="text-2xl font-heading font-bold text-casino-gold mb-2">
              Выпало число
            </div>
            <div className="text-6xl font-heading font-bold text-white mb-4">
              {result}
            </div>
            <div
              className={`text-lg font-semibold ${
                numbers.find((n) => n.value === result)?.color === "red"
                  ? "text-casino-red"
                  : numbers.find((n) => n.value === result)?.color === "green"
                    ? "text-casino-green"
                    : "text-gray-300"
              }`}
            >
              {numbers.find((n) => n.value === result)?.color === "red"
                ? "Красное"
                : numbers.find((n) => n.value === result)?.color === "green"
                  ? "Зеро"
                  : "Черное"}
            </div>
          </div>
        </Card>
      )}

      {/* Spin button */}
      <Button
        onClick={spin}
        disabled={isSpinning}
        className="mt-8 px-8 py-3 bg-gradient-to-r from-casino-gold to-yellow-600 hover:from-yellow-600 hover:to-casino-gold text-casino-dark font-heading font-bold text-lg shadow-lg shadow-casino-gold/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSpinning ? (
          <>
            <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
            Крутим...
          </>
        ) : (
          <>
            <Icon name="Play" className="mr-2" size={20} />
            Крутить рулетку
          </>
        )}
      </Button>
    </div>
  );
}
