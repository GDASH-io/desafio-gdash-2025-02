import { Card } from "@/components/ui/card";
import { ChevronRight, Lightbulb } from "lucide-react";

export type Insight = {
  description: string;
  activities: string[];
};

interface InsightCardProps {
  description: string;
  quantityOfActivities: number;
  onOpenModal: () => void;
}

function InsightCard({ description, quantityOfActivities, onOpenModal }: InsightCardProps) {
  return (
    <Card className="mb-6">
      <div className="relative px-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-linear-to-br from-primary to-primary/80 shadow-lg">
            <Lightbulb className="w-6 h-6 text-primary-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-card-foreground leading-relaxed mb-4">
              {description}
            </p>

             <div
                onClick={onOpenModal}
                role="button"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-300 cursor-pointer"
              >
                <span className="font-medium">
                  {quantityOfActivities} atividades
                </span>
                <ChevronRight className="w-4 h-4 transition-transform duration-300" />
              </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default InsightCard;
