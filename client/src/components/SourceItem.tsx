import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Youtube, Link, File } from "lucide-react";
import { Source } from "@/components/SourcesPanel";

interface SourceItemProps {
  source: Source;
  onToggle: () => void;
  onDelete: () => void;
}

const getSourceIcon = (type: Source["type"]) => {
  switch (type) {
    case "pdf":
      return <FileText className="w-4 h-4 text-red-500" />;
    case "doc":
      return <File className="w-4 h-4 text-blue-500" />;
    case "youtube":
      return <Youtube className="w-4 h-4 text-red-600" />;
    case "web":
      return <Link className="w-4 h-4 text-study-blue" />;
    case "text":
      return <FileText className="w-4 h-4 text-study-green" />;
    default:
      return <File className="w-4 h-4 text-muted-foreground" />;
  }
};

export function SourceItem({ source, onToggle, onDelete }: SourceItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-fast group">
      {/* Source Icon */}
      <div className="flex-shrink-0">
        {getSourceIcon(source.type)}
      </div>

      {/* Source Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground truncate">
          {source.title}
        </h4>
        {source.url && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {source.url}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={source.enabled}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-study-blue data-[state=checked]:border-study-blue"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="w-8 h-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-fast"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}