import { createContext, useContext } from "react";

const ToastContext = createContext({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  function toast({ title, description }) {
    alert(`${title}\n${description}`);
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
    </ToastContext.Provider>
  );
}
