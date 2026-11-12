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
  const [progress, setProgress] = useState({ recipeId: null, index: 0 });
  const recipe = MOCK_RECIPES.find((item) => item.id === id);
  const stepIndex = progress.recipeId === id ? progress.index : 0;
  const isComplete =
    recipe && recipe.steps.length > 0 && stepIndex === recipe.steps.length;
  const currentStep = recipe?.steps[stepIndex];
  const nextStep = recipe?.steps[stepIndex + 1];
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
          <Link className="cooking-mode__exit" to="/">
            Thoát chế độ nấu
          </Link>
        </div>
      </header>
      <main className="cooking-mode__workspace" key={id || "empty"}>
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
                        <span className="cooking-picker__media">
                          <img
                            className="cooking-picker__image"
                            src={item.image}
                            alt=""
                          />
                        </span>
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
        {id &&
          (recipe ? (
            isComplete ? (
              <section
                className="cooking-step"
                aria-labelledby="cooking-complete-title"
              >
                <div className="cooking-step__progress">
                  <div className="cooking-step__progress-labels">
                    <span>
                      Hoàn thành {recipe.steps.length} / {recipe.steps.length}{" "}
                      bước
                    </span>
                    <span>Đã hoàn thành</span>
                  </div>
                  <div
                    className="cooking-step__segments"
                    role="progressbar"
                    aria-label="Tiến trình nấu ăn"
                    aria-valuemin={0}
                    aria-valuemax={recipe.steps.length}
                    aria-valuenow={recipe.steps.length}
                  >
                    {recipe.steps.map((_, index) => (
                      <span
                        className="cooking-step__segment cooking-step__segment--active"
                        key={index}
                      />
                    ))}
                  </div>
                </div>
                <div className="cooking-complete">
                  <p>BỮA ĂN ĐÃ SẴN SÀNG</p>
                  <h1 id="cooking-complete-title">Bạn đã hoàn thành món ăn!</h1>
                  <p>{recipe.title}</p>
                  <p>Bạn đã hoàn thành tất cả các bước nấu.</p>
                  <div className="cooking-complete__actions">
                    <Link className="cooking-complete__home" to="/">
                      Về trang chủ
                    </Link>
                    <Link
                      className="cooking-complete__next"
                      to="/cooking-mode-emty"
                      onClick={() => {
                        setProgress({ recipeId: null, index: 0 });
                        setSelectedId("");
                        setSearch("");
                      }}
                    >
                      Chọn món tiếp theo
                    </Link>
                  </div>
                </div>
              </section>
            ) : (
              <section
                className="cooking-step"
                aria-labelledby="cooking-step-recipe"
              >
                <div className="cooking-step__context">
                  <h1 id="cooking-step-recipe">{recipe.title}</h1>
                  <p>
                    {recipe.servings != null
                      ? `${recipe.servings} người`
                      : "Số khẩu phần chưa có"}{" "}
                    · {recipe.cookingTime} phút
                  </p>
                </div>
                {recipe.steps.length > 0 ? (
                  <>
                    <div className="cooking-step__progress">
                      <div className="cooking-step__progress-labels">
                        <span>
                          Bước {stepIndex + 1} / {recipe.steps.length}
                        </span>
                        <span>{currentStep.title}</span>
                      </div>
                      <div
                        className="cooking-step__segments"
                        role="progressbar"
                        aria-label="Tiến trình nấu ăn"
                        aria-valuemin={1}
                        aria-valuemax={recipe.steps.length}
                        aria-valuenow={stepIndex + 1}
                      >
                        {recipe.steps.map((_, index) => (
                          <span
                            className={
                              index <= stepIndex
                                ? "cooking-step__segment cooking-step__segment--active"
                                : "cooking-step__segment"
                            }
                            key={index}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="cooking-step__content">
                      <article
                        className="cooking-step__instruction"
                        key={`${id}-${stepIndex}`}
                      >
                        <p className="cooking-step__kicker">
                          BƯỚC {stepIndex + 1} ·{" "}
                          {currentStep.duration != null
                            ? `${currentStep.duration} PHÚT`
                            : "CHƯA CÓ THỜI GIAN"}
                        </p>
                        <h2>{currentStep.title}</h2>
                        <p className="cooking-step__description">
                          {currentStep.instruction}
                        </p>
                      </article>
                      <aside
                        className="cooking-step__preparation"
                        aria-labelledby="cooking-ingredients-title"
                      >
                        <h2 id="cooking-ingredients-title">
                          Nguyên liệu cho món
                        </h2>
                        <ul className="cooking-step__ingredients">
                          {recipe.ingredients.map((ingredient) => (
                            <li key={ingredient.name}>
                              <span>{ingredient.name}</span>
                              <span>
                                {ingredient.quantity} {ingredient.unit}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p>
                          Dụng cụ cho món:{" "}
                          {recipe.equipment.length
                            ? recipe.equipment.join(", ")
                            : "chưa có thông tin."}
                        </p>
                      </aside>
                    </div>
                    <div className="cooking-step__navigation">
                      <button
                        type="button"
                        disabled={stepIndex === 0}
                        onClick={() =>
                          setProgress({
                            recipeId: id,
                            index: Math.max(0, stepIndex - 1),
                          })
                        }
                      >
                        Bước trước
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setProgress({
                            recipeId: id,
                            index: Math.min(recipe.steps.length, stepIndex + 1),
                          })
                        }
                      >
                        {nextStep ? "Bước tiếp theo →" : "Hoàn thành món ăn"}
                      </button>
                    </div>
                    {nextStep && (
                      <p className="cooking-step__upcoming">
                        Tiếp theo: {nextStep.title}
                        {nextStep.duration != null &&
                          ` · ${nextStep.duration} phút`}
                      </p>
                    )}
                  </>
                ) : (
                  <p>Chưa có hướng dẫn nấu cho món này.</p>
                )}
              </section>
            )
          ) : (
            <div className="cooking-step__not-found">
              <h1>Không tìm thấy món ăn</h1>
              <Link to="/cooking-mode-emty">Chọn món để nấu</Link>
            </div>
          ))}
      </main>
      {!id && <Footer />}
    </div>
  );
}
