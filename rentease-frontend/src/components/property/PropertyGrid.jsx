import PropertyCard from "./PropertyCard";
import Spinner from "../common/Spinner";
import EmptyState from "../common/EmptyState";
import { Building2 } from "lucide-react";

export default function PropertyGrid({
  properties,
  isLoading,
  total,
  page,
  onPageChange,
}) {
  if (isLoading)
    return (
      <div className="py-20">
        <Spinner size="lg" />
      </div>
    );

  if (!properties?.length)
    return (
      <EmptyState
        icon={Building2}
        title="No properties found"
        description="Try adjusting your search filters to find more results."
      />
    );

  const totalPages = Math.ceil((total || properties.length) / 12);

  return (
    <div>
      {/* Count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing{" "}
        <span className="font-medium text-gray-900">{properties.length}</span>
        {total && ` of ${total}`} properties
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {properties.map((p) => (
          <PropertyCard key={p._id} property={p} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => onPageChange(pg)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors
                ${
                  pg === page
                    ? "bg-primary-800 text-white border-primary-800"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
            >
              {pg}
            </button>
          ))}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
