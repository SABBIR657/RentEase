import { Link } from "react-router-dom";
import { Bed, Bath, Car, MapPin, Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { formatCurrency, truncate } from "../../utils/formatters";
import Badge from "../common/Badge";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80";

export default function PropertyCard({ property, showFavButton = true }) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const { mutate: toggleFav } = useMutation({
    mutationFn: (id) => api.post(`/favourites/${id}`),
    onSuccess: () => {
      toast.success("Saved to favourites");
      queryClient.invalidateQueries(["favourites"]);
    },
    onError: () => toast.error("Login to save properties"),
  });

  const image = property.images?.[0] || PLACEHOLDER;

  const typeColors = {
    house: "blue",
    apartment: "purple",
    unit: "green",
    townhouse: "orange",
    studio: "yellow",
    other: "gray",
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = PLACEHOLDER;
          }}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={typeColors[property.type] || "gray"}>
            {property.type}
          </Badge>
          {property.isFeatured && <Badge variant="yellow">Featured</Badge>}
        </div>
        {/* Fav Button */}
        {token && showFavButton && (
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFav(property._id);
            }}
            className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Heart
              size={16}
              className="text-gray-500 hover:text-red-500 transition-colors"
            />
          </button>
        )}
        {/* Price tag */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-primary-800 text-white text-sm font-bold px-3 py-1 rounded-full">
            {formatCurrency(property.rentPrice)}
          </span>
        </div>
      </div>

      {/* Content */}
      <Link to={`/properties/${property._id}`} className="block p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
          {property.title}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <MapPin size={12} />
          <span className="line-clamp-1">
            {[property.suburb, property.state].filter(Boolean).join(", ")}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-gray-600 text-xs">
          <div className="flex items-center gap-1">
            <Bed size={14} />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={14} />
            <span>{property.bathrooms} bath</span>
          </div>
          {property.parking > 0 && (
            <div className="flex items-center gap-1">
              <Car size={14} />
              <span>{property.parking} park</span>
            </div>
          )}
        </div>

        {/* Rating */}
        {property.totalReviews > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
            <span>★ {property.averageRating.toFixed(1)}</span>
            <span className="text-gray-400">
              ({property.totalReviews} reviews)
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
