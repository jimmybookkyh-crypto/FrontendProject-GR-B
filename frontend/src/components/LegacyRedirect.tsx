import { Navigate, useLocation } from "react-router";

export default function LegacyRedirect({ to }: { to: string }) {
  const { search, hash, state } = useLocation();
  return <Navigate to={`${to}${search}${hash}`} replace state={state} />;
}
