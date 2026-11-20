import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
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

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, role, isLoggedIn, logout } = useAuth();

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