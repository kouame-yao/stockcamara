"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext<boolean | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthContextProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthContext.Provider value={loading}>{children}</AuthContext.Provider>
  );
}

export const useAuth = (): boolean => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("Erreur lors de la récupération du context");
  }
  return context;
};
