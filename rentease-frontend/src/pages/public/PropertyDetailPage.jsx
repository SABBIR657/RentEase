import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Bed,
  Bath,
  Car,
  MapPin,
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  Send,
  Flag,
  Calendar,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { useProperty } from "../../hooks/useProperties";
import { formatCurrency, formatDate } from "../../utils/formatters";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const queryClient = useQueryClient();

  const [imgIdx, setImgIdx] = useState(0);
  const [message, setMessage] = useState("");

  const { data, isLoading } = useProperty(id);
  const property = data?.data;

  const [applyModal, setApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");

  const { mutate: submitApplication, isPending: applying } = useMutation({
    mutationFn: () =>
      api.post("/applications", {
        propertyId: id,
        message: applyMessage,
      }),
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setApplyModal(false);
      setApplyMessage("");
      queryClient.invalidateQueries(["my-applications"]);
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message || "Failed to submit application",
      ),
  });

  // Get open inspection slots for this property
  const { data: slotsData } = useQuery({
    queryKey: ["slots", id],
    queryFn: () => api.get(`/bookings/slots/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const [bookingSlot, setBookingSlot] = useState(null);

  const { mutate: bookSlot, isPending: booking } = useMutation({
    mutationFn: (slotId) => api.post(`/bookings/${slotId}/book`),
    onSuccess: () => {
      toast.success("Inspection booked! Check your email for confirmation.");
      setBookingSlot(null);
      queryClient.invalidateQueries(["slots", id]);
      queryClient.invalidateQueries(["my-bookings"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Booking failed"),
  });

  // Reviews
  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => api.get(`/reviews/property/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  // Check if favourited
  const { data: favData } = useQuery({
    queryKey: ["fav-check", id],
    queryFn: () => api.get(`/favourites/check/${id}`).then((r) => r.data),
    enabled: !!token,
  });

  const { mutate: toggleFav, isPending: favPending } = useMutation({
    mutationFn: () =>
      favData?.data?.isFavourited
        ? api.delete(`/favourites/${id}`)
        : api.post(`/favourites/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["fav-check", id]);
      toast.success(
        favData?.data?.isFavourited
          ? "Removed from favourites"
          : "Saved to favourites",
      );
    },
  });

  const { mutate: sendInquiry, isPending: sending } = useMutation({
    mutationFn: () =>
      api.post("/messages", {
        receiverId: property.ownerId._id,
        propertyId: id,
        content: message,
      }),
    onSuccess: () => {
      toast.success("Message sent to owner!");
      setMessage("");
      navigate("/messages");
    },
    onError: () => toast.error("Failed to send message"),
  });

  if (isLoading)
    return (
      <div className="py-20">
        <Spinner size="lg" />
      </div>
    );
  if (!property)
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Property not found.</p>
        <Link to="/listings" className="text-primary-800 mt-2 inline-block">
          ← Back to listings
        </Link>
      </div>
    );

  const images = property.images?.length ? property.images : [PLACEHOLDER];
  const reviews = reviewsData?.data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link
        to="/listings"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <ChevronLeft size={16} /> Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT — Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="relative rounded-xl overflow-hidden h-72 sm:h-96 bg-gray-100">
            <img
              src={images[imgIdx]}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = PLACEHOLDER;
              }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() =>
                    setImgIdx((i) => Math.min(images.length - 1, i + 1))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? "bg-white" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Title & Info */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {property.title}
                </h1>
                <div className="flex items-center gap-1.5 text-gray-500 mt-1 text-sm">
                  <MapPin size={14} />
                  <span>
                    {[
                      property.street_address,
                      property.suburb,
                      property.state,
                      property.postcode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              </div>
              <Badge
                variant={property.status === "available" ? "green" : "red"}
                className="flex-shrink-0"
              >
                {property.status}
              </Badge>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-5 mt-4 py-4 border-y border-gray-100">
              <div className="flex items-center gap-2 text-gray-700">
                <Bed size={18} className="text-primary-800" />
                <span className="font-medium">{property.bedrooms}</span>
                <span className="text-sm text-gray-500">Bedrooms</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Bath size={18} className="text-primary-800" />
                <span className="font-medium">{property.bathrooms}</span>
                <span className="text-sm text-gray-500">Bathrooms</span>
              </div>
              {property.parking > 0 && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Car size={18} className="text-primary-800" />
                  <span className="font-medium">{property.parking}</span>
                  <span className="text-sm text-gray-500">Parking</span>
                </div>
              )}
              {property.totalReviews > 0 && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <Star size={18} fill="currentColor" />
                  <span className="font-medium">
                    {property.averageRating?.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({property.totalReviews} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">
                About this property
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">
              Reviews{" "}
              {reviews.length > 0 && (
                <span className="text-gray-400 font-normal">
                  ({reviews.length})
                </span>
              )}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {r.reviewerId?.name?.[0] || "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {r.reviewerId?.name}
                        </span>
                        <span className="text-yellow-500 text-xs">
                          {"★".repeat(r.rating)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(r.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {r.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inspection Slots */}
          {token && user?.role === "tenant" && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">
                Available Inspections
              </h2>
              {slotsData?.data?.length === 0 || !slotsData?.data ? (
                <p className="text-sm text-gray-400">
                  No inspection slots available at the moment. Message the owner
                  to arrange one.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {slotsData.data.map((slot) => (
                    <button
                      key={slot._id}
                      onClick={() => setBookingSlot(slot)}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg
              hover:border-primary-800 hover:bg-primary-50 transition-colors text-left"
                    >
                      <div className="bg-primary-100 p-2 rounded-lg">
                        <Calendar size={16} className="text-primary-800" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(slot.slotDate)}
                        </p>
                        <p className="text-xs text-gray-500">{slot.slotTime}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Sidebar */}
        <div className="space-y-4">
          {/* Price Card */}
          <div className="card p-5">
            <div className="text-3xl font-bold text-primary-800 mb-1">
              {formatCurrency(property.rentPrice)}
            </div>
            <p className="text-sm text-gray-500 mb-4">Weekly rental price</p>

            {token &&
              user?.role === "tenant" &&
              property.status === "available" && (
                <div className="space-y-2">
                  <Button fullWidth onClick={() => setApplyModal(true)}>
                    Apply Now
                  </Button>
                  <button
                    onClick={toggleFav}
                    disabled={favPending}
                    className={`w-full flex items-center justify-center gap-2 py-2 border rounded-lg text-sm transition-colors
        ${
          favData?.data?.isFavourited
            ? "border-red-300 text-red-500 bg-red-50"
            : "border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
                  >
                    <Heart
                      size={15}
                      fill={
                        favData?.data?.isFavourited ? "currentColor" : "none"
                      }
                    />
                    {favData?.data?.isFavourited ? "Saved" : "Save Property"}
                  </button>
                </div>
              )}

            {!token && (
              <div className="space-y-2">
                <Link to="/login">
                  <Button fullWidth>Login to Apply</Button>
                </Link>
                <Link to="/register">
                  <Button fullWidth variant="secondary">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Owner Card */}
          {property.ownerId && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Listed by</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-800 text-white flex items-center justify-center font-bold">
                  {property.ownerId.name?.[0] || "O"}
                </div>
                <div>
                  <p className="font-medium text-sm">{property.ownerId.name}</p>
                  <p className="text-xs text-gray-400">Property Owner</p>
                </div>
              </div>

              {/* Message owner */}
              {token && user?.role === "tenant" && (
                <div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Send a message to the owner..."
                    rows={3}
                    className="input-field resize-none text-sm mb-2"
                  />
                  <Button
                    fullWidth
                    variant="secondary"
                    size="sm"
                    loading={sending}
                    disabled={!message.trim()}
                    onClick={() => sendInquiry()}
                  >
                    <Send size={14} className="mr-1" />
                    Send Message
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Report */}
          {token && (
            <button
              onClick={() => toast("Report feature coming soon")}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors w-full justify-center py-2"
            >
              <Flag size={12} /> Report this listing
            </button>
          )}
        </div>
      </div>
      {/* Apply Modal */}
      <Modal
        isOpen={applyModal}
        onClose={() => setApplyModal(false)}
        title="Apply for this Property"
        size="md"
      >
        <div className="space-y-4">
          {/* Property summary */}
          <div className="bg-gray-50 rounded-lg p-3 flex gap-3">
            <img
              src={images[0]}
              alt={property.title}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=60";
              }}
            />
            <div>
              <p className="font-semibold text-sm text-gray-900">
                {property.title}
              </p>
              <p className="text-xs text-gray-500">
                {property.suburb}, {property.state}
              </p>
              <p className="text-sm font-bold text-primary-800 mt-1">
                {formatCurrency(property.rentPrice)}
              </p>
            </div>
          </div>

          {/* Cover message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Message <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              rows={4}
              placeholder="Introduce yourself to the owner. Mention your occupation, number of occupants, move-in date preference..."
              className="input-field resize-none"
            />
          </div>

          <p className="text-xs text-gray-400">
            Note: Document upload (ID, payslip) will be available in the next
            update.
          </p>

          <div className="flex gap-3">
            <Button
              fullWidth
              loading={applying}
              disabled={!id}
              onClick={() => submitApplication()}
            >
              Submit Application
            </Button>
            <Button variant="secondary" onClick={() => setApplyModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Book Inspection Modal */}
      <Modal
        isOpen={!!bookingSlot}
        onClose={() => setBookingSlot(null)}
        title="Book Inspection"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Calendar size={24} className="text-green-700 mx-auto mb-2" />
            <p className="font-semibold text-gray-900">
              {formatDate(bookingSlot?.slotDate)}
            </p>
            <p className="text-sm text-gray-600">{bookingSlot?.slotTime}</p>
          </div>
          <p className="text-sm text-gray-600">
            Confirm your inspection booking for{" "}
            <span className="font-medium">{property?.title}</span>? You'll
            receive an email confirmation and a reminder 24 hours before.
          </p>
          <div className="flex gap-3">
            <Button
              fullWidth
              variant="success"
              loading={booking}
              onClick={() => bookSlot(bookingSlot._id)}
            >
              Confirm Booking
            </Button>
            <Button variant="secondary" onClick={() => setBookingSlot(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
