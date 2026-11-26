import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import './Header.css';

function getAvatarInitial(name, email) {
  const cleanedName = String(name || '').trim();
  if (cleanedName) {
    const parts = cleanedName.split(/\s+/);
    return parts[parts.length - 1].charAt(0).toUpperCase();
  }
  const cleanedEmail = String(email || '').trim();
  return cleanedEmail ? cleanedEmail.charAt(0).toUpperCase() : 'U';
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, role, isLoggedIn, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';
  const themeLabel = isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';
  const isAccountPage = pathname.startsWith('/my-account');
  const displayName = user?.name || user?.fullName || user?.email || 'Người dùng';
  const avatarInitial = getAvatarInitial(user?.name || user?.fullName, user?.email);
  const roleLink =
    role === 'admin'
      ? { to: '/admin', label: 'Quản trị' }
      : { to: '/my-account', label: 'Tài khoản' };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <button
        type="button"
        className="header__menu-btn"
        onClick={onMenuClick}
        aria-label="Mở menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <Link to="/" className="header__logo">
        Cooked
      </Link>

      <div className="header__actions">
        <button
          type="button"
          className="header__theme-btn"
          onClick={toggleTheme}
          aria-label={themeLabel}
          title={themeLabel}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        {isLoggedIn && isAccountPage ? (
          <Link
            to="/my-account/profile"
            className="header__account-chip"
            aria-label="Tài khoản của tôi"
          >
            <span className="header__account-text">Tài khoản của tôi</span>
            <span className="header__account-avatar" aria-hidden="true">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="header__account-avatar-img"
                />
              ) : (
                avatarInitial
              )}
            </span>
          </Link>
        ) : isLoggedIn ? (
          <>
            <Link to={roleLink.to} className="header__nav-link">
              {roleLink.label}
            </Link>
            <span className="header__user-name" title={displayName}>
              {displayName}
            </span>
            <button
              type="button"
              className="header__logout-btn"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="header__login-link">
              Đăng nhập
            </Link>
            <Link to="/login" className="header__avatar" aria-label="Đăng nhập">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;