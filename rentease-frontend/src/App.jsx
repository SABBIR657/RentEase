import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// Layouts
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import DashboardLayout from "./components/layout/DashboardLayout";

// Public pages
import HomePage from "./pages/public/HomePage";
import ListingsPage from "./pages/public/ListingsPage";
import PropertyDetailPage from "./pages/public/PropertyDetailPage";
import MapPage from "./pages/public/MapPage";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Tenant pages
import TenantDashboard from "./pages/tenant/TenantDashboard";
import MyApplications from "./pages/tenant/MyApplications";
import MyBookings from "./pages/tenant/MyBookings";
import MyFavourites from "./pages/tenant/MyFavourites";

// Owner pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import MyListings from "./pages/owner/MyListings";
import CreateListing from "./pages/owner/CreateListing";
import EditListing from "./pages/owner/EditListing";
import ReceivedApplications from "./pages/owner/ReceivedApplications";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import PendingListings from "./pages/admin/PendingListings";
import ManageReports from "./pages/admin/ManageReports";

// Shared pages
import MessagesPage from "./pages/shared/MessagesPage";
import NotificationsPage from "./pages/shared/NotificationsPage";
import ProfilePage from "./pages/shared/ProfilePage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

// Route guards
const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? <Navigate to="/" replace /> : children;
};

// Pages that use the public Navbar + Footer layout
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path="/listings"
          element={
            <PublicLayout>
              <ListingsPage />
            </PublicLayout>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <PublicLayout>
              <PropertyDetailPage />
            </PublicLayout>
          }
        />
        <Route
          path="/map"
          element={
            <PublicLayout>
              <MapPage />
            </PublicLayout>
          }
        />

        {/* ── Auth ── */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <PublicOnlyRoute>
              <ResetPasswordPage />
            </PublicOnlyRoute>
          }
        />

        {/* ── Tenant Dashboard ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["tenant"]}>
              <DashboardLayout>
                <TenantDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/applications"
          element={
            <ProtectedRoute roles={["tenant"]}>
              <DashboardLayout>
                <MyApplications />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bookings"
          element={
            <ProtectedRoute roles={["tenant"]}>
              <DashboardLayout>
                <MyBookings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/favourites"
          element={
            <ProtectedRoute roles={["tenant"]}>
              <DashboardLayout>
                <MyFavourites />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Owner Dashboard ── */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute roles={["owner"]}>
              <DashboardLayout>
                <OwnerDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/listings"
          element={
            <ProtectedRoute roles={["owner"]}>
              <DashboardLayout>
                <MyListings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/listings/create"
          element={
            <ProtectedRoute roles={["owner"]}>
              <DashboardLayout>
                <CreateListing />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/listings/edit/:id"
          element={
            <ProtectedRoute roles={["owner"]}>
              <DashboardLayout>
                <EditListing />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/applications"
          element={
            <ProtectedRoute roles={["owner"]}>
              <DashboardLayout>
                <ReceivedApplications />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Admin Dashboard ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout>
                <ManageUsers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/listings"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout>
                <PendingListings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout>
                <ManageReports />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Shared (any authenticated) ── */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MessagesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NotificationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute roles={["admin", "owner"]}>
              <DashboardLayout>
                <AnalyticsDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
