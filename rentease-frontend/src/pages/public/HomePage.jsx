import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, MapPin, Shield, TrendingUp, Map } from "lucide-react";
import PropertyCard from "../../components/property/PropertyCard";
import Spinner from "../../components/common/Spinner";
import {
  useFeaturedProperties,
  useProperties,
} from "../../hooks/useProperties";

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: featuredData, isLoading: featuredLoading } =
    useFeaturedProperties();
  const { data: recentData, isLoading: recentLoading } = useProperties({
    limit: 8,
    sort: "newest",
  });

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/listings?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Find Your Perfect
            <br />
            <span className="text-blue-200">Rental Property</span>
          </h1>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Browse thousands of properties across Australia with data-driven
            insights.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex gap-3 max-w-2xl mx-auto"
          >
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search suburb, city or postcode..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button
              type="submit"
              className="bg-white text-primary-800 font-semibold px-6 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              Search
            </button>
          </form>

          {/* Quick links */}
          <div className="flex items-center justify-center gap-4 mt-6 text-sm">
            <Link
              to="/listings"
              className="text-blue-200 hover:text-white transition-colors"
            >
              Browse All
            </Link>
            <span className="text-blue-400">•</span>
            <Link
              to="/map"
              className="text-blue-200 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Map size={14} /> Map View
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Properties Listed", value: "50+" },
            { label: "Australian Suburbs", value: "20+" },
            { label: "Property Types", value: "5" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-primary-800">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED ───────────────────────────────────────────────── */}
      {(featuredLoading || featuredData?.data?.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Properties
              </h2>
              <p className="text-sm text-gray-500 mt-1">Hand-picked listings</p>
            </div>
            <Link
              to="/listings"
              className="text-sm text-primary-800 hover:underline font-medium"
            >
              View all →
            </Link>
          </div>
          {featuredLoading ? (
            <Spinner size="md" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredData?.data?.map((p) => (
                <PropertyCard key={p._id} property={p} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── RECENT LISTINGS ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Latest Properties
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Recently added listings
            </p>
          </div>
          <Link
            to="/listings"
            className="text-sm text-primary-800 hover:underline font-medium"
          >
            View all →
          </Link>
        </div>
        {recentLoading ? (
          <Spinner size="md" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentData?.data?.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── WHY RENTEASE ───────────────────────────────────────────── */}
      <section className="bg-gray-50 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Why RentEase?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Smart Search",
                desc: "Filter by price, bedrooms, amenities and location to find exactly what you need.",
              },
              {
                icon: Shield,
                title: "Verified Listings",
                desc: "All properties are reviewed and approved by our admin team before going live.",
              },
              {
                icon: TrendingUp,
                title: "Data-Driven Insights",
                desc: "Powered by real Australian rental market data so you can make informed decisions.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="bg-primary-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-primary-800" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-primary-800 text-white py-14 px-4 text-center">
        <h2 className="text-2xl font-bold mb-3">
          Ready to find your next home?
        </h2>
        <p className="text-blue-100 mb-7 text-sm">
          Join hundreds of tenants and owners on RentEase.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/listings"
            className="bg-white text-primary-800 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm"
          >
            Browse Properties
          </Link>
          <Link
            to="/register"
            className="border border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors text-sm"
          >
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}
