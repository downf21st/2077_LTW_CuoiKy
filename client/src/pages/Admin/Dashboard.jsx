import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats } from '../../api'
import StarRating from '../../components/StarRating/StarRating'
import { resolveRecipeImage } from '../../utils/weeklyMenuHelper'
import './Dashboard.css'

const STAT_CARDS = [
  { key: 'totalRecipes', label: 'Tổng công thức', icon: 'recipe' },
  { key: 'pendingRecipes', label: 'Món chờ duyệt', icon: 'pending' },
  { key: 'totalUsers', label: 'Tổng người dùng', icon: 'users' },
  { key: 'totalReviews', label: 'Tổng đánh giá', icon: 'reviews' },
]

function StatIcon({ type }) {
  if (type === 'users') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
  if (type === 'pending') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    )
  }
  if (type === 'reviews') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.5z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    getStats()
      .then((data) => {
        if (cancelled) return
        setStats(data)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Không tải được dữ liệu thống kê')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setReloadKey((prev) => prev + 1)
  }

  const topRated = Array.isArray(stats?.topRated) ? stats.topRated.slice(0, 5) : []

  return (
    <div className="dashboard">
      <nav className="dashboard__breadcrumb" aria-label="Đường dẫn">
        <Link to="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <span>Quản trị</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Tổng quan &amp; Thống kê</span>
      </nav>

      <header className="dashboard__header">
        <h1 className="dashboard__heading">Tổng quan &amp; Thống kê</h1>
        <p className="dashboard__subtitle">Số liệu tổng hợp của Cooked.</p>
      </header>

      {loading ? (
        <p className="dashboard__status">Đang tải thống kê...</p>
      ) : error ? (
        <div className="dashboard__error" role="alert">
          <span>{error}</span>
          <button type="button" className="dashboard__retry" onClick={handleRetry}>
            Thử lại
          </button>
        </div>
      ) : (
        <>
          <section className="dashboard__grid" aria-label="Thống kê chung">
            {STAT_CARDS.map(({ key, label, icon }) => (
              <article key={key} className="dashboard__card">
                <div className="dashboard__card-icon" aria-hidden="true">
                  <StatIcon type={icon} />
                </div>
                <div className="dashboard__card-body">
                  <p className="dashboard__card-label">{label}</p>
                  <p className="dashboard__card-value">{stats?.[key] ?? 0}</p>
                </div>
              </article>
            ))}
          </section>

          <section className="dashboard__section" aria-labelledby="top-rated-title">
            <h2 id="top-rated-title" className="dashboard__subheading">
              Món được đánh giá cao nhất
            </h2>
            <p className="dashboard__section-desc">Xếp theo điểm sao trung bình.</p>

            {topRated.length === 0 ? (
              <div className="dashboard__table-card">
                <p className="dashboard__empty">Chưa có món nào được đánh giá.</p>
              </div>
            ) : (
              <div className="dashboard__table-card">
                <div className="dashboard__table-head" aria-hidden="true">
                  <span>Hạng</span>
                  <span>Món ăn</span>
                  <span>Đánh giá</span>
                </div>
                <ol className="dashboard__top-list">
                  {topRated.map((recipe, index) => {
                    const rank = index + 1
                    const image = resolveRecipeImage(recipe.image)
                    return (
                      <li key={recipe.id} className="dashboard__top-item">
                        <span
                          className={`dashboard__rank${
                            rank <= 3 ? ' dashboard__rank--top' : ''
                          }`}
                        >
                          {rank}
                        </span>
                        <div className="dashboard__recipe-cell">
                          <div className="dashboard__thumb">
                            {image && <img src={image} alt={recipe.title} />}
                          </div>
                          <Link
                            to={`/recipe/${encodeURIComponent(recipe.id)}`}
                            className="dashboard__recipe-title"
                          >
                            {recipe.title}
                          </Link>
                        </div>
                        <div className="dashboard__rating">
                          <StarRating
                            value={Number(recipe.averageRating ?? 0)}
                            count={Number(recipe.reviewCount ?? 0)}
                            size="sm"
                          />
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
