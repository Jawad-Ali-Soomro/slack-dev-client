import { useEffect } from 'react'
import { useSignupModal } from '@multi-tenants/auth'

export default function RegisterPage() {
  const { openSignupModal } = useSignupModal()

  useEffect(() => {
    openSignupModal()
  }, [openSignupModal])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9fafb]">
      <p className="text-sm text-gray-500">Opening registration...</p>
    </div>
  )
}
