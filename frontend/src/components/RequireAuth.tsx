import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../utils/authContext.tsx";
import LoadingSpinner from "./LoadingSpinner.tsx";
import type { AuthUser } from "../interface/types.ts";
import { paths } from "../utils/paths.ts";

type RequireAuthProps = {
  children: ReactNode;
  role?: AuthUser["role"];
};

export default function RequireAuth({ children, role }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const { pathname, search, hash } = useLocation();

  if (loading) return <LoadingSpinner text="Kontrollerar inloggning…" />;

  if (!user) {
    return (
      <Navigate
        to={paths.login}
        replace
        state={{ from: pathname + search + hash }}
      />
    );
  }

  if (role && user.role !== role) {
    return <Navigate to={paths.start} replace />;
  }

  return <>{children}</>;
}
