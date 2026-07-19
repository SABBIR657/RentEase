import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axiosInstance";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import { PROPERTY_TYPES, AMENITIES_LIST } from "../../utils/constants";
import { useEffect } from "react";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => api.get(`/properties/${id}`).then((r) => r.data),
  });

  // Populate form when data loads
  useEffect(() => {
    if (data?.data) {
      const p = data.data;
      reset({
        title: p.title,
        description: p.description,
        type: p.type,
        rentPrice: p.rentPrice,
        suburb: p.suburb,
        locality: p.locality,
        state: p.state,
        postcode: p.postcode,
        street_address: p.street_address,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        parking: p.parking,
        amenities: p.amenities || [],
        latitude: p.location?.coordinates?.[1] || "",
        longitude: p.location?.coordinates?.[0] || "",
      });
    }
  }, [data, reset]);

  const selectedAmenities = watch("amenities") || [];

  const toggleAmenity = (amenity) => {
    const current = watch("amenities") || [];
    setValue(
      "amenities",
      current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity],
    );
  };

  const { mutate: update, isPending } = useMutation({
    mutationFn: (formData) => api.put(`/properties/${id}`, formData),
    onSuccess: () => {
      toast.success("Listing updated!");
      queryClient.invalidateQueries(["my-listings"]);
      queryClient.invalidateQueries(["property", id]);
      navigate("/owner/listings");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Update failed"),
  });

  const onSubmit = (data) => {
    update({
      ...data,
      rentPrice: Number(data.rentPrice),
      bedrooms: Number(data.bedrooms),
      bathrooms: Number(data.bathrooms),
      parking: Number(data.parking),
    });
  };

  if (isLoading)
    return (
      <div className="py-20">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="section-title">Edit Listing</h1>
        <p className="section-subtitle">Update your property details.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <Input
            label="Property Title"
            name="title"
            register={register}
            required
            error={errors.title}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="input-field resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select {...register("type")} className="input-field">
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Weekly Rent (AUD)"
              name="rentPrice"
              type="number"
              register={register}
              required
              error={errors.rentPrice}
            />
          </div>
        </div>

        {/* Location */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Location</h2>
          <Input
            label="Street Address"
            name="street_address"
            register={register}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Suburb"
              name="suburb"
              register={register}
              required
              error={errors.suburb}
            />
            <Input
              label="City / Locality"
              name="locality"
              register={register}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="State" name="state" register={register} />
            <Input label="Postcode" name="postcode" register={register} />
          </div>
        </div>

        {/* Details */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Property Details</h2>
          <div className="grid grid-cols-3 gap-4">
            {["bedrooms", "bathrooms", "parking"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field}
                </label>
                <select {...register(field)} className="input-field">
                  {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {AMENITIES_LIST.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors
                  ${
                    selectedAmenities.includes(amenity)
                      ? "bg-primary-800 text-white border-primary-800"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={isPending} size="lg">
            Save Changes
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate("/owner/listings")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
