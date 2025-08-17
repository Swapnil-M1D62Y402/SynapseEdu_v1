"use client";
import React, { useMemo, useState } from "react";
import { Check, X, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample question data
const SAMPLE_QUESTION_SET = {
  studyKitId: "kit_3f9a1b2c-7d4e-4a7b-9c1f-0e2a9d5f6b7c",
  title: "Agentic AI — Intro Kit",
  description: "Short kit created from RAG sources about Agentic AI",
  formatVersion: "1.1",
  createdAt: "2025-08-17T08:00:00.000Z",
  questions: [
    {
      id: "q_1a2b3c",
      questionId: 1,
      question: "What is the purpose of the `savefig()` function in Matplotlib?",
      choices: [
        { key: "A", text: "To display the figure on the screen" },
        { key: "B", text: "To save the current figure to a file" },
        { key: "C", text: "To clear the current figure" },
        { key: "D", text: "To create a new figure" },
      ],
      correctOption: "B",
      explanation: [
        "The savefig() function allows users to export visualizations created in Matplotlib to various file formats, enhancing sharing and presentation.",
        "Users can specify parameters such as file format, resolution, and bounding box to customize the saved output of their figures.",
      ],
      difficulty: "medium",
      tags: ["matplotlib", "visualization"],
      confidence: 0.88,
    },
    {
      id: "q_4d5e6f",
      questionId: 2,
      question: "Which is a good practice for RAG pipelines?",
      choices: [
        { key: "A", text: "Never cite the source" },
        { key: "B", text: "Return source excerpts with each generated answer" },
        { key: "C", text: "Always use unfiltered internet data" },
        { key: "D", text: "Use only a single document as context" },
      ],
      correctOption: "B",
      explanation: "Providing source excerpts improves transparency and allows users to verify the information provided.",
      difficulty: "easy",
      tags: ["rag", "best-practice"],
    },
    {
      id: "q_7g8h9i",
      questionId: 3,
      question: "What is Agentic AI?",
      choices: [
        { key: "A", text: "An AI that acts autonomously to complete multi-step tasks" },
        { key: "B", text: "A visual-only transformer model" },
        { key: "C", text: "A deterministic rule-based system" },
        { key: "D", text: "A hardware chip for machine learning" },
      ],
      correctOption: "A",
      explanation: [
        "Agentic AI coordinates actions and decisions over time.",
        "It can plan, execute, and adapt across multiple steps.",
        "This function is essential for preserving visualizations, enabling reproducibility, and facilitating the inclusion of plots in reports or publications.",
      ],
      difficulty: "hard",
      tags: ["agents", "generative-ai"],
      confidence: 0.92,
    },
  ],
};

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

function usePerLevelState() {
  // Define the levels as a union type
  type Level = "easy" | "medium" | "hard";

  // Define the types for the state objects
  const [indexByLevel, setIndexByLevel] = useState<Record<Level, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  const [answeredByLevel, setAnsweredByLevel] = useState<Record<Level, Record<string, boolean>>>({
    easy: {},
    medium: {},
    hard: {},
  });

  const [selectedByLevel, setSelectedByLevel] = useState<Record<Level, Record<string, string>>>({
    easy: {},
    medium: {},
    hard: {},
  });

  const getIndex = (lvl: Level) => indexByLevel[lvl];
  const setIndex = (lvl: Level, nextIndex: number) =>
    setIndexByLevel((s) => ({ ...s, [lvl]: nextIndex }));

  const markAnswered = (lvl: Level, qid: string, selectedKey: string) => {
    setAnsweredByLevel((s) => ({
      ...s,
      [lvl]: { ...s[lvl], [qid]: true },
    }));
    setSelectedByLevel((s) => ({
      ...s,
      [lvl]: { ...s[lvl], [qid]: selectedKey },
    }));
  };

  const isAnswered = (lvl: Level, qid: string) => !!answeredByLevel[lvl]?.[qid];
  const selectedFor = (lvl: Level, qid: string) => selectedByLevel[lvl]?.[qid];

  return { getIndex, setIndex, markAnswered, isAnswered, selectedFor };
}

export default function SmartStudy() {
  // Explicitly type the level state as "Level"
  const [level, setLevel] = useState<"easy" | "medium" | "hard">("easy");

  const { getIndex, setIndex, markAnswered, isAnswered, selectedFor } = usePerLevelState();

  // Filter questions by difficulty
  const pool = useMemo(() => {
    const qs = SAMPLE_QUESTION_SET.questions.filter((q) => q.difficulty === level);
    return qs.length ? qs : SAMPLE_QUESTION_SET.questions;
  }, [level]);

  const total = pool.length;
  const currentIndex = Math.min(getIndex(level), Math.max(0, total - 1));
  const current = pool[currentIndex];

  // Progress calculation
  const answeredCount = useMemo(() => {
    return pool.reduce((acc, q) => (selectedFor(level, q.id) ? acc + 1 : acc), 0);
  }, [pool, level, selectedFor]);
  const progressPct = total ? Math.round((answeredCount / total) * 100) : 0;

  const onSelectOption = (key: string) => {
    if (!current || isAnswered(level, current.id)) return;
    markAnswered(level, current.id, key);
  };

  const onNext = () => {
    const next = currentIndex + 1;
    if (next < total) {
      setIndex(level, next);
    } else {
      const firstUnanswered = pool.findIndex((q) => !selectedFor(level, q.id));
      setIndex(level, firstUnanswered === -1 ? currentIndex : firstUnanswered);
    }
  };

  const getOptionStyles = (optKey: string) => {
    if (!current) return "border bg-card hover:bg-accent";

    const answered = isAnswered(level, current.id);
    const selected = selectedFor(level, current.id);
    const correct = current.correctOption;

    if (!answered) {
      return "border bg-card hover:bg-accent transition-colors";
    }
    if (optKey === correct) {
      return "border-green-500 bg-green-50 text-green-900";
    }
    if (selected === optKey && selected !== correct) {
      return "border-red-500 bg-red-50 text-red-900";
    }
    return "opacity-70";
  };

  const renderExplanation = () => {
    if (!current || !isAnswered(level, current.id)) return null;

    const expl = current.explanation;
    return (
      <div className="mt-6 rounded-lg border bg-card p-4 shadow-soft">
        <div className="text-base font-semibold mb-2">Explanation</div>
        {Array.isArray(expl) ? (
          <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
            {expl.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{expl}</p>
        )}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.navbar))] mt-navbar ml-sidebar overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header with difficulty selector and progress */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Smart Study</h1>
            <p className="text-sm text-muted-foreground">
              Level {DIFFICULTY_OPTIONS.find((d) => d.value === level)?.label} • Question{" "}
              {currentIndex + 1} of {total}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={level} onValueChange={(value) => setLevel(value as "easy" | "medium" | "hard")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <div className="w-32">
                <Progress value={progressPct} className="h-2" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{progressPct}%</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        {current && (
          <Card className="shadow-soft">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">{current.question}</h2>

                {current.tags && (
                  <div className="flex flex-wrap gap-2">
                    {current.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-study-blue/10 text-study-blue rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                {current.choices.map((opt) => {
                  const answered = isAnswered(level, current.id);
                  const selected = selectedFor(level, current.id);
                  const isCorrect = opt.key === current.correctOption;

                  return (
                    <button
                      key={opt.key}
                      onClick={() => onSelectOption(opt.key)}
                      className={`flex items-center gap-3 rounded-lg p-4 text-left transition-colors ${getOptionStyles(
                        opt.key
                      )}`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold">
                        {opt.key}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                      {answered && isCorrect && <Check className="h-5 w-5 text-green-600" />}
                      {answered && !isCorrect && selected === opt.key && <X className="h-5 w-5 text-red-600" />}
                    </button>
                  );
                })}
              </div>

              {renderExplanation()}

              {isAnswered(level, current.id) && (
                <div className="pt-4">
                  <Button onClick={onNext} className="gap-2">
                    Next Question
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!current && (
          <Card className="shadow-soft">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No questions available for this difficulty level.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}