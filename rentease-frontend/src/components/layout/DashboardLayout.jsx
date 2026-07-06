import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  FileText,
  Calendar,
  Heart,
  Building2,
  PlusSquare,
  Users,
  Flag,
  BarChart2,
  MessageSquare,
  Bell,
  User,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import { getInitials } from "../../utils/formatters";

const NAV = {
  tenant: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/applications", icon: FileText, label: "My Applications" },
    { to: "/dashboard/bookings", icon: Calendar, label: "My Bookings" },
    { to: "/dashboard/favourites", icon: Heart, label: "Favourites" },
  ],
  owner: [
    { to: "/owner", icon: LayoutDashboard, label: "Overview" },
    { to: "/owner/listings", icon: Building2, label: "My Listings" },
    { to: "/owner/listings/create", icon: PlusSquare, label: "Add Listing" },
    { to: "/owner/applications", icon: FileText, label: "Applications" },
    { to: "/analytics", icon: BarChart2, label: "Analytics" },
  ],
  admin: [
    { to: "/admin", icon: LayoutDashboard, label: "Overview" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/listings", icon: Building2, label: "Pending Listings" },
    { to: "/admin/reports", icon: Flag, label: "Reports" },
    { to: "/analytics", icon: BarChart2, label: "Analytics" },
  ],
};

const SHARED_NAV = [
  { to: "/messages", icon: MessageSquare, label: "Messages" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function DashboardLayout({ children }) {
  const { user } = useAuthStore();
  const logout = useLogout();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = NAV[user?.role] || [];

  const NavLink = ({ to, icon: Icon, label }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
          ${
            active
              ? "bg-primary-800 text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
      >
        <Icon size={18} />
        {label}
        {active && <ChevronRight size={14} className="ml-auto" />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
        <div className="bg-primary-800 text-white p-1.5 rounded-lg">
          <Home size={16} />
        </div>
        <span className="font-bold text-primary-800 text-lg">RentEase</span>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary-800 text-white flex items-center justify-center text-xs font-bold">
              {getInitials(user?.name)}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}
        <div className="pt-3 mt-3 border-t border-gray-100 space-y-1">
          {SHARED_NAV.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-1">
        <Link
          to="/listings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Building2 size={18} /> Browse Properties
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <X size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-primary-800">RentEase</span>
          <div className="w-9" />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
