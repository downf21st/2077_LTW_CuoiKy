import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getMyRecipes, deleteRecipe } from "../../api";
import useAuth from "../../hooks/useAuth";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import emptyIcon from "../../assets/recipe-empty.svg";
import "./MyRecipes.css";

function displayRecipe(recipe) {
  if (!recipe.image?.startsWith('/uploads/')) return recipe;
  const apiUrl = new URL(import.meta.env.VITE_API_URL || 'http://localhost:5000/api', window.location.href);
  return { ...recipe, image: new URL(recipe.image, apiUrl.origin).href };
}

export default function MyRecipes() {
  const { user } = useAuth();
  const userId = user?.id;
  const [attempt, setAttempt] = useState(0);
  const [recipes, setRecipes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const heading = useRef(null);
  useEffect(() => {
    let active = true;
    const request = userId
      ? getMyRecipes(userId)
      : Promise.reject(new Error("Không xác định được tài khoản."));
    request
      .then((list) => {
        if (!Array.isArray(list))
          throw new Error("Dữ liệu công thức không hợp lệ.");
        if (!active) return;
        setRecipes(
          list.filter((item) => String(item.authorId) === String(userId)),
        );
        setStatus("done");
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.message || "Không thể tải công thức.");
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [userId, attempt]);
  useEffect(() => {
    if (selected && !dialog.current.open) dialog.current.showModal();
  }, [selected]);
  const close = () => {
    if (!deleting) dialog.current?.close();
  };
  const remove = async () => {
    if (deleting) return;
    setDeleting(true);
    setMessage("");
    try {
      await deleteRecipe(selected.id);
      setRecipes((items) => items.filter((item) => item.id !== selected.id));
      dialog.current.close();
      setMessage("Đã xóa công thức.");
    } catch (error) {
      setMessage(error.message || "Không thể xóa công thức.");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <main className="my-recipes">
      <nav className="my-recipes__breadcrumb" aria-label="Đường dẫn">
        <Link to="/">Trang chủ</Link> / Công thức của tôi
      </nav>
      <header className="my-recipes__header">
        <h1 ref={heading} tabIndex={-1}>
          Công thức của tôi
        </h1>
        <p>Quản lý các món bạn đã đăng.</p>
      </header>
      {status === "loading" && <p role="status">Đang tải công thức...</p>}
      {status === "error" && (
        <div role="alert">
          <p>{message}</p>
          <button
            type="button"
            onClick={() => {
              setStatus("loading");
              setMessage("");
              setAttempt((value) => value + 1);
            }}
          >
            Thử lại
          </button>
        </div>
      )}
      {status === "done" && !selected && message && (
        <p role="status">{message}</p>
      )}
      {status === "done" && recipes.length >= 100 && (
        <p>Hiển thị tối đa 100 công thức đầu tiên.</p>
      )}
      {status === "done" &&
        (recipes.length ? (
          <div className="my-recipes__grid">
            {recipes.map((recipe) => (
              <div className="my-recipes__item" key={recipe.id}>
                <RecipeCard
                  recipe={displayRecipe(recipe)}
                  overlayAction={
                    <span
                      className={`my-recipes__status my-recipes__status--${recipe.status}`}
                    >
                      {recipe.status === "approved"
                        ? "Đã duyệt"
                        : recipe.status === "pending"
                          ? "Chờ duyệt"
                          : "Chưa có trạng thái"}
                    </span>
                  }
                />
                <div className="my-recipes__actions">
                  <Link to={`/recipe/edit/${encodeURIComponent(recipe.id)}`}>
                    Sửa
                  </Link>
                  <button
                    type="button"
                    onClick={(event) => {
                      trigger.current = event.currentTarget;
                      setMessage("");
                      setSelected(recipe);
                    }}
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
        ))}
      {selected && (
        <dialog
          ref={dialog}
          className="my-recipes__dialog"
          aria-labelledby="delete-title"
          aria-describedby="delete-description"
          onCancel={(event) => {
            if (deleting) event.preventDefault();
          }}
          onClose={() => {
            setSelected(null);
            requestAnimationFrame(() =>
              (trigger.current?.isConnected
                ? trigger.current
                : heading.current
              )?.focus(),
            );
          }}
        >
          <h2 id="delete-title">Xóa công thức?</h2>
          <p id="delete-description">
            Món “{selected.title}” sẽ bị xóa vĩnh viễn và không thể khôi phục.
          </p>
          {message && <p role="alert">{message}</p>}
          <div className="my-recipes__dialog-actions">
            <button type="button" autoFocus disabled={deleting} onClick={close}>
              Hủy
            </button>
            <button type="button" disabled={deleting} onClick={remove}>
              {deleting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </dialog>
      )}
    </main>
  );
}
