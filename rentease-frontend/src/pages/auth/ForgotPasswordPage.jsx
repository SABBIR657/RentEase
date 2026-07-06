import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Home, ArrowLeft } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../api/axiosInstance";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data) => api.post("/auth/forgot-password", data),
    onSuccess: () => toast.success("Reset link sent! Check your email."),
    onError: (err) =>
      toast.error(err.response?.data?.message || "Something went wrong"),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary-800 text-white p-2 rounded-xl">
            <Home size={22} />
          </div>
          <span className="text-2xl font-bold text-primary-800">RentEase</span>
        </div>

        {isSuccess ? (
          <div className="text-center py-4">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Check your email
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              We've sent a password reset link to your email address.
            </p>
            <Link
              to="/login"
              className="text-primary-800 font-medium hover:underline text-sm"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Forgot password?
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Enter your email and we'll send a reset link.
            </p>
            <form
              onSubmit={handleSubmit((d) => mutate(d))}
              className="space-y-4"
            >
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                register={register}
                required
                error={errors.email}
              />
              <Button type="submit" fullWidth loading={isPending} size="lg">
                Send Reset Link
              </Button>
            </form>
            <Link
              to="/login"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mt-6 justify-center"
            >
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
