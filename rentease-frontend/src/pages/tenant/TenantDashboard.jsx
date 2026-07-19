import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FileText, Calendar, Heart, Building2 } from "lucide-react";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import StatCard from "../../components/dashboard/StatCard";
import ApplicationStatusBadge from "../../components/dashboard/ApplicationStatusBadge";
import Spinner from "../../components/common/Spinner";
import { formatDate, formatCurrency } from "../../utils/formatters";

export default function TenantDashboard() {
  const { user } = useAuthStore();

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => api.get("/applications/my-applications").then((r) => r.data),
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => api.get("/bookings/my-bookings").then((r) => r.data),
  });

  const { data: favsData } = useQuery({
    queryKey: ["favourites"],
    queryFn: () => api.get("/favourites").then((r) => r.data),
  });

  const applications = appsData?.data || [];
  const bookings = bookingsData?.data || [];
  const favourites = favsData?.data || [];

  const pending = applications.filter((a) => a.status === "pending").length;
  const approved = applications.filter((a) => a.status === "approved").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="section-subtitle">
          Here's what's happening with your rental journey.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Applications"
          value={applications.length}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Pending"
          value={pending}
          icon={FileText}
          color="yellow"
        />
        <StatCard
          label="Approved"
          value={approved}
          icon={FileText}
          color="green"
        />
        <StatCard
          label="Saved Properties"
          value={favourites.length}
          icon={Heart}
          color="red"
        />
      </div>

      {/* Recent Applications */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Applications</h2>
          <Link
            to="/dashboard/applications"
            className="text-sm text-primary-800 hover:underline"
          >
            View all →
          </Link>
        </div>
        {appsLoading ? (
          <Spinner />
        ) : applications.length === 0 ? (
          <div className="text-center py-8">
            <Building2 size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No applications yet.</p>
            <Link
              to="/listings"
              className="text-sm text-primary-800 hover:underline mt-1 inline-block"
            >
              Browse properties →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <div
                key={app._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 size={18} className="text-primary-800" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {app.propertyId?.title || "Property"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(app.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {app.propertyId?.rentPrice && (
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {formatCurrency(app.propertyId.rentPrice)}
                    </span>
                  )}
                  <ApplicationStatusBadge status={app.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Bookings */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Upcoming Inspections</h2>
          <Link
            to="/dashboard/bookings"
            className="text-sm text-primary-800 hover:underline"
          >
            View all →
          </Link>
        </div>
        {bookingsLoading ? (
          <Spinner />
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No inspections booked yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 3).map((b) => (
              <div
                key={b._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar size={18} className="text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {b.propertyId?.title || "Property Inspection"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(b.slotDate)} at {b.slotTime}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full
                  ${b.status === "booked" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
