import { Link, useParams } from "react-router-dom";
import lockIcon from "../assets/lock-keyhole.svg";
import StarRating, { StarInput } from "../components/StarRating/StarRating";
import { MOCK_RECIPES } from "../data/mockRecipes";
import "./RecipeDetail.css";

function RecipeContent({ recipe }) {
  const ingredients = recipe.ingredients ?? [];
  const steps = recipe.steps ?? [];
  const equipment = recipe.equipment ?? [];
  const reviews = recipe.reviews ?? [];
  const cookingPath = `/recipe/${encodeURIComponent(recipe.id)}/cooking-mode`;

  return (
    <div className="recipe-detail">
      <nav className="recipe-detail__breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Trang chủ</Link> / Món ăn / {recipe.title}
      </nav>
      <section className="recipe-detail__hero" aria-labelledby="recipe-title">
        <figure className="recipe-detail__photo">
          {recipe.image ? (
            <img
              className="recipe-detail__photo-image"
              src={recipe.image}
              alt={recipe.title}
              width="584"
              height="474"
            />
          ) : (
            <span>Chưa có ảnh món ăn</span>
          )}
        </figure>
        <div className="recipe-detail__introduction">
          <p className="recipe-detail__kicker">
            {recipe.category || "Chưa có loại món"}
          </p>
          <h1 className="recipe-detail__title" id="recipe-title">
            {recipe.title}
          </h1>
          <div className="recipe-detail__author">
            {recipe.authorId
              ? `Người đăng: ${recipe.authorId}`
              : "Chưa có thông tin người đăng"}
          </div>
          <p className="recipe-detail__description">
            {recipe.description || "Chưa có mô tả."}
          </p>
          <div className="recipe-detail__rating">
            {reviews.length > 0 && recipe.averageRating != null ? (
              <>
                <StarRating value={recipe.averageRating} />
                <span>
                  {recipe.averageRating}/5 · {reviews.length} đánh giá
                </span>
              </>
            ) : (
              <span>Chưa có đánh giá</span>
            )}
          </div>
          <div className="recipe-detail__stats">
            <div className="recipe-detail__stat">
              <span>
                {recipe.cookingTime != null
                  ? `${recipe.cookingTime} phút`
                  : "Chưa cập nhật"}
              </span>
              <span className="recipe-detail__stat-label">Thời gian</span>
            </div>
            <div className="recipe-detail__stat">
              <span>{recipe.difficulty || "Chưa cập nhật"}</span>
              <span className="recipe-detail__stat-label">Độ khó</span>
            </div>
            <div className="recipe-detail__stat">
              <span>
                {recipe.servings != null
                  ? `${recipe.servings} người`
                  : "Chưa cập nhật"}
              </span>
              <span className="recipe-detail__stat-label">Khẩu phần</span>
            </div>
          </div>
          {steps.length > 0 ? (
            <Link
              className="recipe-detail__button recipe-detail__button--primary"
              to={cookingPath}
            >
              Bắt đầu nấu
            </Link>
          ) : (
            <button
              className="recipe-detail__button recipe-detail__button--disabled"
              type="button"
              disabled
            >
              Bắt đầu nấu
            </button>
          )}
          <p className="recipe-detail__note">
            Nấu từng bước, không cần đăng nhập.
          </p>
        </div>
      </section>
      <section
        className="recipe-detail__guest"
        aria-label="Tính năng dành cho thành viên"
      >
        <p className="recipe-detail__guest-message">
          <img className="recipe-detail__lock-icon" src={lockIcon} alt="" />
          Đăng nhập để lưu món yêu thích và lên thực đơn tuần.
        </p>
        <div className="recipe-detail__guest-actions">
          <button
            className="recipe-detail__button recipe-detail__button--locked"
            type="button"
            disabled
          >
            Lưu yêu thích
          </button>
          <button
            className="recipe-detail__button recipe-detail__button--locked"
            type="button"
            disabled
          >
            Thêm vào thực đơn tuần
          </button>
          <Link
            className="recipe-detail__button recipe-detail__button--primary recipe-detail__button--login"
            to="/login"
          >
            Đăng nhập
          </Link>
        </div>
      </section>
      <div className="recipe-detail__content">
        <section
          className="recipe-detail__ingredients"
          aria-labelledby="ingredients-heading"
        >
          <div className="recipe-detail__ingredient-card">
            <h2
              className="recipe-detail__section-title"
              id="ingredients-heading"
            >
              Nguyên liệu
            </h2>
            <div className="recipe-detail__servings">
              <span>
                {recipe.servings != null
                  ? `Cho ${recipe.servings} người`
                  : "Chưa có khẩu phần"}
              </span>
              <span className="recipe-detail__ingredient-count">
                {ingredients.length} nguyên liệu
              </span>
            </div>
            {ingredients.length > 0 ? (
              <>
                <p className="recipe-detail__helper">
                  Đánh dấu những thứ bạn đã chuẩn bị.
                </p>
                <ul className="recipe-detail__ingredient-list">
                  {ingredients.map(({ name, quantity, unit }, index) => (
                    <li
                      className="recipe-detail__ingredient"
                      key={`${name}-${index}`}
                    >
                      <label className="recipe-detail__ingredient-label">
                        <input
                          className="recipe-detail__ingredient-checkbox"
                          type="checkbox"
                        />
                        <span className="recipe-detail__ingredient-name">
                          {name}
                        </span>
                        <span className="recipe-detail__amount">
                          {quantity ?? ""} {unit ?? ""}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="recipe-detail__helper">
                Chưa có danh sách nguyên liệu.
              </p>
            )}
          </div>
          <aside className="recipe-detail__tip">
            <h3 className="recipe-detail__tip-title">Dụng cụ</h3>
            <p>
              {equipment.length
                ? equipment.join(", ")
                : "Chưa có thông tin dụng cụ."}
            </p>
          </aside>
        </section>
        <section
          className="recipe-detail__instructions"
          aria-labelledby="instructions-heading"
        >
          <h2
            className="recipe-detail__section-title"
            id="instructions-heading"
          >
            Cách làm
          </h2>
          <p className="recipe-detail__helper">
            {steps.length
              ? `${steps.length} bước thực hiện.`
              : "Chưa có hướng dẫn nấu."}
          </p>
          <ol className="recipe-detail__step-list">
            {steps.map((step, index) => (
              <li className="recipe-detail__step" key={index}>
                <span className="recipe-detail__step-number" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="recipe-detail__step-content">
                  <h3 className="recipe-detail__step-title">
                    {step.title || `Bước ${index + 1}`}
                  </h3>
                  {step.duration != null && (
                    <p className="recipe-detail__step-duration">
                      {step.duration} phút
                    </p>
                  )}
                  <p className="recipe-detail__step-description">
                    {step.instruction || "Chưa có hướng dẫn."}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          {steps.length > 0 && (
            <div className="recipe-detail__invitation">
              <h3 className="recipe-detail__invitation-title">
                Sẵn sàng vào bếp?
              </h3>
              <p className="recipe-detail__helper">
                Chuyển sang chế độ nấu để xem từng bước rõ ràng hơn.
              </p>
              <Link
                className="recipe-detail__button recipe-detail__button--primary recipe-detail__invitation-button"
                to={cookingPath}
              >
                Bắt đầu nấu
              </Link>
            </div>
          )}
        </section>
      </div>
      <section
        className="recipe-detail__reviews"
        aria-labelledby="reviews-heading"
      >
        <h2 className="recipe-detail__section-title" id="reviews-heading">
          Chuyện từ căn bếp
        </h2>
        <p className="recipe-detail__helper">
          Những chia sẻ sau mỗi lần vào bếp.
        </p>
        <div className="recipe-detail__reviews-layout">
          <div className="recipe-detail__community">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <article
                  className="recipe-detail__review"
                  key={review.id ?? index}
                >
                  <p>{review.name || "Người dùng"}</p>
                  {review.rating != null && (
                    <StarRating value={review.rating} size="sm" />
                  )}
                  <p>{review.text || ""}</p>
                </article>
              ))
            ) : (
              <p className="recipe-detail__helper">
                Chưa có đánh giá cho món này.
              </p>
            )}
          </div>
          <form
            className="recipe-detail__review-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <h3 className="recipe-detail__review-form-title">
              Bữa cơm của bạn thế nào?
            </h3>
            <p className="recipe-detail__review-login-hint">
              <img className="recipe-detail__lock-icon" src={lockIcon} alt="" />{" "}
              Đăng nhập để đánh giá và bình luận.
            </p>
            <Link
              className="recipe-detail__button recipe-detail__button--primary recipe-detail__review-form-button"
              to="/login"
            >
              Đăng nhập
            </Link>
            <fieldset className="recipe-detail__rating-field" disabled>
              <legend className="recipe-detail__rating-legend">
                Điểm của bạn · Chưa đăng nhập
              </legend>
              <StarInput name="rating" />
            </fieldset>
            <label className="recipe-detail__comment-label">
              Bình luận của bạn
              <textarea
                className="recipe-detail__comment"
                placeholder="Viết cảm nhận của bạn…"
                disabled
              />
            </label>
            <button
              className="recipe-detail__button recipe-detail__button--disabled recipe-detail__review-form-button"
              type="submit"
              disabled
            >
              Gửi đánh giá
            </button>
            <p className="recipe-detail__review-form-note">
              Chưa thể gửi khi chưa đăng nhập.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}

export default function RecipeDetail() {
  const { id } = useParams();
  const recipe = MOCK_RECIPES.find((item) => item.id === id);
  if (!recipe)
    return (
      <div className="recipe-detail" key={id}>
        <h1>Không tìm thấy món ăn</h1>
        <p>Món ăn này không có trong dữ liệu mẫu.</p>
        <Link className="recipe-detail__back" to="/">
          Về trang chủ
        </Link>
      </div>
    );
  return <RecipeContent key={recipe.id} recipe={recipe} />;
}
