import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Button from "../common/Button";
import {
  PROPERTY_TYPES,
  AMENITIES_LIST,
  SORT_OPTIONS,
} from "../../utils/constants";

export default function PropertyFilters({ onFilter, initialFilters = {} }) {
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    sort: "newest",
    ...initialFilters,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Remove empty values
    const clean = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== ""),
    );
    onFilter(clean);
  };

  const handleReset = () => {
    const reset = {
      search: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      sort: "newest",
    };
    setFilters(reset);
    onFilter({});
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => v !== "" && k !== "sort",
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6"
    >
      {/* Main search row */}
      <div className="flex gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search suburb, city or keyword..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="input-field pl-9"
          />
        </div>

        {/* Type */}
        <select
          value={filters.type}
          onChange={(e) => update("type", e.target.value)}
          className="input-field w-40"
        >
          <option value="">All Types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => update("sort", e.target.value)}
          className="input-field w-44"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors
            ${showAdvanced ? "bg-primary-50 border-primary-300 text-primary-800" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
        >
          <SlidersHorizontal size={15} />
          Filters{" "}
          {hasActiveFilters && (
            <span className="bg-primary-800 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              !
            </span>
          )}
        </button>

        <Button type="submit" size="md">
          Search
        </Button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Min Price ($/wk)
            </label>
            <input
              type="number"
              placeholder="e.g. 300"
              value={filters.minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
              className="input-field"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Max Price ($/wk)
            </label>
            <input
              type="number"
              placeholder="e.g. 800"
              value={filters.maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
              className="input-field"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Bedrooms</label>
            <select
              value={filters.bedrooms}
              onChange={(e) => update("bedrooms", e.target.value)}
              className="input-field"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Bathrooms
            </label>
            <select
              value={filters.bathrooms}
              onChange={(e) => update("bathrooms", e.target.value)}
              className="input-field"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </form>
  );
}
