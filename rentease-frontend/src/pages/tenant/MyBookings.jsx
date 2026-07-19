import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Clock, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { formatDate } from "../../utils/formatters";

export default function MyBookings() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => api.get("/bookings/my-bookings").then((r) => r.data),
  });

  const { mutate: cancel, isPending: cancelling } = useMutation({
    mutationFn: (id) => api.patch(`/bookings/${id}/cancel`),
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries(["my-bookings"]);
      setSelected(null);
    },
    onError: () => toast.error("Failed to cancel booking"),
  });

  const bookings = data?.data || [];

  const upcoming = bookings.filter(
    (b) => b.status === "booked" && new Date(b.slotDate) >= new Date(),
  );
  const past = bookings.filter(
    (b) => b.status !== "booked" || new Date(b.slotDate) < new Date(),
  );

  const BookingCard = ({ booking }) => (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        <img
          src={
            booking.propertyId?.images?.[0] ||
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=60"
          }
          alt="property"
          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=60";
          }}
        />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h3 className="font-semibold text-gray-900">
              {booking.propertyId?.title || "Property Inspection"}
            </h3>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full
              ${
                booking.status === "booked"
                  ? "bg-green-100 text-green-700"
                  : booking.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(booking.slotDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {booking.slotTime}
            </span>
            {booking.propertyId?.suburb && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {booking.propertyId.suburb}
              </span>
            )}
          </div>

          {booking.status === "booked" &&
            new Date(booking.slotDate) >= new Date() && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setSelected(booking)}
                >
                  <X size={14} className="mr-1" />
                  Cancel Booking
                </Button>
              </div>
            )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">My Bookings</h1>
        <p className="section-subtitle">
          Manage your property inspection bookings.
        </p>
      </div>

      {isLoading ? (
        <Spinner size="lg" className="py-20" />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings yet"
          description="Book a property inspection to get started."
        />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-3">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <BookingCard key={b._id} booking={b} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-3">
                Past & Cancelled ({past.length})
              </h2>
              <div className="space-y-3 opacity-75">
                {past.map((b) => (
                  <BookingCard key={b._id} booking={b} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Cancel Booking"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to cancel your inspection booking for{" "}
          <span className="font-medium">{selected?.propertyId?.title}</span> on{" "}
          <span className="font-medium">{formatDate(selected?.slotDate)}</span>?
        </p>
        <div className="flex gap-3">
          <Button
            variant="danger"
            loading={cancelling}
            onClick={() => cancel(selected._id)}
          >
            Yes, Cancel
          </Button>
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Keep Booking
          </Button>
        </div>
      </Modal>
    </div>
  );
}
