import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import PropertyCard from "../../components/property/PropertyCard";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";

export default function MyFavourites() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["favourites"],
    queryFn: () => api.get("/favourites").then((r) => r.data),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (propertyId) => api.delete(`/favourites/${propertyId}`),
    onSuccess: () => {
      toast.success("Removed from favourites");
      queryClient.invalidateQueries(["favourites"]);
    },
  });

  const favourites = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">My Favourites</h1>
        <p className="section-subtitle">Properties you've saved for later.</p>
      </div>

      {isLoading ? (
        <Spinner size="lg" className="py-20" />
      ) : favourites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved properties"
          description="Browse properties and click the heart icon to save them here."
          actionLabel="Browse Properties"
          onAction={() => (window.location.href = "/listings")}
        />
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {favourites.length} saved properties
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {favourites.map((fav) => (
              <div key={fav._id} className="relative group">
                <PropertyCard property={fav.propertyId} showFavButton={false} />
                <button
                  onClick={() => remove(fav.propertyId._id)}
                  className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full shadow
                    text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
