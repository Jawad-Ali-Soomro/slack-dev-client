import { Navigate } from 'react-router-dom'

/** Original auth UI is the login modal on the landing page (`/?login=1`). */
export default function LoginPage() {
  return <Navigate to="/?login=1" replace />
}
