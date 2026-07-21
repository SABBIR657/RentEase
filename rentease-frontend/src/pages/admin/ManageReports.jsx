import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Flag, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { formatDate } from "../../utils/formatters";

export default function ManageReports() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null);
  const [resolution, setResolution] = useState("");
  const [filter, setFilter] = useState("open");

  const { data, isLoading } = useQuery({
    queryKey: ["reports", filter],
    queryFn: () => api.get(`/reports?status=${filter}`).then((r) => r.data),
  });

  const { mutate: resolve, isPending: resolving } = useMutation({
    mutationFn: ({ id, resolution }) =>
      api.patch(`/reports/${id}/resolve`, { resolution }),
    onSuccess: () => {
      toast.success("Report resolved");
      queryClient.invalidateQueries(["reports"]);
      setSelected(null);
      setAction(null);
      setResolution("");
    },
  });

  const { mutate: dismiss, isPending: dismissing } = useMutation({
    mutationFn: (id) => api.patch(`/reports/${id}/dismiss`),
    onSuccess: () => {
      toast.success("Report dismissed");
      queryClient.invalidateQueries(["reports"]);
      setSelected(null);
      setAction(null);
    },
  });

  const reports = data?.data || [];

  const reasonColors = {
    fraud: "red",
    inaccurate: "yellow",
    inappropriate: "orange",
    spam: "gray",
    other: "blue",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Manage Reports</h1>
        <p className="section-subtitle">
          Review and resolve reported listings.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["open", "resolved", "dismissed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors capitalize
              ${
                filter === s
                  ? "bg-primary-800 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner size="lg" className="py-20" />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No reports"
          description={`No ${filter} reports found.`}
        />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize
                      bg-${reasonColors[report.reason] || "gray"}-100
                      text-${reasonColors[report.reason] || "gray"}-700`}
                    >
                      {report.reason}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize
                      ${
                        report.status === "open"
                          ? "bg-yellow-100 text-yellow-700"
                          : report.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <p className="font-semibold text-gray-900 text-sm">
                    Property: {report.propertyId?.title || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Reported by: {report.reportedBy?.name} ·{" "}
                    {formatDate(report.createdAt)}
                  </p>

                  {report.description && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg">
                      {report.description}
                    </p>
                  )}

                  {report.resolution && (
                    <p className="text-xs text-green-600 mt-2">
                      Resolution: {report.resolution}
                    </p>
                  )}
                </div>
              </div>

              {report.status === "open" && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => {
                      setSelected(report);
                      setAction("resolve");
                    }}
                  >
                    <CheckCircle size={13} className="mr-1" /> Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelected(report);
                      setAction("dismiss");
                    }}
                  >
                    <XCircle size={13} className="mr-1" /> Dismiss
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      <Modal
        isOpen={action === "resolve" && !!selected}
        onClose={() => {
          setSelected(null);
          setAction(null);
          setResolution("");
        }}
        title="Resolve Report"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-3">
          Resolve report on{" "}
          <span className="font-medium">{selected?.propertyId?.title}</span>?
        </p>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resolution Note
          </label>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={3}
            placeholder="Describe action taken..."
            className="input-field resize-none"
          />
        </div>
        <div className="flex gap-3">
          <Button
            variant="success"
            loading={resolving}
            onClick={() => resolve({ id: selected._id, resolution })}
          >
            Mark Resolved
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSelected(null);
              setAction(null);
              setResolution("");
            }}
          >
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Dismiss Modal */}
      <Modal
        isOpen={action === "dismiss" && !!selected}
        onClose={() => {
          setSelected(null);
          setAction(null);
        }}
        title="Dismiss Report"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Dismiss this report as invalid?
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            loading={dismissing}
            onClick={() => dismiss(selected._id)}
          >
            Yes, Dismiss
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
