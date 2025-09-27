"use client";

import { useEffect, useState } from "react";
import { AuthProvider as InternalAuthProvider } from "./AuthContext";

interface AuthProviderWrapperProps {
  children: React.ReactNode;
}

// Wrapper que só ativa o AuthProvider após a hidratação
export function AuthProvider({ children }: AuthProviderWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Durante SSR ou antes da hidratação, renderiza apenas os children
  if (!hasMounted) {
    return <>{children}</>;
  }

  // Após a hidratação, usa o AuthProvider normal
  return <InternalAuthProvider>{children}</InternalAuthProvider>;
}