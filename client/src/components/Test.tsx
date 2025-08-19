"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, X, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Dummy question bank - replace with real data later
const QUESTION_BANK = [
  // EASY
  {
    id: "e1",
    difficulty: "easy",
    question: "Which command displays a Matplotlib plot?",
    choices: [
      { key: "1", text: "plt.render()" },
      { key: "2", text: "plt.show()" },
      { key: "3", text: "plt.visualize()" },
      { key: "4", text: "plt.display()" },
    ],
    correctOption: "2",
    explanation: [
      "plt.show() opens a window and renders the current figure(s).",
      "Call it after plotting to actually display the visualization.",
    ],
  },
  {
    id: "e2",
    difficulty: "easy",
    question: "In Python, which symbol is used for comments?",
    choices: [
      { key: "1", text: "//" },
      { key: "2", text: "#" },
      { key: "3", text: "/* */" },
      { key: "4", text: "<!-- -->" },
    ],
    correctOption: "2",
    explanation: "Python uses the # character for single-line comments.",
  },
  {
    id: "e3",
    difficulty: "easy",
    question: "Which data structure preserves insertion order (Py3.7+)?",
    choices: [
      { key: "1", text: "dict" },
      { key: "2", text: "set" },
      { key: "3", text: "frozenset" },
      { key: "4", text: "heapq" },
    ],
    correctOption: "1",
    explanation: "From Python 3.7+, dict preserves insertion order as a language guarantee.",
  },
  {
    id: "e4",
    difficulty: "easy",
    question: "What does HTML stand for?",
    choices: [
      { key: "1", text: "Hyperlinks and Text Markup Language" },
      { key: "2", text: "Home Tool Markup Language" },
      { key: "3", text: "HyperText Markup Language" },
      { key: "4", text: "Hyper Tool Multi Language" },
    ],
    correctOption: "3",
    explanation: "HTML = HyperText Markup Language.",
  },
  {
    id: "e5",
    difficulty: "easy",
    question: "Which keyword defines a function in Python?",
    choices: [
      { key: "1", text: "func" },
      { key: "2", text: "define" },
      { key: "3", text: "def" },
      { key: "4", text: "function" },
    ],
    correctOption: "3",
    explanation: "Use 'def' to define functions in Python.",
  },
  {
    id: "e6",
    difficulty: "easy",
    question: "Which of the following is a boolean literal in JS?",
    choices: [
      { key: "1", text: "true" },
      { key: "2", text: "0" },
      { key: "3", text: "'false'" },
      { key: "4", text: "undefined" },
    ],
    correctOption: "1",
    explanation: "true and false are boolean literals in JavaScript.",
  },
  // MEDIUM
  {
    id: "m1",
    difficulty: "medium",
    question: "Which of the following is a correct way to create a horizontal bar plot in Matplotlib?",
    choices: [
      { key: "1", text: "plt.horizontal_bar(x, y)" },
      { key: "2", text: "plt.bar(x, y, orientation='horizontal')" },
      { key: "3", text: "plt.hbar(y, x)" },
      { key: "4", text: "plt.barh(y, x)" },
    ],
    correctOption: "4",
    explanation: [
      "The function plt.barh() is specifically designed for creating horizontal bar plots, where the first argument represents the y-coordinates.",
      "In a horizontal bar plot, the x-values determine the length of the bars, while the y-values represent the categories being plotted.",
      "To effectively use plt.barh(), ensure that the data for x and y are appropriately defined, typically as lists or arrays.",
    ],
  },
  {
    id: "m2",
    difficulty: "medium",
    question: "Which Matplotlib API saves a figure to disk?",
    choices: [
      { key: "1", text: "plt.savefig('fig.png')" },
      { key: "2", text: "plt.store('fig.png')" },
      { key: "3", text: "plt.persist('fig.png')" },
      { key: "4", text: "plt.tofile('fig.png')" },
    ],
    correctOption: "1",
    explanation: [
      "Use savefig to export the current figure.",
      "You can choose format via filename extension or the 'format' kwarg.",
    ],
  },
  {
    id: "m3",
    difficulty: "medium",
    question: "In JS, which method clones an array shallowly?",
    choices: [
      { key: "1", text: "[...arr]" },
      { key: "2", text: "arr.clone()" },
      { key: "3", text: "copy(arr)" },
      { key: "4", text: "Array.clone(arr)" },
    ],
    correctOption: "1",
    explanation: "Spread syntax creates a shallow copy of an array.",
  },
  {
    id: "m4",
    difficulty: "medium",
    question: "SQL: which clause filters after aggregation?",
    choices: [
      { key: "1", text: "WHERE" },
      { key: "2", text: "HAVING" },
      { key: "3", text: "FILTER" },
      { key: "4", text: "GROUP BY" },
    ],
    correctOption: "2",
    explanation: "HAVING filters grouped results; WHERE filters rows before GROUP BY.",
  },
  {
    id: "m5",
    difficulty: "medium",
    question: "Which Python lib is best known for tabular data ops?",
    choices: [
      { key: "1", text: "matplotlib" },
      { key: "2", text: "pandas" },
      { key: "3", text: "numpy.linalg" },
      { key: "4", text: "seaborn" },
    ],
    correctOption: "2",
    explanation: "pandas provides DataFrame operations for tabular data.",
  },
  {
    id: "m6",
    difficulty: "medium",
    question: "RAG pipelines should generally…",
    choices: [
      { key: "1", text: "Avoid citing sources" },
      { key: "2", text: "Return source excerpts with generated answers" },
      { key: "3", text: "Use only a single document" },
      { key: "4", text: "Always use unfiltered web data" },
    ],
    correctOption: "2",
    explanation: "Citations improve transparency and trust in RAG systems.",
  },
  // HARD
  {
    id: "h1",
    difficulty: "hard",
    question: "Time complexity of binary search on a sorted array of size n is:",
    choices: [
      { key: "1", text: "O(n)" },
      { key: "2", text: "O(log n)" },
      { key: "3", text: "O(1)" },
      { key: "4", text: "O(n log n)" },
    ],
    correctOption: "2",
    explanation: "Binary search halves the search interval each step → logarithmic time.",
  },
  {
    id: "h2",
    difficulty: "hard",
    question: "Which model regularization adds absolute value penalty?",
    choices: [
      { key: "1", text: "Ridge (L2)" },
      { key: "2", text: "Lasso (L1)" },
      { key: "3", text: "Elastic Net (L0)" },
      { key: "4", text: "Dropout" },
    ],
    correctOption: "2",
    explanation: "Lasso uses L1 penalty, encouraging sparsity by driving coefficients to zero.",
  },
  {
    id: "h3",
    difficulty: "hard",
    question: "In distributed systems, the CAP theorem states it's impossible to simultaneously guarantee:",
    choices: [
      { key: "1", text: "Consistency, Availability, and Partition Tolerance" },
      { key: "2", text: "Low Latency and High Throughput" },
      { key: "3", text: "ACID and BASE" },
      { key: "4", text: "Durability and Isolation" },
    ],
    correctOption: "1",
    explanation: "Under network partition, a system must choose between consistency and availability.",
  },
  {
    id: "h4",
    difficulty: "hard",
    question: "In gradient descent, too large a learning rate most likely:",
    choices: [
      { key: "1", text: "Converges faster always" },
      { key: "2", text: "Causes divergence/overshooting" },
      { key: "3", text: "Does nothing" },
      { key: "4", text: "Eliminates local minima" },
    ],
    correctOption: "2",
    explanation: "Large steps can overshoot the minima, leading to oscillation or divergence.",
  },
  {
    id: "h5",
    difficulty: "hard",
    question: "Which SQL join returns only matching rows from both tables?",
    choices: [
      { key: "1", text: "LEFT JOIN" },
      { key: "2", text: "RIGHT JOIN" },
      { key: "3", text: "INNER JOIN" },
      { key: "4", text: "FULL OUTER JOIN" },
    ],
    correctOption: "3",
    explanation: "INNER JOIN yields rows where join condition matches.",
  },
  {
    id: "h6",
    difficulty: "hard",
    question: "Which structure is NOT lock-free by default in CPython?",
    choices: [
      { key: "1", text: "Queue.Queue" },
      { key: "2", text: "deque append/pop" },
      { key: "3", text: "list append" },
      { key: "4", text: "dict setitem" },
    ],
    correctOption: "1",
    explanation: "queue.Queue uses locks/condition variables; deque/list ops are thread-safe at C level but not atomic across sequences.",
  },
];

