import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AuthUser } from './auth.types';

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (
    token: string,
    user?: AuthUser | null,
  ) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

const TOKEN_KEY =
  'whatsapp_crm_token';

const USER_KEY =
  'whatsapp_crm_user';

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] =
    useState<string | null>(
      () =>
        localStorage.getItem(
          TOKEN_KEY,
        ),
    );

  const [user, setUserState] =
    useState<AuthUser | null>(() => {
      const storedUser =
        localStorage.getItem(
          USER_KEY,
        );

      if (!storedUser) {
        return null;
      }

      try {
        return JSON.parse(
          storedUser,
        ) as AuthUser;
      } catch {
        localStorage.removeItem(
          USER_KEY,
        );

        return null;
      }
    });

  const login = (
    newToken: string,
    newUser?: AuthUser | null,
  ) => {
    localStorage.setItem(
      TOKEN_KEY,
      newToken,
    );

    setToken(newToken);

    if (newUser) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(newUser),
      );

      setUserState(newUser);
    }
  };

  const setUser = (
    newUser: AuthUser | null,
  ) => {
    if (newUser) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(newUser),
      );
    } else {
      localStorage.removeItem(
        USER_KEY,
      );
    }

    setUserState(newUser);
  };

  const logout = () => {
    localStorage.removeItem(
      TOKEN_KEY,
    );

    localStorage.removeItem(
      USER_KEY,
    );

    setToken(null);
    setUserState(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated:
        Boolean(token),
      login,
      setUser,
      logout,
    }),
    [token, user],
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
}