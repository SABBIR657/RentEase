import { useForm } from 'react-hook-form'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Home } from 'lucide-react'
import Input  from '../../components/common/Input'
import Button from '../../components/common/Button'
import api    from '../../api/axiosInstance'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate  = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post(`/auth/reset-password/${token}`, data),
    onSuccess: () => {
      toast.success('Password reset successful!')
      navigate('/login')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Reset failed'),
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary-800 text-white p-2 rounded-xl"><Home size={22} /></div>
          <span className="text-2xl font-bold text-primary-800">RentEase</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your new password below.</p>

        <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
          <Input label="New Password" name="password" type="password"
            placeholder="Min. 6 characters" register={register} required error={errors.password} />
          <Input label="Confirm New Password" name="confirmPassword" type="password"
            placeholder="Repeat new password" register={register} required
            error={errors.confirmPassword} />
          <Button type="submit" fullWidth loading={isPending} size="lg">
            Reset Password
          </Button>
        </form>

        <p className="text-center mt-6">
          <Link to="/login" className="text-sm text-primary-800 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}