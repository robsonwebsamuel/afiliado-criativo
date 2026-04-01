import { ReactNode } from "react";

// TODO: reativar autenticação e redirecionamento antes do deploy em produção
export function ProtectedRoute({ children }: { children: ReactNode }) {
  // Autenticação temporariamente desativada para desenvolvimento
  return <>{children}</>;
}

// TODO: reativar verificação de admin antes do deploy em produção
export function AdminRoute({ children }: { children: ReactNode }) {
  // Verificação de admin temporariamente desativada para desenvolvimento
  return <>{children}</>;
}
