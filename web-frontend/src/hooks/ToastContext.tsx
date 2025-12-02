import React, { createContext, useContext, useState, ReactNode } from "react";

interface Toast {
  id: number;
  title?: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
}

interface ToastContextType {
  toast: (data: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, message, type = "info" }: Omit<Toast, "id">) => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, title, message, type }]);

    // remove automaticamente depois de 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Container dos Toasts */}
      <div className="fixed top-4 right-4 flex flex-col gap-3 z-[9999]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[260px] px-4 py-3 rounded-lg shadow-lg text-white animate-slide-in
              ${
                t.type === "success"
                  ? "bg-green-600"
                  : t.type === "error"
                  ? "bg-red-600"
                  : t.type === "warning"
                  ? "bg-yellow-500"
                  : "bg-blue-600"
              }
            `}
          >
            {t.title && <strong className="block text-sm">{t.title}</strong>}
            <p className="text-sm">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx;
};
