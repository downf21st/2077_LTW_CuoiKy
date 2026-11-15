import { Link } from 'react-router-dom';
import './Header.css';

function Header({ onMenuClick }) {
  return (
    <header className="header">
      <button 
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

      <Link to="/" className="header__logo">Cooked</Link>
      
      <Link to="/login" className="header__avatar" aria-label="Đăng nhập">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </Link>
    </header>
  );
}

export default Header;