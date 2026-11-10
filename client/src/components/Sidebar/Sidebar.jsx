import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const ICONS = {
  
  home: (
    <>
      <path d="M3 10L12 3l9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
      <path d="M9 16h6" />
    </>
  ),

  recipe: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  // Bộ dụng cụ ăn uống
  cooking: (
    <>
      <path d="M5 3v6a3 3 0 0 0 3 3m0-9v18m3-18v6a3 3 0 0 1-3 3" />
      <path d="M18 3c-2.2 0-3.5 2.2-3.5 5.5 0 2.5 1.2 4 3.5 4V21" />
    </>
  ),
  // Mũi tên đi vào khung cửa bên phải
  login: (
    <>
      <path d="M14 4h5v16h-5" />
      <path d="M4 12h11" />
      <path d="M11 8l4 4-4 4" />
    </>
  ),
  // Avatar Khách tô đặc
  user: (
    <>
      <circle cx="12" cy="7.5" r="4.5" fill="currentColor" stroke="none" />
      <path
        d="M4.5 19.5C4.5 15.6 7.8 13 12 13s7.5 2.6 7.5 6.5c0 .8-.7 1.5-1.5 1.5H6c-.8 0-1.5-.7-1.5-1.5z"
        fill="currentColor"
        stroke="none"
      />
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
