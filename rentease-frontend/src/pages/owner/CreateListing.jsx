import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PlusSquare } from "lucide-react";
import api from "../../api/axiosInstance";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { PROPERTY_TYPES, AMENITIES_LIST } from "../../utils/constants";

export default function CreateListing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { type: "apartment", bedrooms: 1, bathrooms: 1, parking: 0 },
  });

  const selectedAmenities = watch("amenities") || [];

  const { mutate: create, isPending } = useMutation({
    mutationFn: (data) => api.post("/properties", data),
    onSuccess: () => {
      toast.success("Listing created! Pending admin approval.");
      queryClient.invalidateQueries(["my-listings"]);
      navigate("/owner/listings");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to create listing"),
  });

  const toggleAmenity = (amenity) => {
    const current = watch("amenities") || [];
    if (current.includes(amenity)) {
      setValue(
        "amenities",
        current.filter((a) => a !== amenity),
      );
    } else {
      setValue("amenities", [...current, amenity]);
    }
  };

  const onSubmit = (data) => {
    create({
      ...data,
      rentPrice: Number(data.rentPrice),
      bedrooms: Number(data.bedrooms),
      bathrooms: Number(data.bathrooms),
      parking: Number(data.parking),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="section-title">Create New Listing</h1>
        <p className="section-subtitle">
          Fill in the details about your property.
        </p>
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
            placeholder="e.g. Modern 2BR Apartment in Sydney CBD"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Describe your property..."
              className="input-field resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type <span className="text-red-500">*</span>
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
              placeholder="e.g. 500"
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
            placeholder="e.g. 123 Main Street"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Suburb"
              name="suburb"
              register={register}
              required
              error={errors.suburb}
              placeholder="e.g. Parramatta"
            />
            <Input
              label="City / Locality"
              name="locality"
              register={register}
              placeholder="e.g. Sydney"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="State"
              name="state"
              register={register}
              placeholder="e.g. NSW"
            />
            <Input
              label="Postcode"
              name="postcode"
              register={register}
              placeholder="e.g. 2150"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude (optional)"
              name="latitude"
              type="number"
              register={register}
              placeholder="e.g. -33.8688"
            />
            <Input
              label="Longitude (optional)"
              name="longitude"
              type="number"
              register={register}
              placeholder="e.g. 151.2093"
            />
          </div>
        </div>

        {/* Property Details */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Property Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <select {...register("bedrooms")} className="input-field">
                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <select {...register("bathrooms")} className="input-field">
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parking
              </label>
              <select {...register("parking")} className="input-field">
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
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

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" loading={isPending} size="lg">
            <PlusSquare size={16} className="mr-2" />
            Create Listing
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
