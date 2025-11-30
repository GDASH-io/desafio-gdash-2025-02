import { X } from "lucide-react";
import { Activity, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isDialogOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

function Modal({
  isDialogOpen,
  onClose,
  title,
  description,
  children,
}: ModalProps) {
  if (!isDialogOpen) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-10 p-4">
      <div className="sm:max-w-[500px] w-full max-h-[90vh] bg-white rounded-lg flex flex-col overflow-hidden">
        <header className="p-6 border-b shrink-0">
          <div className="flex justify-between items-center">
            <p className="text-2xl">{title}</p>
            <div
              role="button"
              className="border border-gray-200 transition-all duration-200 cursor-pointer hover:shadow p-1 rounded-md"
              onClick={onClose}
            >
              <X size={18} />
            </div>
          </div>
          <Activity mode={description ? "visible" : "hidden"}>
            <span className="text-sm text-muted-foreground">{description}</span>
          </Activity>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
