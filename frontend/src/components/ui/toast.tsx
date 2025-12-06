import { cn } from "@/lib/utils";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type];

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 rounded-md px-4 py-3 text-white shadow-lg min-w-[300px] max-w-[500px]",
        bgColor
      )}
      style={{
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div className="flex items-center justify-between gap-4">
        <span className="break-words">{message}</span>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 flex-shrink-0 text-xl font-bold leading-none px-1"
            aria-label="Fechar"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
