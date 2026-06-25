import { createContext, useContext, useState, type ReactNode } from "react";
import type { Therapist } from "../types";

type AuthContextValue = {
  therapist: Therapist | null;
  token: string | null;
  signIn: (token: string, therapist: Therapist) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem("essentia_token"));
  const [therapist, setTherapist] = useState<Therapist | null>(() => {
    const saved = localStorage.getItem("essentia_therapist");
    return saved ? JSON.parse(saved) : null;
  });

  function signIn(newToken: string, newTherapist: Therapist) {
    localStorage.setItem("essentia_token", newToken);
    localStorage.setItem("essentia_therapist", JSON.stringify(newTherapist));
    setToken(newToken);
    setTherapist(newTherapist);
  }

  function signOut() {
    localStorage.removeItem("essentia_token");
    localStorage.removeItem("essentia_therapist");
    setToken(null);
    setTherapist(null);
  }

  return <AuthContext.Provider value={{ therapist, token, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}

