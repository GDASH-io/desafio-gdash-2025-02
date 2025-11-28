import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Essa função combina classes condicionalmente e remove conflitos.
// Exemplo: cn("bg-red-500", true && "p-4", "p-2") -> resulta em "bg-red-500 p-4" (o p-2 é removido)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}