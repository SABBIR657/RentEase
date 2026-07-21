import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  FileText,
  Calendar,
  Flag,
  BarChart2,
} from "lucide-react";
import api from "../../api/axiosInstance";
import StatCard from "../../components/dashboard/StatCard";
import Spinner from "../../components/common/Spinner";
import { formatDate } from "../../utils/formatters";

export default function AdminDashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => api.get("/analytics/platform-stats").then((r) => r.data),
  });

  const { data: pendingData } = useQuery({
    queryKey: ["pending-listings"],
    queryFn: () =>
      api.get("/properties/admin/pending-approval").then((r) => r.data),
  });

  const { data: reportsData } = useQuery({
    queryKey: ["reports"],
    queryFn: () => api.get("/reports?status=open").then((r) => r.data),
  });

  const { data: usersData } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => api.get("/users").then((r) => r.data),
  });

  const stats = statsData?.data || {};
  const pending = pendingData?.data || [];
  const reports = reportsData?.data || [];
  const users = usersData?.data || [];

  const recentUsers = users.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle">Platform overview and management.</p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={stats.users || 0}
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Live Properties"
            value={stats.properties || 0}
            icon={Building2}
            color="green"
          />
          <StatCard
            label="Total Applications"
            value={stats.applications || 0}
            icon={FileText}
            color="purple"
          />
          <StatCard
            label="Total Bookings"
            value={stats.bookings || 0}
            icon={Calendar}
            color="orange"
          />
        </div>
      )}

      {/* Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={`card p-4 border-l-4 ${pending.length > 0 ? "border-yellow-400" : "border-green-400"}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Pending Listings</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">
                {pending.length}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Awaiting your approval
              </p>
            </div>
            <Building2 size={32} className="text-yellow-400" />
          </div>
          <Link
            to="/admin/listings"
            className="text-sm text-primary-800 hover:underline mt-3 inline-block font-medium"
          >
            Review listings →
          </Link>
        </div>

        <div
          className={`card p-4 border-l-4 ${reports.length > 0 ? "border-red-400" : "border-green-400"}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Open Reports</p>
              <p className="text-2xl font-bold mt-1 text-red-600">
                {reports.length}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Require attention</p>
            </div>
            <Flag size={32} className="text-red-400" />
          </div>
          <Link
            to="/admin/reports"
            className="text-sm text-primary-800 hover:underline mt-3 inline-block font-medium"
          >
            View reports →
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            to: "/admin/users",
            icon: Users,
            label: "Manage Users",
            color: "bg-blue-50 text-blue-700",
          },
          {
            to: "/admin/listings",
            icon: Building2,
            label: "Review Listings",
            color: "bg-yellow-50 text-yellow-700",
          },
          {
            to: "/admin/reports",
            icon: Flag,
            label: "View Reports",
            color: "bg-red-50 text-red-700",
          },
          {
            to: "/analytics",
            icon: BarChart2,
            label: "Analytics",
            color: "bg-green-50 text-green-700",
          },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link
            key={to}
            to={to}
            className="card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center"
          >
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon size={20} />
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Users */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Users</h2>
          <Link
            to="/admin/users"
            className="text-sm text-primary-800 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {recentUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary-800 text-white flex items-center justify-center font-bold text-sm">
                  {user.name?.[0] || "?"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize
                  ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : user.role === "owner"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {user.role}
                </span>
                {user.isBanned && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    Banned
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
