import { createContext, useContext, useMemo } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = useMemo(() => ({
    // CELLWATCH is configured as a public application. Keep this context API
    // compatible with Base44 exports without blocking local frontend startup.
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    authError: null,
    navigateToLogin: () => {},
  }), []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
