import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import type { Therapist } from "../types";

type AuthContextValue = {
  therapist: Therapist | null;
  token: string | null;
  validatingSession: boolean;
  signIn: (token: string, therapist: Therapist) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [validatingSession, setValidatingSession] = useState(true);
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("essentia_token");
    const savedTherapist = localStorage.getItem("essentia_therapist");
    if (!savedToken || !savedTherapist) return null;
    try {
      JSON.parse(savedTherapist);
      return savedToken;
    } catch {
      localStorage.removeItem("essentia_therapist");
      localStorage.removeItem("essentia_token");
      return null;
    }
  });
  const [therapist, setTherapist] = useState<Therapist | null>(() => {
    const saved = localStorage.getItem("essentia_therapist");
    if (!saved) return null;
    try {
      return JSON.parse(saved) as Therapist;
    } catch {
      localStorage.removeItem("essentia_therapist");
      localStorage.removeItem("essentia_token");
      return null;
    }
  });

  useEffect(() => {
    let active = true;

    async function validateSession() {
      if (!token) {
        setValidatingSession(false);
        return;
      }

      try {
        const { data } = await api.get<Therapist>("/auth/me");
        if (!active) return;
        localStorage.setItem("essentia_therapist", JSON.stringify(data));
        setTherapist(data);
      } catch {
        if (!active) return;
        localStorage.removeItem("essentia_token");
        localStorage.removeItem("essentia_therapist");
        setToken(null);
        setTherapist(null);
      } finally {
        if (active) setValidatingSession(false);
      }
    }

    void validateSession();
    return () => {
      active = false;
    };
  }, [token]);

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

  return <AuthContext.Provider value={{ therapist, token, validatingSession, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
