import { useContext } from "react";
import {
  UsersContext,
  type IUsersContext,
} from "../context/userContextDefinition";

export const useUsers = (): IUsersContext => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
};
