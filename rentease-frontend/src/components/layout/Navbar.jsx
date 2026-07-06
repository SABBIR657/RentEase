import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Bell, MessageSquare, ChevronDown, Home } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";
import { useLogout } from "../../hooks/useAuth";
import { getInitials } from "../../utils/formatters";

export default function Navbar() {
  const { user, token } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const logout = useLogout();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getDashboardLink = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "owner") return "/owner";
    return "/dashboard";
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-800 text-white p-1.5 rounded-lg">
              <Home size={18} />
            </div>
            <span className="text-xl font-bold text-primary-800">RentEase</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/listings"
              className="text-sm text-gray-600 hover:text-primary-800 font-medium transition-colors"
            >
              Browse
            </Link>
            <Link
              to="/map"
              className="text-sm text-gray-600 hover:text-primary-800 font-medium transition-colors"
            >
              Map View
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <>
                {/* Messages */}
                <Link
                  to="/messages"
                  className="p-2 text-gray-500 hover:text-primary-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MessageSquare size={20} />
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-500 hover:text-primary-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-800 text-white flex items-center justify-center text-xs font-bold">
                        {getInitials(user?.name)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Profile
                        </Link>
                        {(user?.role === "admin" || user?.role === "owner") && (
                          <Link
                            to="/analytics"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Analytics
                          </Link>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-primary-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2 rounded-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link
            to="/listings"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Browse
          </Link>
          <Link
            to="/map"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Map View
          </Link>
          {token ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <Link
                to="/messages"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Messages
              </Link>
              <Link
                to="/notifications"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Notifications
              </Link>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
