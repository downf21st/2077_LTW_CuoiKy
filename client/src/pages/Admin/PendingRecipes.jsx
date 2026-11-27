import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getRecipeById, getRecipes, setRecipeStatus } from "../../api";
import "./PendingRecipes.css";

function imageUrl(image) {
  if (!image?.startsWith("/uploads/")) return image;
  const apiUrl = new URL(
    import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    window.location.href,
  );
  return new URL(image, apiUrl.origin).href;
}

function formatSubmittedAt(value) {
  if (!value) return "Chưa có ngày gửi";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có ngày gửi";
  const day = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${day} · ${time}`;
}

function difficultyClass(value) {
  const difficulty = String(value || "")
    .trim()
    .toLocaleLowerCase("vi-VN");
  if (difficulty === "dễ") return "easy";
  if (difficulty === "trung bình") return "medium";
  if (difficulty === "khó") return "hard";
  return "unknown";
}

export default function PendingRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [working, setWorking] = useState({});
  const [actionErrors, setActionErrors] = useState({});
  const inFlight = useRef(new Set());
  const previewDialog = useRef(null);
  const rejectDialog = useRef(null);
  const previewTrigger = useRef(null);
  const rejectTrigger = useRef(null);
  const headingRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [previewStatus, setPreviewStatus] = useState("loading");
  const [previewAttempt, setPreviewAttempt] = useState(0);
  const [rejectRecipe, setRejectRecipe] = useState(null);
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const previewId = preview?.id;

  useEffect(() => {
    if (previewId == null) return;
    if (!previewDialog.current.open) previewDialog.current.showModal();
    let active = true;
    async function loadDetail() {
      setPreviewStatus("loading");
      try {
        const detail = await getRecipeById(previewId);
        if (!detail || typeof detail !== "object")
          throw new Error("Invalid recipe");
        if (active) {
          setPreview((current) =>
            current && String(current.id) === String(detail.id)
              ? { ...current, ...detail }
              : current,
          );
          setPreviewStatus("ready");
        }
      } catch {
        if (active) setPreviewStatus("error");
      }
    }
    loadDetail();
    return () => {
      active = false;
    };
  }, [previewId, previewAttempt]);

  useEffect(() => {
    if (rejectRecipe && !rejectDialog.current.open)
      rejectDialog.current.showModal();
  }, [rejectRecipe]);

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
      return true;
    } catch (error) {
      const detail =
        error?.message && error.message !== "Failed to fetch"
          ? ` ${error.message}`
          : "";
      setActionErrors((current) => ({
        ...current,
        [id]: `Không thể cập nhật công thức. Vui lòng thử lại.${detail}`,
      }));
      return false;
    } finally {
      inFlight.current.delete(id);
      setWorking((current) => ({ ...current, [id]: false }));
    }
  }

  function openPreview(recipe, trigger) {
    previewTrigger.current = trigger;
    setPreviewAttempt(0);
    setPreview(recipe);
  }

  function openRejection(recipe, trigger) {
    rejectTrigger.current = trigger;
    setReason("");
    setOtherReason("");
    setActionErrors((current) => ({ ...current, [String(recipe.id)]: "" }));
    setRejectRecipe(recipe);
  }

  async function approvePreview() {
    if (preview && (await updateStatus(preview, "approved")))
      previewDialog.current?.close();
  }

  async function confirmRejection() {
    if (rejectRecipe && (await updateStatus(rejectRecipe, "rejected"))) {
      rejectDialog.current?.close();
      if (previewDialog.current?.open) previewDialog.current.close();
    }
  }

  const query = search.trim().toLocaleLowerCase("vi-VN");
  const filteredRecipes = recipes.filter((recipe) =>
    [
      recipe.title,
      recipe.authorName || recipe.author?.name || recipe.authorId,
    ].some((value) =>
      String(value ?? "")
        .toLocaleLowerCase("vi-VN")
        .includes(query),
    ),
  );

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
        <h1 id="pending-recipes-title" ref={headingRef} tabIndex={-1}>
          Duyệt công thức
        </h1>
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
          <input
            className="pending-recipes__search"
            type="search"
            aria-label="Tìm theo tên món hoặc tác giả"
            placeholder="Tìm theo tên món hoặc tác giả..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {filteredRecipes.length === 0 ? (
            <p className="pending-recipes__state" role="status">
              Không tìm thấy công thức phù hợp.
            </p>
          ) : (
            <div className="pending-recipes__table-wrap">
              <table className="pending-recipes__table">
                <thead>
                  <tr>
                    <th scope="col">Công thức</th>
                    <th scope="col">Tác giả</th>
                    <th scope="col">Gửi lúc</th>
                    <th scope="col">Thời gian &amp; độ khó</th>
                    <th scope="col">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipes.map((recipe) => (
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
                      <td className="pending-recipes__submitted">
                        <span className="pending-recipes__mobile-label">
                          Gửi lúc:{" "}
                        </span>
                        {formatSubmittedAt(recipe.createdAt)}
                      </td>
                      <td>
                        <div className="pending-recipes__meta">
                          <span className="pending-recipes__time">
                            {recipe.cookingTime != null &&
                            recipe.cookingTime !== ""
                              ? `${recipe.cookingTime} phút`
                              : "Chưa có thời gian"}
                          </span>
                          <span
                            className={`pending-recipes__difficulty pending-recipes__difficulty--${difficultyClass(recipe.difficulty)}`}
                          >
                            {recipe.difficulty || "Chưa có độ khó"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="pending-recipes__actions">
                          <button
                            type="button"
                            className="pending-recipes__button pending-recipes__button--view"
                            disabled={recipe.id == null}
                            onClick={(event) =>
                              openPreview(recipe, event.currentTarget)
                            }
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
                            disabled={
                              recipe.id == null || !!working[String(recipe.id)]
                            }
                            onClick={(event) =>
                              openRejection(recipe, event.currentTarget)
                            }
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
          )}
        </>
      )}
      <p className="pending-recipes__note">
        Công thức được duyệt sẽ hiển thị công khai trên trang chủ.
      </p>
      <dialog
        ref={previewDialog}
        className="pending-recipes__dialog pending-recipes__dialog--preview"
        aria-labelledby="pending-preview-title"
        onCancel={(event) => {
          if (preview && working[String(preview.id)]) event.preventDefault();
        }}
        onClose={() => {
          setPreview(null);
          requestAnimationFrame(() =>
            (previewTrigger.current?.isConnected
              ? previewTrigger.current
              : headingRef.current
            )?.focus(),
          );
        }}
      >
        <div className="pending-recipes__dialog-heading">
          <h2 id="pending-preview-title">Xem trước công thức</h2>
          <button
            className="pending-recipes__button"
            type="button"
            disabled={preview && !!working[String(preview.id)]}
            onClick={() => previewDialog.current.close()}
            aria-label="Đóng xem trước"
          >
            ×
          </button>
        </div>
        {previewStatus === "loading" ? (
          <p role="status">Đang tải công thức...</p>
        ) : previewStatus === "error" ? (
          <div role="alert">
            <p>Không thể tải chi tiết công thức.</p>
            <button
              className="pending-recipes__button"
              type="button"
              onClick={() => setPreviewAttempt((v) => v + 1)}
            >
              Thử lại
            </button>
          </div>
        ) : (
          preview && (
            <>
              {preview.image && (
                <img
                  className="pending-recipes__preview-image"
                  src={imageUrl(preview.image)}
                  alt=""
                />
              )}
              <h3>{preview.title || "Công thức chưa có tên"}</h3>
              <p>
                Tác giả:{" "}
                {preview.authorName ||
                  preview.author?.name ||
                  preview.authorId ||
                  "Chưa rõ tác giả"}
              </p>
              <p>
                {preview.cookingTime != null
                  ? `${preview.cookingTime} phút`
                  : "Chưa có thời gian"}{" "}
                · {preview.difficulty || "Chưa có độ khó"}
              </p>
              <p className="pending-recipes__detail-text">
                {preview.description || "Chưa có mô tả."}
              </p>
              <section className="pending-recipes__detail-section">
                <h3>Nguyên liệu</h3>
                {Array.isArray(preview.ingredients) &&
                preview.ingredients.length ? (
                  <ul>
                    {preview.ingredients.map((item, index) => (
                      <li key={index}>
                        {typeof item === "string"
                          ? item
                          : [item?.name, item?.quantity, item?.unit]
                              .filter((value) => value != null && value !== "")
                              .join(" ")}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Chưa có nguyên liệu.</p>
                )}
              </section>
              <section className="pending-recipes__detail-section">
                <h3>Các bước</h3>
                {Array.isArray(preview.steps) && preview.steps.length ? (
                  <ol>
                    {preview.steps.map((step, index) => (
                      <li key={index}>
                        {typeof step === "string" ? (
                          step
                        ) : (
                          <>
                            {step?.title && <strong>{step.title}</strong>}
                            {step?.title && step?.instruction && ": "}
                            {step?.instruction || ""}
                            {step?.duration != null &&
                              ` (${step.duration} phút)`}
                          </>
                        )}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>Chưa có các bước.</p>
                )}
              </section>
              {actionErrors[String(preview.id)] && (
                <p
                  className="pending-recipes__action-message--error"
                  role="alert"
                >
                  {actionErrors[String(preview.id)]}
                </p>
              )}
              <div className="pending-recipes__dialog-actions">
                <button
                  className="pending-recipes__button pending-recipes__button--reject"
                  type="button"
                  disabled={!!working[String(preview.id)]}
                  onClick={(event) =>
                    openRejection(preview, event.currentTarget)
                  }
                >
                  Từ chối
                </button>
                <button
                  className="pending-recipes__button pending-recipes__button--approve"
                  type="button"
                  disabled={!!working[String(preview.id)]}
                  onClick={approvePreview}
                >
                  {working[String(preview.id)]
                    ? "Đang cập nhật..."
                    : "Chấp nhận"}
                </button>
              </div>
            </>
          )
        )}
      </dialog>
      <dialog
        ref={rejectDialog}
        className="pending-recipes__dialog"
        aria-labelledby="pending-reject-title"
        onCancel={(event) => {
          if (rejectRecipe && working[String(rejectRecipe.id)])
            event.preventDefault();
        }}
        onClose={() => {
          setRejectRecipe(null);
          requestAnimationFrame(() =>
            (rejectTrigger.current?.isConnected
              ? rejectTrigger.current
              : headingRef.current
            )?.focus(),
          );
        }}
      >
        <h2 id="pending-reject-title">Từ chối công thức?</h2>
        <p>Công thức: {rejectRecipe?.title || "Chưa có tên"}</p>
        <p className="pending-recipes__reason-note">
          Lý do hiện chưa được gửi hoặc lưu vì API chưa hỗ trợ.
        </p>
        <fieldset className="pending-recipes__reasons">
          <legend>Lý do từ chối</legend>
          {[
            "Thiếu thông tin",
            "Hình ảnh không phù hợp",
            "Nội dung trùng lặp",
            "Vi phạm quy định",
          ].map((option) => (
            <label key={option}>
              <input
                type="radio"
                name="rejection-reason"
                value={option}
                checked={reason === option}
                onChange={() => setReason(option)}
              />{" "}
              {option}
            </label>
          ))}
        </fieldset>
        <label htmlFor="pending-other-reason">
          Lý do khác (không bắt buộc)
        </label>
        <textarea
          id="pending-other-reason"
          value={otherReason}
          onChange={(event) => setOtherReason(event.target.value)}
          placeholder="Nhập lý do..."
        />
        {rejectRecipe && actionErrors[String(rejectRecipe.id)] && (
          <p className="pending-recipes__action-message--error" role="alert">
            {actionErrors[String(rejectRecipe.id)]}
          </p>
        )}
        <div className="pending-recipes__dialog-actions">
          <button
            className="pending-recipes__button"
            type="button"
            disabled={rejectRecipe && !!working[String(rejectRecipe.id)]}
            onClick={() => rejectDialog.current.close()}
          >
            Hủy
          </button>
          <button
            className="pending-recipes__button pending-recipes__button--reject"
            type="button"
            disabled={!rejectRecipe || !!working[String(rejectRecipe.id)]}
            onClick={confirmRejection}
          >
            {rejectRecipe && working[String(rejectRecipe.id)]
              ? "Đang cập nhật..."
              : "Từ chối"}
          </button>
        </div>
      </dialog>
    </section>
  );
}
