import { constants } from "../config/constants";
import type { UserCtx } from "../contexts/AuthContext";

export class StorageManager {
  static saveToken(token: string) {
    localStorage.setItem(constants.ACCESS_TOKEN, token);
  }

  static saveUser(user: UserCtx) {
    localStorage.setItem(constants.STORAGE_USER, JSON.stringify(user));
  }

  static loadUser(): UserCtx | undefined{
    try {
      const userId = localStorage.getItem(constants.STORAGE_USER);
      return userId ? JSON.parse(userId) as UserCtx : undefined;
    } catch {
      console.error("Error loading user from localStorage");
      return undefined;
    }
  }

  static loadToken(): string | null{
    try {
      const token = localStorage.getItem(constants.ACCESS_TOKEN);
      return token ? token : null;
    } catch {
      console.error("Error loading token from localStorage");
      return null;
    }
  }

  static clearStorage() {
    localStorage.removeItem(constants.ACCESS_TOKEN);
    localStorage.removeItem(constants.STORAGE_USER);
  }
}