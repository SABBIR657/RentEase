import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Ban, CheckCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { formatDate, getInitials } from "../../utils/formatters";

export default function ManageUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null);
  const [banReason, setBanReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["all-users", roleFilter],
    queryFn: () =>
      api
        .get(`/users${roleFilter ? `?role=${roleFilter}` : ""}`)
        .then((r) => r.data),
  });

  const { mutate: banUser, isPending: banning } = useMutation({
    mutationFn: ({ id, reason }) => api.patch(`/users/${id}/ban`, { reason }),
    onSuccess: () => {
      toast.success("User banned");
      queryClient.invalidateQueries(["all-users"]);
      setSelected(null);
      setAction(null);
      setBanReason("");
    },
    onError: () => toast.error("Failed to ban user"),
  });

  const { mutate: unbanUser, isPending: unbanning } = useMutation({
    mutationFn: (id) => api.patch(`/users/${id}/unban`),
    onSuccess: () => {
      toast.success("User unbanned");
      queryClient.invalidateQueries(["all-users"]);
      setSelected(null);
      setAction(null);
    },
    onError: () => toast.error("Failed to unban user"),
  });

  const { mutate: deleteUser, isPending: deleting } = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries(["all-users"]);
      setSelected(null);
      setAction(null);
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const users = (data?.data || []).filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Manage Users</h1>
        <p className="section-subtitle">
          View and manage all registered users.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-8"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field w-36"
        >
          <option value="">All Roles</option>
          <option value="tenant">Tenant</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <Spinner size="lg" className="py-20" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["User", "Role", "Joined", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary-800 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize
                        ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "owner"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {user.isBanned ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                          Banned
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== "admin" && (
                        <div className="flex items-center gap-2">
                          {user.isBanned ? (
                            <button
                              onClick={() => {
                                setSelected(user);
                                setAction("unban");
                              }}
                              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                            >
                              <CheckCircle size={13} /> Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelected(user);
                                setAction("ban");
                              }}
                              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              <Ban size={13} /> Ban
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelected(user);
                              setAction("delete");
                            }}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm">
                No users found
              </p>
            )}
          </div>
        </div>
      )}

      {/* Ban Modal */}
      <Modal
        isOpen={action === "ban" && !!selected}
        onClose={() => {
          setSelected(null);
          setAction(null);
          setBanReason("");
        }}
        title="Ban User"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-3">
          Ban <span className="font-medium">{selected?.name}</span>? They will
          not be able to login.
        </p>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            rows={3}
            placeholder="Reason for banning..."
            className="input-field resize-none"
          />
        </div>
        <div className="flex gap-3">
          <Button
            variant="danger"
            loading={banning}
            disabled={!banReason.trim()}
            onClick={() => banUser({ id: selected._id, reason: banReason })}
          >
            Ban User
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSelected(null);
              setAction(null);
              setBanReason("");
            }}
          >
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Unban Modal */}
      <Modal
        isOpen={action === "unban" && !!selected}
        onClose={() => {
          setSelected(null);
          setAction(null);
        }}
        title="Unban User"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Unban <span className="font-medium">{selected?.name}</span>? They will
          be able to login again.
        </p>
        <div className="flex gap-3">
          <Button
            variant="success"
            loading={unbanning}
            onClick={() => unbanUser(selected._id)}
          >
            Yes, Unban
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

      {/* Delete Modal */}
      <Modal
        isOpen={action === "delete" && !!selected}
        onClose={() => {
          setSelected(null);
          setAction(null);
        }}
        title="Delete User"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Permanently delete{" "}
          <span className="font-medium">{selected?.name}</span>? This cannot be
          undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="danger"
            loading={deleting}
            onClick={() => deleteUser(selected._id)}
          >
            Yes, Delete
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
