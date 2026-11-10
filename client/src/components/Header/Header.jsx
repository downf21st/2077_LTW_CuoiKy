import { Link } from 'react-router-dom'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <Link to="/" className="header__logo">Cooked</Link>
    </header>
  )
}

export default Header
