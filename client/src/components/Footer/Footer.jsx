import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  const [email, setEmail] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setEmail('')
  }

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__newsletter">
            <h2 className="footer__title">
              Mỗi ngày một món ăn,
              <span className="footer__title-accent">ngay trong hòm thư email của bạn</span>
            </h2>
            <p className="footer__tagline">món ngon - mỗi ngày</p>
            <form className="footer__form" onSubmit={handleSubmit}>
              <input
                type="email"
                className="footer__input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="cooked2026test@example.com"
                aria-label="Email nhận công thức"
                required
              />
              <button type="submit" className="footer__submit">
                Subscribe
                <svg viewBox="0 0 24 24" width="8" height="8" aria-hidden="true">
                  <path d="M2 11.5L22 2l-6 20-5-8z" fill="currentColor" />
                </svg>
              </button>
            </form>
          </div>

          <nav className="footer__links" aria-label="Liên kết chân trang">
            <div className="footer__column">
              <p className="footer__heading">Explore</p>
              <ul className="footer__list">
                <li><Link to="/my-account/profile">Tài khoản</Link></li>
                <li><Link to="/">Món ăn</Link></li>
              </ul>
            </div>
            <div className="footer__column">
              <p className="footer__heading">Kitchen</p>
              <ul className="footer__list">
                <li><Link to="/recipe/create">Thêm món</Link></li>
                <li><Link to="/cooking">Bếp</Link></li>
              </ul>
            </div>
            <div className="footer__column footer__column--follow">
              <p className="footer__heading">Follow</p>
              <div className="footer__social" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          </nav>
        </div>

        <div className="footer__bottom">
          <span>© 2026 Cooked with care.</span>
          <span>Nấu ngon - ăn khỏe</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
