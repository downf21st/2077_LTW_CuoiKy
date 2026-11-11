import { useState } from 'react'
import { NavLink, useMatch } from 'react-router-dom'
import divider from '../../assets/footer/divider.svg'
import send from '../../assets/footer/send.svg'
import github from '../../assets/footer/github.svg'
import instagram from '../../assets/footer/instagram.svg'
import threads from '../../assets/footer/threads.svg'
import './Footer.css'

function Footer() {
  const recipeMatch = useMatch('/recipe/:id')
  const cookingMatch = useMatch('/recipe/:id/cooking-mode')
  const matchedId = recipeMatch?.params.id ?? cookingMatch?.params.id
  const recipeId = matchedId === 'create' ? undefined : matchedId
  const cookingPath = recipeId ? `/recipe/${encodeURIComponent(recipeId)}/cooking-mode` : '/cooking-mode-emty'
  const [email, setEmail] = useState('')
  const [newsletterUnavailable, setNewsletterUnavailable] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setNewsletterUnavailable(true)
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
                onChange={(event) => {
                  setEmail(event.target.value)
                  setNewsletterUnavailable(false)
                }}
                placeholder="cooked2026est@example.com"
                aria-label="Email nhận công thức"
                required
              />
              <button type="submit" className="footer__submit">
                Subscribe
                <img src={send} alt="" aria-hidden="true" />
              </button>
            </form>
            {newsletterUnavailable && (
              <p className="footer__notice" role="status">Chức năng đăng ký nhận email chưa khả dụng.</p>
            )}
          </div>

          <nav className="footer__links" aria-label="Liên kết chân trang">
            <div className="footer__column">
              <p className="footer__heading">Khám phá</p>
              <ul className="footer__list">
                <li><NavLink to="/my-account/profile">Tài khoản</NavLink></li>
                <li><NavLink to="/" end>Món ăn</NavLink></li>
              </ul>
            </div>
            <div className="footer__column">
              <p className="footer__heading">Góc bếp</p>
              <ul className="footer__list">
                <li><NavLink to="/recipe/create">Thêm món</NavLink></li>
                <li><NavLink to={cookingPath}>Bếp</NavLink></li>
              </ul>
            </div>
            <div className="footer__column footer__column--follow">
              <p className="footer__heading">Theo dõi</p>
              <div className="footer__social">
                <a href="https://www.instagram.com/downf.21st/" target="_blank" rel="noopener noreferrer" aria-label="Instagram (mở tab mới)"><img src={instagram} alt="" /></a>
                <a href="https://github.com/downf21st/2077_LTW_CuoiKy" target="_blank" rel="noopener noreferrer" aria-label="GitHub dự án (mở tab mới)"><img src={github} alt="" /></a>
                <a href="https://www.threads.com/@downf.21st?hl=vi" target="_blank" rel="noopener noreferrer" aria-label="Threads (mở tab mới)"><img src={threads} alt="" /></a>
              </div>
            </div>
          </nav>
        </div>

        <div className="footer__bottom">
          <img className="footer__divider" src={divider} alt="" aria-hidden="true" />
          <span>© {new Date().getFullYear()} Cooked with care.</span>
          <span>Nấu ngon - ăn khỏe</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
