import { Link, useParams } from 'react-router-dom'
import Footer from '../components/Footer/Footer'
import { MOCK_RECIPES } from '../data/mockRecipes'
import './CookingMode.css'

export default function CookingMode() {
  const { id } = useParams()
  const recipe = MOCK_RECIPES.find((item) => item.id === id)

  return (
    <div className="cooking-mode">
      <header className="cooking-mode__header">
        <div className="cooking-mode__context">
          <span>Chế độ nấu</span>
          {recipe && <span className="cooking-mode__recipe">{recipe.title}</span>}
        </div>
        <Link className="cooking-mode__logo" to="/">Cooked</Link>
        <div className="cooking-mode__exit-wrap">
          <Link className="cooking-mode__exit" to={id ? `/recipe/${encodeURIComponent(id)}` : '/'}>
            Thoát chế độ nấu
          </Link>
        </div>
      </header>
      <main className="cooking-mode__workspace">
        {!id && <h1 className="cooking-mode__title">Khu vực nấu ăn</h1>}
      </main>
      {!id && <Footer />}
    </div>
  )
}