const POINTS_PER_Q = 4;
const LS_KEY = "thea_tests_v1";

// Helper functions
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const uid = () => Math.random().toString(36).slice(2, 8);

function loadTests() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTests(tests: any[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(tests));
}

function sampleByDifficulty(count: number, difficulty: string) {
  const pool = QUESTION_BANK.filter((q) => q.difficulty === difficulty);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Test Dashboard Component
function TestDashboard({ goRun, goReview }: any) {
  const [duration, setDuration] = useState(10);
  const [enforce, setEnforce] = useState(true);
  const [mcqCount, setMcqCount] = useState(12);
  const [difficultyIdx, setDifficultyIdx] = useState(2); // 0-4 slider
  
  const difficulty = useMemo(() => {
    const map = ["easy", "easy", "medium", "hard", "hard"];
    return map[clamp(difficultyIdx, 0, 4)];
  }, [difficultyIdx]);

  const [tests, setTests] = useState(loadTests());

  useEffect(() => saveTests(tests), [tests]);

  function createTest() {
    const id = `test_${uid()}`;
    const questions = sampleByDifficulty(mcqCount, difficulty);
    const test = {
      id,
      title: `Test ${tests.length + 1}`,
      duration,
      enforce,
      difficulty,
      status: "in_progress",
      createdAt: Date.now(),
      startedAt: Date.now(),
      completedAt: null,
      scorePct: null,
      responses: {},
      questions,
    };
    const newTests = [test, ...tests];
    setTests(newTests);
    goRun(test.id, newTests);
  }

  return (
    <div className="h-[calc(100vh-theme(spacing.navbar))] mt-navbar ml-sidebar overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Controls Card */}
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Duration */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Time</h3>
                <div className="text-sm text-muted-foreground mb-2">Test duration</div>
                <div className="flex items-center gap-4">
                  <button
                    className="w-10 h-10 rounded-full border-2 border-border hover:bg-muted flex items-center justify-center text-lg font-medium"
                    onClick={() => setDuration(Math.max(1, duration - 1))}
                  >
                    –
                  </button>
                  <div className="text-2xl font-bold min-w-[80px] text-center">{duration} min</div>
                  <button
                    className="w-10 h-10 rounded-full border-2 border-border hover:bg-muted flex items-center justify-center text-lg font-medium"
                    onClick={() => setDuration(duration + 1)}
                  >
                    +
                  </button>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enforce}
                    onChange={(e) => setEnforce(e.target.checked)}
                    className="rounded"
                  />
                  Enforce time limit
                </label>
              </div>

              {/* Questions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Questions</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Multiple choice</div>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      className="w-20 rounded-lg border border-border px-3 py-2 text-center"
                      value={mcqCount}
                      onChange={(e) => setMcqCount(clamp(parseInt(e.target.value) || 1, 1, 50))}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      est. {Math.ceil(mcqCount * 0.5)} min
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Short answer</div>
                    <input
                      type="number"
                      className="w-20 rounded-lg border border-border px-3 py-2 text-center"
                      value={2}
                      readOnly
                    />
                    <div className="text-xs text-muted-foreground mt-1">est. 4 min</div>
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Difficulty</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Easy</span>
                    <span>Hard</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={4}
                    value={difficultyIdx}
                    onChange={(e) => setDifficultyIdx(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-center">
                    <span className="px-3 py-1 bg-study-blue/10 text-study-blue text-sm rounded-full">
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={createTest} className="px-6 py-2">
                Create test
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              "Introduction to Matplotlib for Data Visualization" tests
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Test</th>
                    <th className="pb-3 font-medium">Difficulty</th>
                    <th className="pb-3 font-medium">Duration</th>
                    <th className="pb-3 font-medium">Score</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test: any, idx: number) => (
                    <tr key={test.id} className="border-b">
                      <td className="py-4">{test.title}</td>
                      <td className="py-4">{test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}</td>
                      <td className="py-4">{test.duration} min</td>
                      <td className="py-4">{test.scorePct === null ? "—" : `${test.scorePct}%`}</td>
                      <td className="py-4">
                        {test.status === "completed" ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => goReview(test.id)}
                          >
                            Open
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => goRun(test.id)}
                          >
                            {test.status === "created" ? "Start test" : "Resume Test"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tests.length === 0 && (
                    <tr>
                      <td className="py-8 text-muted-foreground text-center" colSpan={5}>
                        No tests yet. Create your first test above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Test Runner Component
// Test Runner Component
function TestRunner({ testId, goBack, goReview }: any) {
  const [tests, setTests] = useState(loadTests());
  const test = tests.find((t: any) => t.id === testId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!test) return;
    timerRef.current = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [test]);

  if (!test) return null;

  function update(patch: any) {
    const newTests = tests.map((t: any) => (t.id === testId ? { ...t, ...patch } : t));
    setTests(newTests);
    saveTests(newTests);
  }

  function select(qid: string, key: string) {
    const newResponses = { ...test.responses, [qid]: key };
    update({ responses: newResponses });
  }

  function handleSubmit() {
    const total = test.questions.length * POINTS_PER_Q;
    const earned = test.questions.reduce((acc: number, q: any) => {
      const picked = test.responses[q.id];
      return acc + (picked === q.correctOption ? POINTS_PER_Q : 0);
    }, 0);
    const pct = Math.round((100 * earned) / total);

    update({
      status: "completed",
      completedAt: Date.now(),
      scorePct: pct,
    });
    goReview(testId);
  }

  const q = test.questions[currentIndex];
  const selected = test.responses[q.id];

  const elapsedSec = Math.floor((Date.now() - test.startedAt) / 1000);
  const totalSec = test.duration * 60;
  const remain = Math.max(0, totalSec - elapsedSec);
  const timeText = test.enforce
    ? `${Math.floor(remain / 60)}:${String(remain % 60).padStart(2, "0")}`
    : `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (test.enforce && remain <= 0) {
      handleSubmit();
    }
  }, [tick]);

  const percentDone = Math.floor(((currentIndex + 1) / test.questions.length) * 100);

  return (
    <div className="h-[calc(100vh-theme(spacing.navbar))] mt-navbar ml-sidebar overflow-auto">
      {/* Top nav */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b mb-6">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              update({ status: "paused" });
              goBack();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Test settings
          </button>
          <div className="font-semibold">
            {test.enforce ? "Time left" : "Time elapsed"}: {timeText}
          </div>
          <Button onClick={() => setShowConfirm(true)}>I'm Done</Button>
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <Card key={q.id} className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {test.questions.length} — {POINTS_PER_Q} points
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-4">{q.question}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {q.choices.map((choice: any) => {
                const isSelected = selected === choice.key;
                return (
                  <button
                    key={choice.key}
                    onClick={() => select(q.id, choice.key)}
                    className={`text-left p-4 rounded-lg border transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-muted border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-medium ${
                          isSelected ? "bg-background/20 border-background/30" : "bg-background"
                        }`}
                      >
                        {choice.key}
                      </span>
                      <span>{choice.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="secondary"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            Previous
          </Button>

          {currentIndex < test.questions.length - 1 ? (
            <Button
              disabled={!selected}
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              Next
            </Button>
          ) : (
            <Button disabled={!selected} onClick={handleSubmit}>
              Submit Test
            </Button>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mt-4">
          <div
            className="h-2 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${percentDone}%` }}
          />
        </div>
      </div>

      {/* submit confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-2">Submit test?</h4>
              <p className="text-muted-foreground mb-6">
                You won't be able to change answers after submission.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Submit</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Test Review Component
// Test Review Component (step-by-step by question)
function TestReview({ testId, goBack }: any) {
  const [tests] = useState(loadTests());
  const test = tests.find((t: any) => t.id === testId);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!test) return null;

  const q = test.questions[currentIndex];
  const picked = test.responses[q.id];
  const correct = q.correctOption;
  const isCorrect = picked === correct;
  const pointsEarned = isCorrect ? POINTS_PER_Q : 0;
  const percentDone = Math.floor(((currentIndex + 1) / test.questions.length) * 100);

  return (
    <div className="h-[calc(100vh-theme(spacing.navbar))] mt-navbar ml-sidebar overflow-auto">
      {/* Review Navigation */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b mb-6">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={goBack} className="text-muted-foreground hover:text-foreground">
            ← Back to dashboard
          </button>
          <div />
          <div className="font-semibold">Score: {test.scorePct}%</div>
        </div>
      </div>

      {/* Question card */}
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {test.questions.length} — {POINTS_PER_Q} points
              </span>
            </div>
            <div className={`text-sm mb-3 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
              {pointsEarned} points earned
            </div>

            <h3 className="text-xl font-semibold mb-4">{q.question}</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {q.choices.map((choice: any) => {
                const isUserChoice = picked === choice.key;
                const isCorrectChoice = choice.key === correct;

                let className = "p-4 rounded-lg border ";
                if (isCorrectChoice) {
                  className += "bg-green-50 border-green-500 text-green-900";
                } else if (isUserChoice && !isCorrectChoice) {
                  className += "bg-red-50 border-red-500 text-red-900";
                } else {
                  className += "bg-muted/50 border-border";
                }

                return (
                  <div key={choice.key} className={className}>
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full border bg-background flex items-center justify-center text-sm font-medium">
                        {choice.key}
                      </span>
                      <span>{choice.text}</span>
                      {isCorrectChoice && <Check className="w-5 h-5 ml-auto" />}
                      {isUserChoice && !isCorrectChoice && <X className="w-5 h-5 ml-auto" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="font-medium mb-2">Explanation</div>
              {Array.isArray(q.explanation) ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {q.explanation.map((line: string, i: number) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{q.explanation}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagination buttons */}
        <div className="flex justify-between">
          <Button
            variant="secondary"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            Previous
          </Button>

          {currentIndex < test.questions.length - 1 ? (
            <Button onClick={() => setCurrentIndex((i) => i + 1)}>Next</Button>
          ) : (
            <Button onClick={goBack}>Finish Review</Button>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mt-4">
          <div
            className="h-2 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${percentDone}%` }}
          />
        </div>
      </div>
    </div>
  );
}


// Main Test Component
export default function Test() {
  const [view, setView] = useState<{ name: string; testId?: string }>({ name: "dashboard" });

  const goRun = (testId: string, updatedList?: any[]) => {
    if (updatedList) saveTests(updatedList);
    setView({ name: "run", testId });
  };

  const goReview = (testId: string) => {
    setView({ name: "review", testId });
  };

  const goBack = () => {
    setView({ name: "dashboard" });
  };

  if (view.name === "run") {
    return <TestRunner testId={view.testId} goBack={goBack} goReview={goReview} />;
  }
  
  if (view.name === "review") {
    return <TestReview testId={view.testId} goBack={goBack} />;
  }

  return <TestDashboard goRun={goRun} goReview={goReview} />
};