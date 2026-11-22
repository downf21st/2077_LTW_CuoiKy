import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function ProtectedRoute({ allowedRoles }) {
  const { user, role } = useAuth()
  const location = useLocation()


  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Đã đăng nhập nhưng sai quyền: về trang báo không có quyền
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}