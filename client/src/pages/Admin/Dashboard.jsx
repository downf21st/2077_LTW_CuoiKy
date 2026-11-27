import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats } from '../../api'
import { resolveRecipeImage } from '../../utils/weeklyMenuHelper'
import './Dashboard.css'

const STAT_CARDS = [
  { key: 'totalRecipes', label: 'Tổng món đã duyệt' },
  { key: 'pendingRecipes', label: 'Món chờ duyệt' },
  { key: 'totalUsers', label: 'Số người dùng' },
  { key: 'totalReviews', label: 'Số đánh giá' },
]

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

  if (loading) {
    return (
      <div className="dashboard">
        <h1 className="dashboard__heading">Tổng quan</h1>
        <p className="dashboard__status">Đang tải thống kê...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard">
        <h1 className="dashboard__heading">Tổng quan</h1>
        <div className="dashboard__error" role="alert">
          <span>{error}</span>
          <button type="button" className="dashboard__retry" onClick={handleRetry}>
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const topRated = Array.isArray(stats?.topRated) ? stats.topRated.slice(0, 5) : []

  return (
    <div className="dashboard">
      <h1 className="dashboard__heading">Tổng quan</h1>

      <section className="dashboard__grid" aria-label="Thống kê chung">
        {STAT_CARDS.map(({ key, label }) => (
          <article key={key} className="dashboard__card">
            <p className="dashboard__card-label">{label}</p>
            <p className="dashboard__card-value">{stats?.[key] ?? 0}</p>
          </article>
        ))}
      </section>

      <section className="dashboard__section" aria-labelledby="top-rated-title">
        <h2 id="top-rated-title" className="dashboard__subheading">
          Top món đánh giá cao
        </h2>

        {topRated.length === 0 ? (
          <p className="dashboard__empty">Chưa có món nào được đánh giá.</p>
        ) : (
          <ol className="dashboard__top-list">
            {topRated.map((recipe, index) => {
              const image = resolveRecipeImage(recipe.image)
              return (
                <li key={recipe.id} className="dashboard__top-item">
                  <span className="dashboard__rank">{index + 1}</span>
                  <div className="dashboard__thumb">
                    {image && <img src={image} alt={recipe.title} />}
                  </div>
                  <Link
                    to={`/recipe/${encodeURIComponent(recipe.id)}`}
                    className="dashboard__recipe-title"
                  >
                    {recipe.title}
                  </Link>
                  <span className="dashboard__rating">
                    ★ {Number(recipe.averageRating ?? 0).toFixed(1)} ({recipe.reviewCount ?? 0} lượt)
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}
