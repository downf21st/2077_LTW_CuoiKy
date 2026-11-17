import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div>
      <h1>Bạn không có quyền truy cập trang này</h1>
      <Link to="/">Về trang chủ</Link>
    </div>
  )
}