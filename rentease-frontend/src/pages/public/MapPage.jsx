import { useState, useMemo } from "react";
import { Search, List, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import PropertyMap from "../../components/map/PropertyMap";
import PropertyCard from "../../components/property/PropertyCard";
import Spinner from "../../components/common/Spinner";
import { useMapProperties } from "../../hooks/useProperties";
import { formatCurrency } from "../../utils/formatters";
import { PROPERTY_TYPES } from "../../utils/constants";

export default function MapPage() {
  const { data, isLoading } = useMapProperties();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [selected, setSelected] = useState(null);
  const [showList, setShowList] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);

  const properties = data?.data || [];

  // Filter properties based on search inputs
  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch =
        !search ||
        p.suburb?.toLowerCase().includes(search.toLowerCase()) ||
        p.locality?.toLowerCase().includes(search.toLowerCase()) ||
        p.title?.toLowerCase().includes(search.toLowerCase());

      const matchType = !type || p.type === type;
      const matchPrice = !maxPrice || p.rentPrice <= Number(maxPrice);
      const matchBedrooms = !bedrooms || p.bedrooms >= Number(bedrooms);

      return matchSearch && matchType && matchPrice && matchBedrooms;
    });
  }, [properties, search, type, maxPrice, bedrooms]);

  // When user clicks a property in list → fly map to it
  const handleSelectProperty = (property) => {
    setSelected(property);
    const [lng, lat] = property.location?.coordinates || [0, 0];
    if (lat && lng) setMapCenter([lat, lng]);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search suburb or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-8 py-1.5 text-sm"
            />
          </div>

          {/* Type filter */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input-field w-36 py-1.5 text-sm"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>

          {/* Max price */}
          <input
            type="number"
            placeholder="Max $/wk"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input-field w-28 py-1.5 text-sm"
          />

          {/* Bedrooms */}
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="input-field w-28 py-1.5 text-sm"
          >
            <option value="">Any beds</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+ beds
              </option>
            ))}
          </select>

          {/* Results count */}
          <span className="text-sm text-gray-500 flex-shrink-0">
            {filtered.length} properties
          </span>

          {/* Toggle list */}
          <button
            onClick={() => setShowList(!showList)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition-colors flex-shrink-0
              ${showList ? "bg-primary-800 text-white border-primary-800" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
          >
            <List size={15} />
            {showList ? "Hide List" : "Show List"}
          </button>

          {/* Back to listings */}
          <Link
            to="/listings"
            className="text-sm text-primary-800 hover:underline flex-shrink-0"
          >
            ← List View
          </Link>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Property List Sidebar */}
        {showList && (
          <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
            {isLoading ? (
              <div className="py-10">
                <Spinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm px-4">
                No properties match your filters
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {filtered.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => handleSelectProperty(p)}
                    className={`w-full text-left rounded-xl border transition-all overflow-hidden
                      ${
                        selected?._id === p._id
                          ? "border-primary-800 shadow-md ring-1 ring-primary-800"
                          : "border-gray-100 hover:border-gray-300 hover:shadow-sm"
                      }`}
                  >
                    {/* Mini card */}
                    <div className="flex gap-3 p-3">
                      <img
                        src={
                          p.images?.[0] ||
                          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=60"
                        }
                        alt={p.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=60";
                        }}
                      />
                      <div className="overflow-hidden">
                        <p className="font-semibold text-primary-800 text-sm">
                          {formatCurrency(p.rentPrice)}
                        </p>
                        <p className="text-xs text-gray-700 font-medium line-clamp-1 mt-0.5">
                          {p.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {p.suburb}, {p.state}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {p.bedrooms} bed · {p.bathrooms} bath · {p.type}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="text-sm text-gray-500 mt-3">Loading map...</p>
              </div>
            </div>
          ) : (
            <PropertyMap
              properties={filtered}
              center={mapCenter}
              height="100%"
            />
          )}

          {/* No coordinates warning */}
          {!isLoading &&
            filtered.length > 0 &&
            (() => {
              const withCoords = filtered.filter((p) => {
                const [lng, lat] = p.location?.coordinates || [0, 0];
                return lat !== 0 && lng !== 0;
              }).length;
              return withCoords === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <div className="text-center p-6">
                    <p className="text-gray-600 font-medium mb-1">
                      No map coordinates available
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      Your dataset doesn't have latitude/longitude data
                    </p>
                    <Link
                      to="/listings"
                      className="btn-primary text-sm px-4 py-2 rounded-lg"
                    >
                      Switch to List View
                    </Link>
                  </div>
                </div>
              ) : null;
            })()}
        </div>
      </div>
    </div>
  );
}
