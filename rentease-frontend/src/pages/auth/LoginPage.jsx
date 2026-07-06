import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useLogin } from "../../hooks/useAuth";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { mutate: login, isPending } = useLogin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary-800 text-white p-2 rounded-xl">
            <Home size={22} />
          </div>
          <span className="text-2xl font-bold text-primary-800">RentEase</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

        <form
          onSubmit={handleSubmit((data) => login(data))}
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
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            register={register}
            required
            error={errors.password}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary-800 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth loading={isPending} size="lg">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary-800 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
