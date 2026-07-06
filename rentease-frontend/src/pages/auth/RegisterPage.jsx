import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import Input  from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useRegister } from '../../hooks/useAuth'

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const { mutate: registerUser, isPending } = useRegister()

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

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">Join RentEase today</p>

        <form onSubmit={handleSubmit((data) => registerUser(data))} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="John Smith"
            register={register}
            required
            error={errors.name}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            register={register}
            required
            error={errors.email}
          />

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['tenant', 'owner'].map((role) => (
                <label key={role}
                  className={`flex items-center justify-center gap-2 border-2 rounded-lg p-3 cursor-pointer transition-colors
                    ${watch('role') === role
                      ? 'border-primary-800 bg-primary-50 text-primary-800'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  <input type="radio" value={role} {...register('role', { required: 'Please select a role' })}
                    className="sr-only" />
                  <span className="text-sm font-medium capitalize">{role}</span>
                </label>
              ))}
            </div>
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
          </div>

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Min. 6 characters"
            register={register}
            required
            error={errors.password}
            hint="At least 6 characters"
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat password"
            register={register}
            required
            error={errors.confirmPassword}
          />

          <Button type="submit" fullWidth loading={isPending} size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-800 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}