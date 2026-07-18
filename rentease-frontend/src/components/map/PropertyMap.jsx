import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { Bed, Bath } from "lucide-react";
import "../../utils/leafletFix";
import { formatCurrency } from "../../utils/formatters";

// Fly to location when center changes
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 12, { duration: 1.2 });
  }, [center, map]);
  return null;
}

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&q=80";

export default function PropertyMap({
  properties = [],
  center = null,
  height = "500px",
}) {
  // Filter properties that have valid coordinates
  const mapped = properties.filter((p) => {
    const [lng, lat] = p.location?.coordinates || [0, 0];
    return lat !== 0 && lng !== 0;
  });

  const defaultCenter = [-25.2744, 133.7751]; // Centre of Australia

  return (
    <MapContainer
      center={defaultCenter}
      zoom={5}
      style={{ height, width: "100%", borderRadius: "12px", zIndex: 1 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {center && <MapController center={center} />}

      {mapped.map((property) => {
        const [lng, lat] = property.location.coordinates;
        return (
          <Marker key={property._id} position={[lat, lng]}>
            <Popup maxWidth={240} className="property-popup">
              <div className="p-1">
                {/* Image */}
                <img
                  src={property.images?.[0] || PLACEHOLDER}
                  alt={property.title}
                  className="w-full h-28 object-cover rounded-lg mb-2"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER;
                  }}
                />
                {/* Price */}
                <p className="font-bold text-primary-800 text-sm">
                  {formatCurrency(property.rentPrice)}
                </p>
                {/* Title */}
                <p className="text-xs font-medium text-gray-800 mt-0.5 line-clamp-1">
                  {property.title}
                </p>
                {/* Location */}
                <p className="text-xs text-gray-500 mt-0.5">
                  {property.suburb}, {property.state}
                </p>
                {/* Stats */}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Bed size={11} /> {property.bedrooms} bed
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath size={11} /> {property.bathrooms} bath
                  </span>
                </div>
                {/* Link */}
                <Link
                  to={`/properties/${property._id}`}
                  className="block mt-2 text-center bg-primary-800 text-white text-xs py-1.5 rounded-lg hover:bg-primary-900 transition-colors"
                >
                  View Property
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
