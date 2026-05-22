import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "@/hooks/api/use-auth";
import { isAuthRoute } from "./common/route-paths";

const AuthRoute = () => {
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAuth();
  const isPublicAuthRoute = isAuthRoute(location.pathname);

  // if (isLoading && !isPublicAuthRoute) {
  //   return <DashboardSkeleton />;
  // }

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default AuthRoute;
