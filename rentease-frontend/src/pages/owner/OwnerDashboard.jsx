import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Building2, FileText, Calendar, PlusSquare, Eye } from "lucide-react";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import StatCard from "../../components/dashboard/StatCard";
import ApplicationStatusBadge from "../../components/dashboard/ApplicationStatusBadge";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { formatDate, formatCurrency } from "../../utils/formatters";

export default function OwnerDashboard() {
  const { user } = useAuthStore();

  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ["my-listings"],
    queryFn: () => api.get("/properties/owner/my-listings").then((r) => r.data),
  });

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ["received-applications"],
    queryFn: () => api.get("/applications/received").then((r) => r.data),
  });

  const { data: slotsData } = useQuery({
    queryKey: ["my-slots"],
    queryFn: () => api.get("/bookings/my-slots").then((r) => r.data),
  });

  const listings = listingsData?.data || [];
  const applications = appsData?.data || [];
  const slots = slotsData?.data || [];

  const pending = applications.filter((a) => a.status === "pending").length;
  const approved = applications.filter((a) => a.status === "approved").length;
  const booked = slots.filter((s) => s.status === "booked").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">
            Welcome, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="section-subtitle">
            Manage your properties and applications.
          </p>
        </div>
        <Link to="/owner/listings/create">
          <Button>
            <PlusSquare size={16} className="mr-2" />
            Add New Listing
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My Listings"
          value={listings.length}
          icon={Building2}
          color="blue"
        />
        <StatCard
          label="Pending Applications"
          value={pending}
          icon={FileText}
          color="yellow"
        />
        <StatCard
          label="Approved Applications"
          value={approved}
          icon={FileText}
          color="green"
        />
        <StatCard
          label="Booked Inspections"
          value={booked}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* My Listings */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">My Listings</h2>
          <Link
            to="/owner/listings"
            className="text-sm text-primary-800 hover:underline"
          >
            View all →
          </Link>
        </div>
        {listingsLoading ? (
          <Spinner />
        ) : listings.length === 0 ? (
          <div className="text-center py-8">
            <Building2 size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-3">No listings yet.</p>
            <Link to="/owner/listings/create">
              <Button size="sm">Add Your First Listing</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.slice(0, 5).map((listing) => (
              <div
                key={listing._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      listing.images?.[0] ||
                      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&q=60"
                    }
                    alt={listing.title}
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&q=60";
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {listing.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {listing.suburb} · {formatCurrency(listing.rentPrice)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${listing.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {listing.isApproved ? "Live" : "Pending"}
                  </span>
                  <Link to={`/properties/${listing._id}`}>
                    <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                      <Eye size={14} className="text-gray-500" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Applications</h2>
          <Link
            to="/owner/applications"
            className="text-sm text-primary-800 hover:underline"
          >
            View all →
          </Link>
        </div>
        {appsLoading ? (
          <Spinner />
        ) : applications.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No applications received yet.
          </p>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <div
                key={app._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-800 text-white flex items-center justify-center text-sm font-bold">
                    {app.tenantId?.name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {app.tenantId?.name}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {app.propertyId?.title} · {formatDate(app.createdAt)}
                    </p>
                  </div>
                </div>
                <ApplicationStatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
