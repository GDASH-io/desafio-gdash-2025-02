import Modal from "@/components/modal";

interface InsightDialogProps {
  activities: string[];
  isOpen: boolean;
  onClose: () => void;
}

function InsightModal({ activities, isOpen, onClose }: InsightDialogProps) {
  return (
     <Modal
      isDialogOpen={isOpen}
      onClose={onClose}
      title="Atividades Recomendadas"
      description="Segue algumas atividades recomendadas com base no clima atual da região."
    >
      <div className="mt-2">
          <div className="space-y-3 overflow-y-auto">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="group/item flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-200"
              >
                <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="flex-1 text-sm text-card-foreground leading-relaxed">
                  {activity}
                </p>
              </div>
            ))}
          </div>
        </div>
    </Modal>
  );
}

export default InsightModal;
