"use client";
import { useState, useEffect, useRef } from "react";


export default function Pomodoro({
  onClose,
}: {
  onClose: () => void;
}) {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);

  const intervalRef = useRef<number | null>(null);

  // When user changes workMinutes or breakMinutes and timer not running, reset timeLeft
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft((isWorkTime ? workMinutes : breakMinutes) * 60);
    }
  }, [workMinutes, breakMinutes]);

  // Countdown logic
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          // completed interval
          playAlert();
          const nextIsWork = !isWorkTime;
          setIsWorkTime(nextIsWork);
          return (nextIsWork ? workMinutes : breakMinutes) * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }
  };
  }, [isRunning, isWorkTime]);

  const playAlert = () => {
    alert(isWorkTime ? "Work interval is over! Time for a break 🌴" : "Break is over! Back to work 💪");
    // You can also play custom audio here if preferred
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (intervalRef.current !== null) {
    window.clearInterval(intervalRef.current);
  }
  };

  const handleReset = () => {
    handleStop();
    setIsWorkTime(true);
    setTimeLeft(workMinutes * 60);
  };

  const formatTime = (sec: number) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  return (
    <div className="fixed bottom-4 right-4 w-72 bg-white shadow-lg rounded-xl p-4 z-50">
        <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-black"
        aria-label="Close"
      >
        ×
      </button>
      <h3 className="font-bold text-lg mb-2 text-center">Pomodoro Timer</h3>
      <div className="flex justify-between gap-2 mb-3">
        <div>
          <label className="block text-xs font-medium mb-1">Work (min)</label>
          <input
            type="number"
            min={1}
            className="border p-1 rounded w-full"
            value={workMinutes}
            disabled={isRunning}
            onChange={(e) => setWorkMinutes(+e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Break (min)</label>
          <input
            type="number"
            min={1}
            className="border p-1 rounded w-full"
            value={breakMinutes}
            disabled={isRunning}
            onChange={(e) => setBreakMinutes(+e.target.value)}
          />
        </div>
      </div>

      <div className="text-center text-4xl font-mono mb-4">
        {formatTime(timeLeft)}
      </div>

      <div className="flex justify-center gap-2">
        {!isRunning ? (
          <button className="px-4 py-2 rounded bg-green-500 text-white" onClick={handleStart}>
            Start
          </button>
        ) : (
          <button className="px-4 py-2 rounded bg-red-500 text-white" onClick={handleStop}>
            Stop
          </button>
        )}
        <button className="px-4 py-2 rounded bg-gray-300" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
