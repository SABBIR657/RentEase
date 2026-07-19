import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  PlusSquare,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function MyListings() {
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-listings"],
    queryFn: () => api.get("/properties/owner/my-listings").then((r) => r.data),
  });

  const { mutate: deleteListing, isPending: deleting } = useMutation({
    mutationFn: (id) => api.delete(`/properties/${id}`),
    onSuccess: () => {
      toast.success("Listing deleted");
      queryClient.invalidateQueries(["my-listings"]);
      setToDelete(null);
    },
    onError: () => toast.error("Failed to delete listing"),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(`/properties/${id}/status`, { status }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries(["my-listings"]);
    },
  });

  const listings = data?.data || [];

  const PLACEHOLDER =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=60";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">My Listings</h1>
          <p className="section-subtitle">Manage all your property listings.</p>
        </div>
        <Link to="/owner/listings/create">
          <Button>
            <PlusSquare size={16} className="mr-2" />
            Add Listing
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Spinner size="lg" className="py-20" />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={PlusSquare}
          title="No listings yet"
          description="Add your first property listing to get started."
          actionLabel="Add Listing"
          onAction={() => (window.location.href = "/owner/listings/create")}
        />
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing._id} className="card p-4">
              <div className="flex items-start gap-4">
                {/* Image */}
                <img
                  src={listing.images?.[0] || PLACEHOLDER}
                  alt={listing.title}
                  className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER;
                  }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {listing.suburb}, {listing.state} ·{" "}
                        {formatCurrency(listing.rentPrice)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {listing.bedrooms} bed · {listing.bathrooms} bath ·{" "}
                        {listing.type}
                      </p>
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium
                        ${listing.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {listing.isApproved ? (
                          <>
                            <CheckCircle size={11} /> Approved
                          </>
                        ) : (
                          <>
                            <Clock size={11} /> Pending Approval
                          </>
                        )}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium
                        ${
                          listing.status === "available"
                            ? "bg-blue-100 text-blue-700"
                            : listing.status === "rented"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Link to={`/properties/${listing._id}`}>
                      <Button size="sm" variant="ghost">
                        <Eye size={13} className="mr-1" /> View
                      </Button>
                    </Link>
                    <Link to={`/owner/listings/edit/${listing._id}`}>
                      <Button size="sm" variant="secondary">
                        <Edit size={13} className="mr-1" /> Edit
                      </Button>
                    </Link>

                    {/* Status toggle */}
                    {listing.status === "available" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          updateStatus({ id: listing._id, status: "rented" })
                        }
                      >
                        Mark as Rented
                      </Button>
                    ) : listing.status === "rented" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          updateStatus({ id: listing._id, status: "available" })
                        }
                      >
                        Mark as Available
                      </Button>
                    ) : null}

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setToDelete(listing)}
                    >
                      <Trash2 size={13} className="mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete Listing"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete{" "}
          <span className="font-medium">{toDelete?.title}</span>? All associated
          applications and bookings will also be removed.
        </p>
        <div className="flex gap-3">
          <Button
            variant="danger"
            loading={deleting}
            onClick={() => deleteListing(toDelete._id)}
          >
            Yes, Delete
          </Button>
          <Button variant="secondary" onClick={() => setToDelete(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
