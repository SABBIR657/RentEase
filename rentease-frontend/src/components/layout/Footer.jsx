import { Link } from "react-router-dom";
import { Home, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary-800 text-white p-1.5 rounded-lg">
                <Home size={16} />
              </div>
              <span className="text-white font-bold text-lg">RentEase</span>
            </div>
            <p className="text-sm leading-relaxed">
              A data-driven property rental platform connecting tenants and
              owners across Australia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Browse</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/listings"
                  className="hover:text-white transition-colors"
                >
                  All Properties
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition-colors">
                  Map View
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/login"
                  className="hover:text-white transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-white transition-colors"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} />
                <span>support@rentease.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} />
                <span>+61 2 0000 0000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-xs text-center">
          © {new Date().getFullYear()} RentEase. ICT Project Capstone. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}
