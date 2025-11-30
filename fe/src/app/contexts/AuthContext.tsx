import { createContext, useCallback, useState, type ReactNode } from "react";
import { useQuery } from "../hooks/useQuery";
import { StorageManager } from "../lib/storageManager";
import { UserService } from "../service/users";

export type UserCtx = {
    id: string;
    role: UserService.Role
  };

interface AuthContextType {
  isSignedIn: boolean;
  signIn: (token: string, user: UserCtx) => void;
  signOut: () => void;
  user: UserCtx | undefined;
  isMe: (userId: string) => boolean;
  isAdmin: (role: UserService.Role | undefined) => boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthCtx = createContext({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [signedIn, setSignedIn] = useState<boolean>(() => {
    const token = StorageManager.loadToken();
    return !!token;
  });
  const [user, setUser] = useState<UserCtx | undefined>(() => {
    const storedUser = StorageManager.loadUser();
    return storedUser;
  });
  const access_token = StorageManager.loadToken();

  const signIn = useCallback((token: string, user: UserCtx) => {
    StorageManager.saveToken(token);
    StorageManager.saveUser(user);
    setSignedIn(true);
    setUser(user);
  }, [setUser, setSignedIn]);

  const signOut = useCallback(() => {
    StorageManager.clearStorage();
    setSignedIn(false);
    setUser(undefined);
  }, [setUser, setSignedIn]);

  const fetcherUser = useCallback(async () => {
    if (!access_token) return;
    return UserService.getMe();
  }, [access_token]);

  const { isError } = useQuery({
    fetcher: fetcherUser,
  })

  const value = {
    isSignedIn: signedIn && !isError,
    user,
    signIn,
    signOut,
    isMe: (userId: string) => userId === user?.id,
    isAdmin: (role: UserService.Role | undefined) => role === UserService.Role.ADMIN,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export default AuthProvider;
