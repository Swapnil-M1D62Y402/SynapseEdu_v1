// src/components/SourcesPanel.tsx
"use client"; // <-- must be first line for useState / client hooks

import { Button } from "@/components/ui/button";
import { SourceItem } from "@/components/SourceItem";
import { Plus, Search } from "lucide-react";
import AddSourcesModal from "./AddSources";
import { useState } from "react";

export interface Source {
  id: string;
  title: string;
  type: "pdf" | "doc" | "youtube" | "web" | "text";
  url?: string;
  enabled: boolean;
}

interface SourcesPanelProps {
  studyKitId: string;
  sources: Source[];
  onToggleSource: (id: string) => void;
  onDeleteSource: (id: string) => void;
  onAddSource: (newSource?: Source) => void; // <- allow payload if modal returns it
  onDiscoverSources: () => void;
}

export function SourcesPanel({
  studyKitId,
  sources,
  onToggleSource,
  onDeleteSource,
  onAddSource,
  onDiscoverSources,
}: SourcesPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handler when modal saves a new source
  const handleModalSave = (newSource?: Source) => {
    // If your parent expects the new source, forward it; otherwise just notify.
    onAddSource(newSource);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full h-full bg-gray-100 rounded-lg border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Sources</h2>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 gap-2 bg-study-blue-light hover:bg-study-blue hover:text-study-blue-foreground transition-smooth"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDiscoverSources}
            className="flex-1 gap-2 bg-study-orange-light hover:bg-study-orange hover:text-study-orange-foreground transition-smooth"
          >
            <Search className="w-4 h-4" />
            Discover
          </Button>
        </div>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {sources.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No sources added yet.</p>
              <p className="text-sm mt-1">Click "Add" to get started.</p>
            </div>
          ) : (
            sources.map((source) => (
              <SourceItem
                key={source.id}
                source={source}
                onToggle={() => onToggleSource(source.id)}
                onDelete={() => onDeleteSource(source.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          {sources.filter((s) => s.enabled).length} of {sources.length} sources enabled
        </div>
      </div>

      {/* ---------- Render the modal ---------- */}
      {/* 
        I assume AddSourcesModal accepts:
          - open: boolean
          - onClose: () => void
          - onSave: (newSource?: Source) => void
          - studyKitId? etc.
        If your modal uses different prop names, see adapter example below.
      */}
      <AddSourcesModal
        isOpen={isModalOpen}
        kitId={studyKitId}
        onClose={() => setIsModalOpen(false)}
        // When the modal saves, call this handler.
        //onSave={(newSource?: Source) => handleModalSave(newSource)}
      />
    </div>
  );
}
