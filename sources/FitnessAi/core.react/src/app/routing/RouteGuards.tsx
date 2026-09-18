import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthenticationState } from "../../features/authentication/useAuthenticationState";
import { useI18n } from "../../lib/i18n/useI18n";
import { LoadingIndicator } from "../../shared/components/LoadingIndicator";
import { UserRoleEnum, hasRole } from "../../lib/enums/userRoleEnum";

type RedirectState = {
  from?: string;
};

export const PrivateRoute = () => {
  const { isAuthenticated, isInitializing } = useAuthenticationState();
  const { getResource } = useI18n();
  const location = useLocation();

  if (isInitializing) {
    return <LoadingIndicator label={getResource("common.checkingSession")} />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { user, isInitializing } = useAuthenticationState();
  const { getResource } = useI18n();

  if (isInitializing) {
    return <LoadingIndicator label={getResource("common.checkingSession")} />;
  }

  if (!hasRole(user?.role ?? UserRoleEnum.None, UserRoleEnum.Admin)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const PublicRoute = () => {
  const { isAuthenticated, isInitializing } = useAuthenticationState();
  const { getResource } = useI18n();
  const location = useLocation();

  if (isInitializing) {
    return <LoadingIndicator label={getResource("common.checkingSession")} />;
  }

  if (isAuthenticated) {
    const state = location.state as RedirectState | null;
    return <Navigate to={state?.from ?? "/"} replace />;
  }

  return <Outlet />;
};
