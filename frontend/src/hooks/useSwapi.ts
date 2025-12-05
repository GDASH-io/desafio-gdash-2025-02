import { useContext } from "react";
import type { ISwapiContext } from "../interfaces/swapi.interface";
import { SwapiContext } from "../context/swapiContextDefinition";

export const useSwapi = (): ISwapiContext => {
  const context = useContext(SwapiContext);
  if (context === undefined) {
    throw new Error("useSwapi must be used within a SwapiProvider");
  }
  return context;
};
