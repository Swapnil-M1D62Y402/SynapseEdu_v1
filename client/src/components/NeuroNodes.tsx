"use client";
import { useState } from "react";
import { SourcesPanel, Source } from "@/components/SourcesPanel";
import { Chatbot, ChatMessage }  from "@/components/Chatbot";

export default function Neuronodes({ studyKitId }: { studyKitId: string }) {
  const [sources, setSources] = useState<Source[]>([
    {
      id: "1",
      title: "Final-Web-Version-Report-AI-Agents.pdf",
      type: "pdf",
      url: "final-web-version-report.pdf",
      enabled: true,
    },
    {
      id: "2", 
      title: "The Age of Agentic AI: Economic Impact Analysis",
      type: "doc",
      url: "economic-impact-analysis.docx",
      enabled: true,
    },
    {
      id: "3",
      title: "What is Agentic AI and How Does it Work?",
      type: "youtube",
      url: "https://youtube.com/watch?v=example",
      enabled: false,
    },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSource = (id: string) => {
    setSources(prev => 
      prev.map(source => 
        source.id === id ? { ...source, enabled: !source.enabled } : source
      )
    );
  };

  const handleDeleteSource = (id: string) => {
    setSources(prev => prev.filter(source => source.id !== id));
  };

  const handleAddSource = () => {
    // This would typically open a dialog or modal
    console.log("Add source clicked");
  };

  const handleDiscoverSources = () => {
    // This would typically open a discovery interface
    console.log("Discover sources clicked");
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
        content: "I'd be happy to help you understand your study materials better. What specific aspect would you like to explore?",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.navbar))] mt-navbar ml-sidebar bg-gradient-to-r from-gray-50 to-blue-100 rounded-2xl">  
      {/* Sources Panel - 40% width on desktop */}
      
      {/* Chatbot - 60% width on desktop, full width on mobile */}
      
      <div className="flex-1 md:w-3/5 p-4">
        <div className="h-full rounded-2xl">
            <Chatbot
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            />
        </div>
        </div>

        <div className="w-2/5 hidden md:block p-4">
        <div className="h-full bg-blue-50 rounded-2xl shadow-lg">
            <SourcesPanel
            studyKitId={studyKitId}
            sources={sources}
            onToggleSource={handleToggleSource}
            onDeleteSource={handleDeleteSource}
            onAddSource={handleAddSource}
            onDiscoverSources={handleDiscoverSources}
            />
        </div>
        </div>


      {/* Mobile Sources Panel - Shows on mobile only */}
      <div className="md:hidden">
        {/* This could be implemented as a drawer/modal for mobile */}
      </div>
    </div>
  );
}