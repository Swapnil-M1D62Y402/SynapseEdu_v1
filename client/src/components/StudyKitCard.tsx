import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface StudyKitCardProps {
  id: string;
  title: string;
  category?: string;
  color?: "purple" | "blue";
  onDelete: (id: string) => void;
}

const StudyKitCard = ({ id, title, category, color = "blue", onDelete }: StudyKitCardProps) => {
  const colorClasses = {
    purple: "bg-gradient-to-br from-purple-400 to-purple-600",
    blue: "bg-gradient-to-br from-blue-500 to-blue-600"
  };

  return (
    <Card className={`${colorClasses[color]} text-white border-0 hover:shadow-card-hover transition-all duration-200 hover:scale-[1.02] relative group`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-white leading-tight">
            {title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {category && (
          <span className="text-white/80 text-sm font-medium">
            {category}
          </span>
        )}
      </CardContent>
    </Card>
  );
};

export default StudyKitCard;