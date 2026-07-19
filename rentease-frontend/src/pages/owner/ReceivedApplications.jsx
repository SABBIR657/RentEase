import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { FileText, Check, X, Download } from "lucide-react";
import api from "../../api/axiosInstance";
import ApplicationStatusBadge from "../../components/dashboard/ApplicationStatusBadge";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { formatDate } from "../../utils/formatters";

export default function ReceivedApplications() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null); // 'approve' | 'reject'
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["received-applications"],
    queryFn: () => api.get("/applications/received").then((r) => r.data),
  });

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (id) => api.patch(`/applications/${id}/approve`),
    onSuccess: () => {
      toast.success("Application approved! Lease generated.");
      queryClient.invalidateQueries(["received-applications"]);
      setSelected(null);
      setAction(null);
    },
    onError: () => toast.error("Failed to approve application"),
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: ({ id, reason }) =>
      api.patch(`/applications/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success("Application rejected.");
      queryClient.invalidateQueries(["received-applications"]);
      setSelected(null);
      setAction(null);
      setRejectReason("");
    },
    onError: () => toast.error("Failed to reject application"),
  });

  const applications = data?.data || [];
  const pending = applications.filter((a) => a.status === "pending");
  const reviewed = applications.filter((a) => a.status !== "pending");

  const openAction = (app, act) => {
    setSelected(app);
    setAction(act);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Received Applications</h1>
        <p className="section-subtitle">
          Review and respond to tenant applications.
        </p>
      </div>

      {isLoading ? (
        <Spinner size="lg" className="py-20" />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Applications from tenants will appear here."
        />
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-3">
                Pending Review ({pending.length})
              </h2>
              <div className="space-y-4">
                {pending.map((app) => (
                  <div key={app._id} className="card p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-primary-800 text-white flex items-center justify-center font-bold">
                          {app.tenantId?.name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {app.tenantId?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {app.tenantId?.email}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Applied for:{" "}
                            <span className="font-medium text-gray-700">
                              {app.propertyId?.title}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(app.createdAt)}
                          </p>
                        </div>
                      </div>
                      <ApplicationStatusBadge status={app.status} />
                    </div>

                    {/* Cover message */}
                    {app.message && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium mb-1">
                          Cover Message:
                        </p>
                        <p className="text-sm text-gray-700">{app.message}</p>
                      </div>
                    )}

                    {/* Documents */}
                    {app.documents?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 font-medium mb-2">
                          Documents:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {app.documents.map((doc, i) => (
                            <a
                              key={i}
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-100"
                            >
                              <Download size={11} /> {doc.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => openAction(app, "approve")}
                      >
                        <Check size={14} className="mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => openAction(app, "reject")}
                      >
                        <X size={14} className="mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewed */}
          {reviewed.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-3">
                Reviewed ({reviewed.length})
              </h2>
              <div className="space-y-3">
                {reviewed.map((app) => (
                  <div key={app._id} className="card p-4 opacity-80">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">
                          {app.tenantId?.name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {app.tenantId?.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {app.propertyId?.title} ·{" "}
                            {formatDate(app.createdAt)}
                          </p>
                          {app.rejectReason && (
                            <p className="text-xs text-red-500 mt-0.5">
                              Reason: {app.rejectReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={action === "approve" && !!selected}
        onClose={() => {
          setSelected(null);
          setAction(null);
        }}
        title="Approve Application"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-2">
          Approve application from{" "}
          <span className="font-medium">{selected?.tenantId?.name}</span>?
        </p>
        <p className="text-xs text-gray-400 mb-5">
          A PDF lease agreement will be automatically generated and the tenant
          will be notified.
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
          setRejectReason("");
        }}
        title="Reject Application"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-3">
          Reject application from{" "}
          <span className="font-medium">{selected?.tenantId?.name}</span>?
        </p>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason (optional)
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Provide a reason for rejection..."
            className="input-field resize-none"
          />
        </div>
        <div className="flex gap-3">
          <Button
            variant="danger"
            loading={rejecting}
            onClick={() => reject({ id: selected._id, reason: rejectReason })}
          >
            Reject Application
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSelected(null);
              setAction(null);
              setRejectReason("");
            }}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
