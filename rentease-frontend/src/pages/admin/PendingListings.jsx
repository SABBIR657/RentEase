import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle, XCircle, Star, MapPin, Bed, Bath } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { Link } from "react-router-dom";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=60";

export default function PendingListings() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["pending-listings"],
    queryFn: () =>
      api.get("/properties/admin/pending-approval").then((r) => r.data),
  });

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (id) => api.patch(`/properties/${id}/approve`),
    onSuccess: () => {
      toast.success("Listing approved and is now live!");
      queryClient.invalidateQueries(["pending-listings"]);
      setSelected(null);
      setAction(null);
    },
    onError: () => toast.error("Failed to approve listing"),
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: (id) => api.patch(`/properties/${id}/reject`),
    onSuccess: () => {
      toast.success("Listing rejected");
      queryClient.invalidateQueries(["pending-listings"]);
      setSelected(null);
      setAction(null);
    },
    onError: () => toast.error("Failed to reject listing"),
  });

  const { mutate: feature } = useMutation({
    mutationFn: (id) => api.patch(`/properties/${id}/feature`),
    onSuccess: () => {
      toast.success("Featured status toggled");
      queryClient.invalidateQueries(["pending-listings"]);
    },
  });

  const listings = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Pending Listings</h1>
        <p className="section-subtitle">
          Review and approve property listings before they go live.
        </p>
      </div>

      {isLoading ? (
        <Spinner size="lg" className="py-20" />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="All caught up!"
          description="No listings pending approval."
        />
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing._id} className="card p-5">
              <div className="flex items-start gap-4">
                <img
                  src={listing.images?.[0] || PLACEHOLDER}
                  alt={listing.title}
                  className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                        <MapPin size={11} />
                        <span>
                          {listing.suburb}, {listing.state}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-primary-800 mt-1">
                        {formatCurrency(listing.rentPrice)}
                      </p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">
                      Pending Approval
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Bed size={11} /> {listing.bedrooms} bed
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath size={11} /> {listing.bathrooms} bath
                    </span>
                    <span className="capitalize">{listing.type}</span>
                    <span>By: {listing.ownerId?.name || "Unknown"}</span>
                    <span>Submitted: {formatDate(listing.createdAt)}</span>
                  </div>

                  {listing.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {listing.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => {
                        setSelected(listing);
                        setAction("approve");
                      }}
                    >
                      <CheckCircle size={13} className="mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setSelected(listing);
                        setAction("reject");
                      }}
                    >
                      <XCircle size={13} className="mr-1" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => feature(listing._id)}
                    >
                      <Star size={13} className="mr-1" />
                      {listing.isFeatured ? "Unfeature" : "Feature"}
                    </Button>
                    <Link to={`/properties/${listing._id}`}>
                      <Button size="sm" variant="ghost">
                        Preview
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={action === "approve" && !!selected}
        onClose={() => {
          setSelected(null);
          setAction(null);
        }}
        title="Approve Listing"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Approve <span className="font-medium">{selected?.title}</span>? It
          will go live immediately and be visible to all users.
        </p>
        <div className="flex gap-3">
          <Button
            variant="success"
            loading={approving}
            onClick={() => approve(selected._id)}
          >
            Yes, Approve
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSelected(null);
              setAction(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={action === "reject" && !!selected}
        onClose={() => {
          setSelected(null);
          setAction(null);
        }}
        title="Reject Listing"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Reject <span className="font-medium">{selected?.title}</span>? The
          owner will be notified.
        </p>
        <div className="flex gap-3">
          <Button
            variant="danger"
            loading={rejecting}
            onClick={() => reject(selected._id)}
          >
            Yes, Reject
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSelected(null);
              setAction(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
