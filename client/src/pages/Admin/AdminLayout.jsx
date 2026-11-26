import { NavLink, Outlet } from 'react-router-dom'
import './AdminLayout.css'

const ADMIN_LINKS = [
  { to: 'dashboard', label: 'Tổng quan' },
  { to: 'pending-recipes', label: 'Duyệt công thức' },
  { to: 'categories', label: 'Loại món' },
  { to: 'comments', label: 'Bình luận' },
]

const getLinkClass = ({ isActive }) =>
  isActive ? 'admin__link admin__link--active' : 'admin__link'

export default function AdminLayout() {
  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <h2 className="admin__title">Quản trị</h2>
        <nav aria-label="Điều hướng quản trị">
          <ul className="admin__nav">
            {ADMIN_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} className={getLinkClass}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <section className="admin__content">
        <Outlet />
      </section>
    </div>
  )
}