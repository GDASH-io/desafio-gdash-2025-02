import { createContext } from "react";
import type { IAuthContext } from "../interfaces/auth.interface";

export const AuthContext = createContext<IAuthContext | undefined>(undefined);
