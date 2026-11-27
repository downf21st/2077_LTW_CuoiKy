import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getRecipes, setRecipeStatus } from "../../api";
import "./PendingRecipes.css";

function imageUrl(image) {
  if (!image?.startsWith("/uploads/")) return image;
  const apiUrl = new URL(
    import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    window.location.href,
  );
  return new URL(image, apiUrl.origin).href;
}

export default function PendingRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [working, setWorking] = useState({});
  const [actionErrors, setActionErrors] = useState({});
  const inFlight = useRef(new Set());

  useEffect(() => {
    let active = true;
    async function loadRecipes() {
      setStatus("loading");
      setLoadError("");
      try {
        const list = [];
        let page = 1;
        let batch;
        do {
          batch = await getRecipes({ status: "pending", page, limit: 100 });
          if (!Array.isArray(batch))
            throw new Error("Dữ liệu công thức không hợp lệ.");
          list.push(...batch);
          page += 1;
        } while (batch.length === 100 && active);
        if (active) {
          setRecipes(list);
          setStatus("ready");
        }
      } catch (error) {
        if (active) {
          setLoadError(error.message || "Không thể tải công thức chờ duyệt.");
          setStatus("error");
        }
      }
    }
    loadRecipes();
    return () => {
      active = false;
    };
  }, [attempt]);

  async function updateStatus(recipe, nextStatus) {
    if (recipe.id == null) return;
    const id = String(recipe.id);
    if (inFlight.current.has(id)) return;
    inFlight.current.add(id);
    setWorking((current) => ({ ...current, [id]: true }));
    setActionErrors((current) => ({ ...current, [id]: "" }));
    try {
      await setRecipeStatus(recipe.id, nextStatus);
      setRecipes((current) => current.filter((item) => String(item.id) !== id));
    } catch (error) {
      const detail =
        error?.message && error.message !== "Failed to fetch"
          ? ` ${error.message}`
          : "";
      setActionErrors((current) => ({
        ...current,
        [id]: `Không thể cập nhật công thức. Vui lòng thử lại.${detail}`,
      }));
    } finally {
      inFlight.current.delete(id);
      setWorking((current) => ({ ...current, [id]: false }));
    }
  }

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
      {status === "loading" ? (
        <p className="pending-recipes__state" role="status">
          Đang tải công thức chờ duyệt...
        </p>
      ) : status === "error" ? (
        <div className="pending-recipes__state" role="alert">
          <p>Không thể tải công thức chờ duyệt.</p>
          {loadError && loadError !== "Failed to fetch" && <p>{loadError}</p>}
          <button
            type="button"
            className="pending-recipes__button"
            onClick={() => setAttempt((current) => current + 1)}
          >
            Thử lại
          </button>
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
                            src={imageUrl(recipe.image)}
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
                        {recipe.id != null ? (
                          <Link
                            className="pending-recipes__button pending-recipes__button--view"
                            to={`/recipe/${encodeURIComponent(recipe.id)}`}
                          >
                            Xem
                            <span className="pending-recipes__sr-only">
                              {" "}
                              {recipe.title}
                            </span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="pending-recipes__button pending-recipes__button--view"
                            disabled
                          >
                            Xem
                            <span className="pending-recipes__sr-only">
                              {" "}
                              {recipe.title}
                            </span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="pending-recipes__button pending-recipes__button--reject"
                          disabled={
                            recipe.id == null || !!working[String(recipe.id)]
                          }
                          onClick={() => updateStatus(recipe, "rejected")}
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
                          disabled={
                            recipe.id == null || !!working[String(recipe.id)]
                          }
                          onClick={() => updateStatus(recipe, "approved")}
                        >
                          Chấp nhận
                          <span className="pending-recipes__sr-only">
                            {" "}
                            {recipe.title}
                          </span>
                        </button>
                      </div>
                      {working[String(recipe.id)] && (
                        <p
                          className="pending-recipes__action-message"
                          role="status"
                        >
                          Đang cập nhật...
                        </p>
                      )}
                      {actionErrors[String(recipe.id)] && (
                        <p
                          className="pending-recipes__action-message pending-recipes__action-message--error"
                          role="alert"
                        >
                          {actionErrors[String(recipe.id)]}
                        </p>
                      )}
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
