import { Link } from "react-router-dom";
import "./PendingRecipes.css";

const EXAMPLE_RECIPES = [
  {
    id: "example-1",
    title: "Bún chả Hà Nội",
    authorName: "Phạm Minh Anh",
    category: "Món nướng",
  },
  {
    id: "example-2",
    title: "Cá kho tộ",
    authorName: "Lê Thu Hà",
    category: "Món kho",
  },
  {
    id: "example-3",
    title: "Gỏi cuốn tôm thịt",
    authorName: "Đỗ Khánh Linh",
    category: "Món cuốn",
  },
];

export default function PendingRecipes({
  recipes = EXAMPLE_RECIPES,
  status = "preview",
  onView,
  onApprove,
  onReject,
  onRetry,
}) {
  const isPreview = status === "preview";
  return (
    <section
      className="pending-recipes"
      aria-labelledby="pending-recipes-title"
    >
      <nav className="pending-recipes__breadcrumb" aria-label="Đường dẫn">
        <Link to="/">Trang chủ</Link> /{" "}
        <Link to="/admin">Bảng điều khiển Admin</Link> /{" "}
        <span aria-current="page">Duyệt công thức</span>
      </nav>
      <header className="pending-recipes__header">
        <h1 id="pending-recipes-title">Duyệt công thức</h1>
        <p>Xem và duyệt các công thức mới do thành viên đăng.</p>
      </header>
      {isPreview && (
        <p className="pending-recipes__preview">
          Dữ liệu minh họa. Chức năng duyệt chưa được kết nối.
        </p>
      )}
      {status === "loading" ? (
        <p className="pending-recipes__state" role="status">
          Đang tải công thức chờ duyệt...
        </p>
      ) : status === "error" ? (
        <div className="pending-recipes__state" role="alert">
          <p>Không thể tải công thức chờ duyệt.</p>
          {onRetry && (
            <button
              type="button"
              className="pending-recipes__button"
              onClick={onRetry}
            >
              Thử lại
            </button>
          )}
        </div>
      ) : recipes.length === 0 ? (
        <div className="pending-recipes__state" role="status">
          Không còn công thức nào chờ duyệt.
        </div>
      ) : (
        <>
          <p className="pending-recipes__count">{recipes.length} chờ duyệt</p>
          <div className="pending-recipes__table-wrap">
            <table className="pending-recipes__table">
              <thead>
                <tr>
                  <th scope="col">Công thức</th>
                  <th scope="col">Tác giả</th>
                  <th scope="col">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => (
                  <tr key={recipe.id} className="pending-recipes__row">
                    <td>
                      <div className="pending-recipes__recipe">
                        {recipe.image ? (
                          <img
                            className="pending-recipes__image"
                            src={recipe.image}
                            alt=""
                          />
                        ) : (
                          <span
                            className="pending-recipes__image"
                            aria-hidden="true"
                          />
                        )}
                        <div>
                          <strong>{recipe.title}</strong>
                          {recipe.category && (
                            <p className="pending-recipes__category">
                              {recipe.category}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="pending-recipes__author">
                      {recipe.authorName ||
                        recipe.author?.name ||
                        recipe.authorId ||
                        "Chưa rõ tác giả"}
                    </td>
                    <td>
                      <div className="pending-recipes__actions">
                        <button
                          type="button"
                          className="pending-recipes__button pending-recipes__button--view"
                          disabled={!onView || isPreview}
                          onClick={() => onView?.(recipe)}
                        >
                          Xem
                          <span className="pending-recipes__sr-only">
                            {" "}
                            {recipe.title}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="pending-recipes__button pending-recipes__button--reject"
                          disabled={!onReject || isPreview}
                          onClick={() => onReject?.(recipe)}
                        >
                          Từ chối
                          <span className="pending-recipes__sr-only">
                            {" "}
                            {recipe.title}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="pending-recipes__button pending-recipes__button--approve"
                          disabled={!onApprove || isPreview}
                          onClick={() => onApprove?.(recipe)}
                        >
                          Chấp nhận
                          <span className="pending-recipes__sr-only">
                            {" "}
                            {recipe.title}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="pending-recipes__note">
        Công thức được duyệt sẽ hiển thị công khai trên trang chủ.
      </p>
    </section>
  );
}
