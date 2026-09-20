import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
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

  const login = (newToken: string) => {
    localStorage.setItem(
      TOKEN_KEY,
      newToken,
    );

    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem(
      TOKEN_KEY,
    );

    localStorage.removeItem(
      USER_KEY,
    );

    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token],
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