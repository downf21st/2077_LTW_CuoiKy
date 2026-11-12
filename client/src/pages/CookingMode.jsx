import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import { MOCK_RECIPES } from "../data/mockRecipes";
import timerIcon from "../assets/cooking-mode/timer.svg";
import closeIcon from "../assets/cooking-mode/close.svg";
import "./CookingMode.css";

export default function CookingMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const recipe = MOCK_RECIPES.find((item) => item.id === id);
  const selectedRecipe = MOCK_RECIPES.find((item) => item.id === selectedId);
  const filteredRecipes = MOCK_RECIPES.filter((item) =>
    item.title
      .toLocaleLowerCase("vi")
      .includes(search.trim().toLocaleLowerCase("vi")),
  );

  return (
    <div className="cooking-mode">
      <header className="cooking-mode__header">
        <div className="cooking-mode__context">
          <span>Chế độ nấu</span>
          {recipe && (
            <span className="cooking-mode__recipe">{recipe.title}</span>
          )}
        </div>
        <Link className="cooking-mode__logo" to="/">
          Cooked
        </Link>
        <div className="cooking-mode__exit-wrap">
          <Link
            className="cooking-mode__exit"
            to={id ? `/recipe/${encodeURIComponent(id)}` : "/"}
          >
            Thoát chế độ nấu
          </Link>
        </div>
      </header>
      <main className="cooking-mode__workspace">
        {!id && (
          <>
            <h1 className="cooking-mode__title">Khu vực nấu ăn</h1>
            <section
              className="cooking-picker"
              aria-labelledby="cooking-picker-title"
            >
              <div className="cooking-picker__header">
                <h2 id="cooking-picker-title">Chọn món để nấu</h2>
                <Link
                  className="cooking-picker__close"
                  to="/"
                  aria-label="Đóng chọn món"
                >
                  <img src={closeIcon} alt="" />
                </Link>
              </div>
              <label className="cooking-picker__search">
                <span>Tìm món ăn</span>
                <input
                  type="search"
                  placeholder="Tìm món ăn..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              {filteredRecipes.length > 0 ? (
                <>
                  {selectedRecipe && (
                    <p className="cooking-picker__summary">
                      Đã chọn: {selectedRecipe.title}
                    </p>
                  )}
                  <div
                    className="cooking-picker__grid"
                    role="radiogroup"
                    aria-label="Chọn món để nấu"
                  >
                    {filteredRecipes.map((item) => (
                      <label
                        className={`cooking-picker__card${selectedId === item.id ? " cooking-picker__card--selected" : ""}`}
                        key={item.id}
                      >
                        <input
                          className="cooking-picker__radio"
                          type="radio"
                          name="cooking-recipe"
                          value={item.id}
                          checked={selectedId === item.id}
                          onChange={() => setSelectedId(item.id)}
                        />
                        <img
                          className="cooking-picker__image"
                          src={item.image}
                          alt=""
                        />
                        {selectedId === item.id && (
                          <span className="cooking-picker__selected">
                            Đã chọn
                          </span>
                        )}
                        <span className="cooking-picker__card-body">
                          <span className="cooking-picker__badges">
                            <span className="cooking-picker__time">
                              <img src={timerIcon} alt="" />
                              {item.cookingTime} phút
                            </span>
                            <span
                              className={`cooking-picker__difficulty${item.difficulty === "Trung bình" ? " cooking-picker__difficulty--medium" : item.difficulty === "Khó" ? " cooking-picker__difficulty--hard" : ""}`}
                            >
                              {item.difficulty}
                            </span>
                          </span>
                          <span className="cooking-picker__card-title">
                            {item.title}
                          </span>
                          <span className="cooking-picker__description">
                            {item.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <div className="cooking-picker__empty" role="status">
                  <h3>Không tìm thấy món ăn phù hợp.</h3>
                  <p>Thử tìm bằng tên món khác.</p>
                </div>
              )}
              <div className="cooking-picker__actions">
                <Link className="cooking-picker__cancel" to="/">
                  Hủy
                </Link>
                <button
                  className="cooking-picker__start"
                  type="button"
                  disabled={!selectedRecipe || filteredRecipes.length === 0}
                  onClick={() =>
                    navigate(
                      `/recipe/${encodeURIComponent(selectedId)}/cooking-mode`,
                    )
                  }
                >
                  Bắt đầu nấu
                </button>
              </div>
            </section>
          </>
        )}
      </main>
      {!id && <Footer />}
    </div>
  );
}
