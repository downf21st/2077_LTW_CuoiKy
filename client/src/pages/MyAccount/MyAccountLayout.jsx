import { NavLink, Outlet } from 'react-router-dom'

export default function MyAccountLayout() {
  return (
    <div className="my-account">
      <nav className="my-account__menu">
        <NavLink to="profile">Thông tin tài khoản</NavLink>
        <NavLink to="my-recipes">Công thức của tôi</NavLink>
        <NavLink to="favorites">Món yêu thích</NavLink>
        <NavLink to="weekly-menu">Thực đơn tuần</NavLink>
      </nav>
      <section className="my-account__content">
        <Outlet />
      </section>
    </div>
  )
}