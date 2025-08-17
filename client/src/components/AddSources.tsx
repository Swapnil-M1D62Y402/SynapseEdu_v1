import { useState, useRef } from "react";
import { X, Upload, Youtube, Link, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AddSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  kitId: string; 
}

export default function AddSourcesModal({ isOpen, onClose, kitId }: AddSourcesModalProps) {
  const [sourcesCount, setSourcesCount] = useState(0);
  const [showYouTubeInput, setShowYouTubeInput] = useState(false);
  const [showWebsiteInput, setShowWebsiteInput] = useState(false);
  const [showTextarea, setShowTextarea] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSourcesCount(prev => prev + files.length);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSourcesCount(prev => prev + files.length);
    }
  };

  const handleYouTubeSubmit = () => {
    if (youtubeUrl.trim()) {
      setSourcesCount(prev => prev + 1);
      setYoutubeUrl("");
      setShowYouTubeInput(false);
    }
  };

  const handleWebsiteSubmit = () => {
    if (websiteUrl.trim()) {
      setSourcesCount(prev => prev + 1);
      setWebsiteUrl("");
      setShowWebsiteInput(false);
    }
  };

  const handleTextSubmit = () => {
    if (pastedText.trim()) {
      setSourcesCount(prev => prev + 1);
      setPastedText("");
      setShowTextarea(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-background rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Add Sources</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Upload files or add links to build your study kit
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div
              onClick={handleDropZoneClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">
                Drag and Drop PDF files or choose file to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF files up to 10MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Split Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Website Links */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Website Links</h3>
              
              {/* YouTube */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setShowYouTubeInput(!showYouTubeInput)}
                  className="w-full justify-start"
                >
                  <Youtube className="h-4 w-4 mr-2 text-red-500" />
                  YouTube
                </Button>
                {showYouTubeInput && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste YouTube URL"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleYouTubeSubmit()}
                    />
                    <Button size="sm" onClick={handleYouTubeSubmit}>
                      Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Website Link */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setShowWebsiteInput(!showWebsiteInput)}
                  className="w-full justify-start"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Website Link
                </Button>
                {showWebsiteInput && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste Website Link"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleWebsiteSubmit()}
                    />
                    <Button size="sm" onClick={handleWebsiteSubmit}>
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Paste Text */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Paste Text</h3>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTextarea(!showTextarea)}
                  className="w-full justify-start"
                >
                  <Clipboard className="h-4 w-4 mr-2" />
                  Paste Text
                </Button>
                {showTextarea && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Paste text here"
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      className="min-h-[200px] resize-none"
                    />
                    <Button size="sm" onClick={handleTextSubmit} className="w-full">
                      Add Text
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Sources added: <span className="font-medium text-foreground">{sourcesCount}</span>
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={onClose}
              disabled={sourcesCount === 0}
            >
              Create Study Kit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}