import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth' // sửa cho đúng tên hook của bạn

export default function ProtectedRoute({ allowedRoles }) {
  const { isLoggedIn, role } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}