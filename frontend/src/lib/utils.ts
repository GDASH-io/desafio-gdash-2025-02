import { clsx } from "clsx";

export function cn(...classes: (string | undefined | false)[]) {
  return clsx(...classes);
}
