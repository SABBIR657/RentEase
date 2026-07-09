import { useState } from "react";
import { Link } from "react-router-dom";
import { Map } from "lucide-react";
import PropertyFilters from "../../components/property/PropertyFilters";
import PropertyGrid from "../../components/property/PropertyGrid";
import { useProperties } from "../../hooks/useProperties";

export default function ListingsPage() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProperties({ ...filters, page, limit: 12 });

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // reset to page 1 on new filter
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Browse Properties
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Find your perfect rental property
          </p>
        </div>
        <Link
          to="/map"
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Map size={16} />
          Map View
        </Link>
      </div>

      {/* Filters */}
      <PropertyFilters onFilter={handleFilter} />

      {/* Results */}
      <PropertyGrid
        properties={data?.data}
        isLoading={isLoading}
        total={data?.total}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
