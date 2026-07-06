import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { User, Lock, Camera } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { getInitials } from "../../utils/formatters";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  const { register: regProfile, handleSubmit: handleProfile } = useForm({
    defaultValues: {
      name: user?.name,
      phone: user?.phone,
      address: user?.address,
    },
  });
  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset,
  } = useForm();

  // Update profile
  const { mutate: updateProfile, isPending: updatingProfile } = useMutation({
    mutationFn: (data) => api.put("/auth/me", data),
    onSuccess: ({ data }) => {
      updateUser(data.data);
      toast.success("Profile updated!");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  // Change password
  const { mutate: changePassword, isPending: changingPassword } = useMutation({
    mutationFn: (data) => api.patch("/auth/me/password", data),
    onSuccess: () => {
      toast.success("Password changed!");
      reset();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to change password"),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="section-title">My Profile</h1>
        <p className="section-subtitle">Manage your account information</p>
      </div>

      {/* Avatar */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary-800 text-white flex items-center justify-center text-2xl font-bold">
                {getInitials(user?.name)}
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50">
              <Camera size={14} className="text-gray-600" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-800 text-xs rounded-full font-medium capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-primary-800" />
          <h2 className="font-semibold text-gray-900">Personal Information</h2>
        </div>
        <form
          onSubmit={handleProfile((d) => updateProfile(d))}
          className="space-y-4"
        >
          <Input
            label="Full Name"
            name="name"
            register={regProfile}
            placeholder="John Smith"
          />
          <Input
            label="Phone Number"
            name="phone"
            register={regProfile}
            placeholder="+61 4xx xxx xxx"
            type="tel"
          />
          <Input
            label="Address"
            name="address"
            register={regProfile}
            placeholder="Your address"
          />
          <div className="pt-2">
            <Button type="submit" loading={updatingProfile}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-primary-800" />
          <h2 className="font-semibold text-gray-900">Change Password</h2>
        </div>
        <form
          onSubmit={handlePassword((d) => changePassword(d))}
          className="space-y-4"
        >
          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            register={regPassword}
            placeholder="••••••••"
          />
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            register={regPassword}
            placeholder="Min. 6 characters"
          />
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            register={regPassword}
            placeholder="Repeat new password"
          />
          <div className="pt-2">
            <Button type="submit" loading={changingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
