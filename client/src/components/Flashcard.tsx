"use client";

import { useState, useEffect } from "react";

interface Flashcard {
  id: number;
  keyword: string;
  explanation: string;
}

const DUMMY_FLASHCARDS: Flashcard[] = [
  { id: 1, keyword: "Entropy", explanation: "The total amount of information of the messages emitted from source." },
  { id: 2, keyword: "Axis labels", explanation: "Text labels that describe what each axis represents in a visualization." },
  { id: 3, keyword: "Data Binding", explanation: "The process of connecting data to visual elements in a chart or graph." },
  { id: 4, keyword: "Matplotlib", explanation: "A comprehensive library for creating static, animated, and interactive visualizations in Python." },
  { id: 5, keyword: "Pyplot", explanation: "A state-based interface to matplotlib that provides a MATLAB-like way of plotting." },
];

type Category = "learning" | "reviewing" | "known";

export default function Flashcards() {
  const [cards] = useState<Flashcard[]>(DUMMY_FLASHCARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Track category assignment for each card
  const [cardCategories, setCardCategories] = useState<Record<number, Category>>(
    () => {
      const initial: Record<number, Category> = {};
      cards.forEach((c) => (initial[c.id] = "reviewing")); // all start in reviewing
      return initial;
    }
  );

  // Derived counts
  const learning = Object.values(cardCategories).filter((c) => c === "learning").length;
  const reviewing = Object.values(cardCategories).filter((c) => c === "reviewing").length;
  const known = Object.values(cardCategories).filter((c) => c === "known").length;

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const markCard = (type: Category) => {
    const cardId = currentCard.id;

    // Only update if the category actually changes
    if (cardCategories[cardId] !== type) {
      setCardCategories((prev) => ({ ...prev, [cardId]: type }));
    }

    // Move to next card
    setCurrentIndex((prev) => (prev + 1) % cards.length);
    setIsFlipped(false);
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          handleFlip();
          break;
        case "ArrowLeft":
          e.preventDefault();
          markCard("learning");
          break;
        case "ArrowUp":
          e.preventDefault();
          markCard("reviewing");
          break;
        case "ArrowRight":
          e.preventDefault();
          markCard("known");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCard]);

  return (
    <div className="h-[calc(100vh-theme(spacing.navbar))] mt-navbar ml-sidebar">
      <div className="p-6">
        {/* Tab Bar */}
        <div className="flex gap-6 mb-8">
          {["List", "Deck", "Games"].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-full transition-smooth ${
                tab === "Deck"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Progress Counters */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-2xl">
            <span className="text-3xl font-bold text-blue-600">{learning}</span>
            <span className="text-blue-600 font-medium">Learning</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 rounded-2xl">
            <span className="text-3xl font-bold text-indigo-600">{reviewing}</span>
            <span className="text-indigo-600 font-medium">Reviewing</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-2xl">
            <span className="text-3xl font-bold text-green-600">{known}</span>
            <span className="text-green-600 font-medium">Known</span>
          </div>
          <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
            ⚙️
          </button>
        </div>

        {/* Flashcard */}
        <div className="flex flex-col items-center">
          <div
            className="w-full max-w-2xl h-80 cursor-pointer mb-8"
            onClick={handleFlip}
          >
            {isFlipped ? (
              // Back of card → explanation
              <div className="flex items-center justify-center w-full h-full bg-muted border rounded-3xl shadow-medium px-8">
                <p className="text-xl text-center text-muted-foreground leading-relaxed">
                  {currentCard.explanation}
                </p>
              </div>
            ) : (
              // Front of card → keyword
              <div className="flex items-center justify-center w-full h-full bg-card border rounded-3xl shadow-medium">
                <h2 className="text-4xl font-bold text-center px-8">
                  {currentCard.keyword}
                </h2>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-6 mb-6">
            <button
              onClick={() => markCard("learning")}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white text-2xl flex items-center justify-center transition-smooth shadow-medium"
              aria-label="Incorrect"
            >
              ✕
            </button>
            <button
              onClick={() => markCard("reviewing")}
              className="w-16 h-16 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white text-2xl flex items-center justify-center transition-smooth shadow-medium"
              aria-label="Not sure"
            >
              😐
            </button>
            <button
              onClick={() => markCard("known")}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white text-2xl flex items-center justify-center transition-smooth shadow-medium"
              aria-label="Correct"
            >
              😊
            </button>
          </div>

          {/* Progress and Navigation Hints */}
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <div className="flex items-center gap-4">
              <span>← For incorrect</span>
              <span>↑ For not sure</span>
              <span>→ For correct</span>
              <span>↓ To flip the card</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
