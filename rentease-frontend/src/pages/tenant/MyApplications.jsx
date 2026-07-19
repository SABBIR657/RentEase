import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Building2, Download, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import ApplicationStatusBadge from "../../components/dashboard/ApplicationStatusBadge";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { formatDate, formatCurrency } from "../../utils/formatters";

export default function MyApplications() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => api.get("/applications/my-applications").then((r) => r.data),
  });

  const { mutate: withdraw, isPending: withdrawing } = useMutation({
    mutationFn: (id) => api.patch(`/applications/${id}/withdraw`),
    onSuccess: () => {
      toast.success("Application withdrawn");
      queryClient.invalidateQueries(["my-applications"]);
      setSelected(null);
    },
    onError: () => toast.error("Failed to withdraw application"),
  });

  const applications = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">My Applications</h1>
        <p className="section-subtitle">
          Track all your rental applications in one place.
        </p>
      </div>

      {isLoading ? (
        <Spinner size="lg" className="py-20" />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No applications yet"
          description="Start browsing properties and apply for rentals."
          actionLabel="Browse Properties"
          onAction={() => (window.location.href = "/listings")}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="card p-5">
              <div className="flex items-start gap-4">
                {/* Property Image */}
                <img
                  src={
                    app.propertyId?.images?.[0] ||
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=60"
                  }
                  alt="property"
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=60";
                  }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <Link
                        to={`/properties/${app.propertyId?._id}`}
                        className="font-semibold text-gray-900 hover:text-primary-800 transition-colors line-clamp-1"
                      >
                        {app.propertyId?.title || "Property"}
                      </Link>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {app.propertyId?.suburb} ·{" "}
                        {app.propertyId?.rentPrice &&
                          formatCurrency(app.propertyId.rentPrice)}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Applied on {formatDate(app.createdAt)}
                  </p>

                  {/* Reject reason */}
                  {app.status === "rejected" && app.rejectReason && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600">
                        <span className="font-medium">Reason: </span>
                        {app.rejectReason}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {app.status === "approved" && app.leaseUrl && (
                      <a href={app.leaseUrl} download="lease-agreement.pdf">
                        <Button size="sm" variant="success">
                          <Download size={14} className="mr-1" />
                          Download Lease
                        </Button>
                      </a>
                    )}
                    {app.status === "pending" && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setSelected(app)}
                      >
                        <X size={14} className="mr-1" />
                        Withdraw
                      </Button>
                    )}
                    <Link to={`/properties/${app.propertyId?._id}`}>
                      <Button size="sm" variant="ghost">
                        View Property
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Withdraw Application"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to withdraw your application for{" "}
          <span className="font-medium">{selected?.propertyId?.title}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="danger"
            loading={withdrawing}
            onClick={() => withdraw(selected._id)}
          >
            Yes, Withdraw
          </Button>
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
