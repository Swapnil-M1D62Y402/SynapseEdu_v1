"use client";
import { useState, useEffect } from "react";
import { Chatbot, ChatMessage } from "@/components/Chatbot";
import AddSourcesModal from "@/components/AddSources";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MessageSquare, Edit, Save, X, Plus } from "lucide-react";

interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}

// Dummy performance data - replace with real data later
const dummyFlashcardScore = 80;
const dummySmartStudyScore = 70;
const dummyTestScore: number | null = null; // null means no test taken yet
const dummyTimeEfficiency = 75;

export default function Home({kitId}: {kitId: string}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Study streak management
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem("studyStreak");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Update streak daily
  useEffect(() => {
    const lastLogin = localStorage.getItem("lastStudyLogin");
    const today = new Date().toDateString();
    if (lastLogin !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("studyStreak", newStreak.toString());
      localStorage.setItem("lastStudyLogin", today);
    }
  }, [streak]);

  // Calculate mastery percentage
  const calculateMastery = () => {
    let mastery = dummyFlashcardScore * 0.3 + dummySmartStudyScore * 0.3;
    if (dummyTestScore !== null) {
      mastery += dummyTestScore * 0.4;
    } else {
      mastery = Math.min(mastery, 95); // Cap at 95% if no test taken
    }
    return Math.round(mastery);
  };

  // Calculate KPI score
  const calculateKPI = () => {
    const consistencyFactor = Math.min(streak * 10, 100);
    const accuracyFactor = (dummyFlashcardScore + (dummyTestScore ?? dummySmartStudyScore)) / 2;
    const timeEfficiency = dummyTimeEfficiency;
    
    const kpiScore = consistencyFactor * 0.4 + accuracyFactor * 0.4 + timeEfficiency * 0.2;
    return Math.round(kpiScore);
  };

  // To-do list management
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem("studyTodos");
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Review entropy concept", done: false },
      { id: 2, text: "Solve 10 practice MCQs", done: true },
    ];
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    localStorage.setItem("studyTodos", JSON.stringify(todos));
  }, [todos]);

  const handleToggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const handleEditTodo = (id: number, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleSaveTodo = (id: number) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, text: editText } : todo
    ));
    setEditingId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleAddTodo = () => {
    const newTodo = { id: Date.now(), text: "New Task", done: false };
    setTodos(prev => [...prev, newTodo]);
    setEditingId(newTodo.id);
    setEditText(newTodo.text);
  };

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Welcome to StudyAI! I'm here to help you with your studies. You can create study kits, analyze documents, generate flashcards, and much more. How can I assist you today?",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const mastery = calculateMastery();
  const kpiScore = calculateKPI();

  return (
    <>
      <div className="h-[calc(100vh-theme(spacing.navbar))] mt-navbar ml-sidebar relative">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Welcome to StudyAI</h1>
              <p className="text-muted-foreground mt-1">Track your progress and manage your studies</p>
            </div>
            {/* <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(true)}
              className="px-6"
            >
              Create Study Kit
            </Button> */}
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-140px)] overflow-auto">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Mastery Percentage */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Mastery Percentage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-study-blue mb-2">{mastery}%</div>
                {dummyTestScore === null && (
                  <Badge variant="outline" className="text-xs">
                    Take a test to reach 100%
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">KPI Score:</span>
                  <span className="font-semibold">{kpiScore}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Attention Span:</span>
                  <span className="font-semibold">Medium / 45 min avg</span>
                </div>
              </CardContent>
            </Card>

            {/* Study Streak */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Study Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-study-green">{streak} days</div>
                <div className="text-2xl mt-1">🔥</div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - To-Do List */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Your To-Do List</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 space-y-3 overflow-auto">
                {todos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <Checkbox
                      checked={todo.done}
                      onCheckedChange={() => handleToggleTodo(todo.id)}
                    />
                    
                    <div className="flex-1">
                      {editingId === todo.id ? (
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className={`text-sm ${todo.done ? "line-through text-muted-foreground" : ""}`}>
                          {todo.text}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {editingId === todo.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSaveTodo(todo.id)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditTodo(todo.id, todo.text)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={handleAddTodo}
                variant="outline"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Collapsible Chatbot */}
        {chatbotOpen ? (
          <div className="absolute top-0 right-0 h-full w-1/3 min-w-[400px] bg-background border-l border-border shadow-large z-50 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Study Assistant</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatbotOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <Chatbot
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setChatbotOpen(true)}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-study-blue hover:bg-study-blue/90 text-study-blue-foreground shadow-large"
            size="sm"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        )}
      </div>
      
      <AddSourcesModal 
        isOpen={isModalOpen}
        kitId={kitId}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}