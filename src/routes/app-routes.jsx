import Login from "@/app/auth/login";
import NotFound from "@/app/errors/not-found";
import Settings from "@/app/setting/setting";
import Maintenance from "@/components/common/maintenance";
import ErrorBoundary from "@/components/error-boundry/error-boundry";
import LoadingBar from "@/components/loader/loading-bar";
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AuthRoute from "./auth-route";
import ProtectedRoute from "./protected-route";
import Dashboard from "@/app/dashboard/dashboard";
import Brand from "@/app/brand/Brand";
import Client from "@/app/client/Client";
import Product from "@/app/product/Product";

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<AuthRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>
        <Route path="/" element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Settings />
              </Suspense>
            }
          />
          <Route
            path="/brand"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Brand />
              </Suspense>
            }
          />
          <Route
            path="/product"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Product />
              </Suspense>
            }
          />

          <Route
            path="/client"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Client />
              </Suspense>
            }
          />
          {/* <Route
            path="/notification"
            element={
              <Suspense fallback={<LoadingBar />}>
                <NotificationList />
              </Suspense>
            }
          /> */}

          {/* <Route
            path="/site"
            element={
              <Suspense fallback={<LoadingBar />}>
                <SiteList />
              </Suspense>
            }
          /> */}
          {/* <Route
            path="/trip"
            element={
              <Suspense fallback={<LoadingBar />}>
                <TripList />
              </Suspense>
            }
          />
          <Route
            path="/create-trip"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CreateTrip />
              </Suspense>
            }
          />
          <Route
            path="/edit-trip/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <EditTrip />
              </Suspense>
            }
          /> */}

          {/* <Route
            path="/report/employee"
            element={
              <Suspense fallback={<LoadingBar />}>
                <EmployeeReport />
              </Suspense>
            }
          />
          <Route
            path="/report/site"
            element={
              <Suspense fallback={<LoadingBar />}>
                <SiteReport />
              </Suspense>
            }
          />
          <Route
            path="/report/km-reading"
            element={
              <Suspense fallback={<LoadingBar />}>
                <KMReadingReport />
              </Suspense>
            }
          />
          <Route
            path="/report/petrol_reimbursement"
            element={
              <Suspense fallback={<LoadingBar />}>
                <TripReport />
              </Suspense>
            }
          />

          <Route
            path="/report/petrol_reimbursement_view"
            element={
              <Suspense fallback={<LoadingBar />}>
                <PetrolReimbursementDetail />
              </Suspense>
            }
          />
          <Route
            path="/report/site_expenses"
            element={
              <Suspense fallback={<LoadingBar />}>
                <PlaceReport />
              </Suspense>
            }
          /> */}

          {/* <Route
            path="/km-reading"
            element={
              <Suspense fallback={<LoadingBar />}>
                <KMReadingList />
              </Suspense>
            }
          /> */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;
