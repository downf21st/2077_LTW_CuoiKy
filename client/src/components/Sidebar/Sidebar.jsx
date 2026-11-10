import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const ICONS = {
  home: (
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  recipe: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h7M9 17h7" />
    </>
  ),
  cooking: (
    <>
      <path d="M4 11h16v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" />
      <path d="M2 11h20" />
      <path d="M9 3v4M12 2v5M15 3v4" />
    </>
  ),
  login: (
    <>
      <path d="M14 4h5v16h-5" />
      <path d="M4 12h11" />
      <path d="M11 8l4 4-4 4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
}

function Icon({ name, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  )
}

// NavLink tự thêm aria-current="page" cho mục đang chọn, CSS dựa vào đó
function NavItem({ to, icon, label, end }) {
  return (
    <NavLink to={to} end={end} className="nav-item" title={label}>
      <span className="nav-item__arrow" aria-hidden="true">›</span>
      <Icon name={icon} className="nav-item__icon" />
      <span className="nav-item__label">{label}</span>
    </NavLink>
  )
}

function SidebarToggle({ isOpen, onClick }) {
  return (
    <button
      type="button"
      className="sidebar__toggle"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls="sidebar-panel"
      aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
    >
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points={isOpen ? '15 6 9 12 15 18' : '9 6 15 12 9 18'} />
      </svg>
    </button>
  )
}

function Sidebar({ isOpen, onToggle }) {
  return (
    <div className={isOpen ? 'sidebar sidebar--open' : 'sidebar'}>
      {/* inert: khi đóng, các link trong panel không nhận Tab và không bị đọc */}
      <aside id="sidebar-panel" className="sidebar__panel" inert={!isOpen}>
        <div className="sidebar__role">
          <Icon name="user" className="sidebar__avatar" />
          <span>Khách</span>
        </div>

        <nav className="sidebar__nav" aria-label="Menu chính">
          <NavItem to="/" end icon="home" label="Trang chủ" />
          {/* shortcut: đường dẫn tạm, hỏi Nam khi chốt route /recipe/:id và trang nấu ăn */}
          <NavItem to="/recipe" icon="recipe" label="Chi tiết món ăn" />
          <NavItem to="/cooking" icon="cooking" label="Khu vực nấu ăn" />
        </nav>

        <div className="sidebar__login">
          <NavItem to="/login" icon="login" label="Đăng nhập / Đăng kí" />
        </div>
      </aside>

      <SidebarToggle isOpen={isOpen} onClick={onToggle} />
    </div>
  )
}

export default Sidebar
