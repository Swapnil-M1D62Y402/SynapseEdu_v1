"use client";
import { useState } from "react";
import  {Chatbot, ChatMessage}  from "@/components/Chatbot";
import AddSourcesModal from "@/components/AddSources";
import { Button } from "@/components/ui/button";

export default function Home({ studyKitId }: { studyKitId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <>
      <div className="h-[calc(100vh-theme(spacing.navbar))] mt-navbar ml-sidebar flex flex-col">
        {/* Header with Create Study Kit button */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Welcome to StudyAI</h1>
              <p className="text-muted-foreground mt-1">Create study kits and get AI-powered assistance</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(true)}
              className="px-6"
            >
              Create Study Kit
            </Button>
          </div>
        </div>
        
        {/* Chatbot */}
        <div className="flex-1">
          <Chatbot
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <AddSourcesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        kitId={studyKitId}
      />
    </>
  );
}