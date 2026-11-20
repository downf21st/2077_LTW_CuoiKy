import { Link, useLocation } from "react-router-dom";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import { MOCK_RECIPES } from "../../data/mockRecipes";
import emptyIcon from "../../assets/recipe-empty.svg";
import "./MyRecipes.css";

const examples = MOCK_RECIPES.slice(0, 6).map((recipe, index) => ({
  ...recipe,
  status: index % 2 ? "pending" : "approved",
}));

export default function MyRecipes() {
  const { search } = useLocation();
  const recipes =
    import.meta.env.DEV && new URLSearchParams(search).has("empty")
      ? []
      : examples;

  return (
    <main className="my-recipes">
      <nav className="my-recipes__breadcrumb" aria-label="Đường dẫn">
        <Link to="/">Trang chủ</Link> / Công thức của tôi
      </nav>
      <header className="my-recipes__header">
        <h1>Công thức của tôi</h1>
        <p>Quản lý các món bạn đã đăng.</p>
        <p>Dữ liệu mẫu để xem giao diện, chưa kết nối tài khoản.</p>
      </header>
      {recipes.length ? (
        <div className="my-recipes__grid">
          {recipes.map((recipe) => (
            <div className="my-recipes__item" key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                overlayAction={
                  <span
                    className={`my-recipes__status my-recipes__status--${recipe.status}`}
                  >
                    {recipe.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                  </span>
                }
              />
              <div className="my-recipes__actions">
                <button
                  type="button"
                  aria-disabled="true"
                  title="Chức năng đang được phát triển"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  aria-disabled="true"
                  title="Chức năng đang được phát triển"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section className="my-recipes__empty">
          <img src={emptyIcon} alt="" />
          <p>Bạn chưa đăng món nào.</p>
          <Link to="/recipe/create">Đăng món đầu tiên</Link>
        </section>
      )}
    </main>
  );
}
