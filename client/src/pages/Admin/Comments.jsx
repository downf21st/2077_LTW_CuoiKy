import { useEffect, useRef, useState } from "react";
import { getAdminReviews, setReviewHidden } from "../../api";
import StarRating from "../../components/StarRating/StarRating";
import "./Comments.css";

const FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "visible", label: "Đang hiện" },
  { value: "hidden", label: "Đã ẩn" },
];

const reviewKey = (review) =>
  JSON.stringify([String(review.recipeId), String(review.id)]);

export default function Comments() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(5);
  const [selected, setSelected] = useState(null);
  const [working, setWorking] = useState({});
  const [actionErrors, setActionErrors] = useState({});
  const dialogRef = useRef(null);
  const inFlight = useRef(new Set());

  useEffect(() => {
    if (selected && !dialogRef.current.open) dialogRef.current.showModal();
  }, [selected]);
  useEffect(() => {
    let active = true;
    async function loadReviews() {
      setStatus("loading");
      try {
        const result = await getAdminReviews();
        if (!Array.isArray(result))
          throw new Error("Dữ liệu đánh giá không hợp lệ.");
        if (active) {
          setReviews(
            result.filter(
              (review) =>
                typeof review?.comment === "string" && review.comment.trim(),
            ),
          );
          setStatus("ready");
        }
      } catch {
        if (active) setStatus("error");
      }
    }
    loadReviews();
    return () => {
      active = false;
    };
  }, [attempt]);

  const items = reviews;
  const visible = items.filter((review) => !review.hidden).length;
  const counts = { all: items.length, visible, hidden: items.length - visible };
  const query = search.trim().toLocaleLowerCase("vi-VN");
  const filtered = items.filter((review) => {
    const matchesStatus =
      filter === "all" ||
      (filter === "hidden" ? review.hidden : !review.hidden);
    const matchesSearch =
      !query ||
      [review.recipeTitle, review.comment].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase("vi-VN")
          .includes(query),
      );
    return matchesStatus && matchesSearch;
  });
  const ready = status !== "loading" && status !== "error";

  function changeFilter(value) {
    setFilter(value);
    setLimit(5);
  }

  async function updateVisibility(review, hidden) {
    const key = reviewKey(review);
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);
    setWorking((current) => ({ ...current, [key]: true }));
    setActionErrors((current) => ({ ...current, [key]: "" }));
    try {
      const result = await setReviewHidden(review.recipeId, review.id, hidden);
      if (typeof result?.hidden !== "boolean")
        throw new Error("Phản hồi không hợp lệ.");
      setReviews((current) =>
        current.map((item) =>
          reviewKey(item) === key ? { ...item, hidden: result.hidden } : item,
        ),
      );
    } catch {
      setActionErrors((current) => ({
        ...current,
        [key]: "Không thể cập nhật bình luận. Vui lòng thử lại.",
      }));
    } finally {
      inFlight.current.delete(key);
      setWorking((current) => ({ ...current, [key]: false }));
    }
  }

  return (
    <main className="admin-comments">
      <p className="admin-comments__breadcrumb">
        Trang chủ / Bảng điều khiển Admin / Quản lý bình luận
      </p>
      <h1 className="admin-comments__title">Quản lý bình luận</h1>
      <p className="admin-comments__description">
        Theo dõi đánh giá gần đây, ẩn hoặc khôi phục bình luận vi phạm. Điểm sao
        trung bình vẫn được giữ khi ẩn bình luận.
      </p>
      <div className="admin-comments__filters" aria-label="Lọc bình luận">
        {FILTERS.map(({ value, label }) => (
          <button
            className="admin-comments__filter"
            type="button"
            key={value}
            aria-pressed={filter === value}
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={() => changeFilter(value)}
          >
            {label}
            {ready && (
              <span className="admin-comments__count">{counts[value]}</span>
            )}
          </button>
        ))}
      </div>
      <input
        className="admin-comments__search"
        type="search"
        aria-label="Tìm theo tên món hoặc nội dung bình luận"
        placeholder="Tìm theo tên món hoặc nội dung bình luận"
        value={search}
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
        onChange={(event) => {
          setSearch(event.target.value);
          setLimit(5);
        }}
      />
      {status === "loading" ? (
        <div className="admin-comments__state" role="status">
          Đang tải bình luận...
        </div>
      ) : status === "error" ? (
        <div className="admin-comments__state" role="alert">
          <p>Không tải được bình luận.</p>
          <button
            className="admin-comments__button"
            type="button"
            onClick={() => setAttempt((current) => current + 1)}
          >
            Thử lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-comments__state" role="status">
          {query && items.length
            ? "Không tìm thấy bình luận phù hợp."
            : items.length
              ? "Không có bình luận ở trạng thái này."
              : "Chưa có bình luận nào."}
        </div>
      ) : (
        <>
          <ul className="admin-comments__list">
            {filtered.slice(0, limit).map((review) => (
              <li
                className="admin-comments__row"
                key={`${review.recipeId}-${review.id}`}
              >
                <div className="admin-comments__row-content">
                  <h2 className="admin-comments__recipe">
                    {review.recipeTitle || "Công thức không xác định"}
                  </h2>
                  <p className="admin-comments__author">
                    {review.userName || "Người dùng"}
                  </p>
                  <StarRating value={Number(review.rating)} size="sm" />
                  <p className="admin-comments__comment">{review.comment}</p>
                  {actionErrors[reviewKey(review)] && (
                    <p className="admin-comments__error" role="alert">
                      {actionErrors[reviewKey(review)]}
                    </p>
                  )}
                </div>
                <div className="admin-comments__row-actions">
                  <span
                    className={`admin-comments__badge${review.hidden ? " admin-comments__badge--hidden" : ""}`}
                  >
                    {review.hidden ? "Đã ẩn" : "Đang hiện"}
                  </span>
                  <button
                    className="admin-comments__button"
                    type="button"
                    disabled={Boolean(working[reviewKey(review)])}
                    onClick={() => {
                      if (review.hidden) updateVisibility(review, false);
                      else setSelected(review);
                    }}
                    aria-label={`${review.hidden ? "Bỏ ẩn" : "Ẩn"} bình luận của ${review.userName || "Người dùng"} về ${review.recipeTitle || "công thức"}`}
                  >
                    {working[reviewKey(review)]
                      ? "Đang xử lý..."
                      : review.hidden
                        ? "Bỏ ẩn"
                        : "Ẩn"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="admin-comments__footer">
            <p>Hiển thị tối đa 5 bình luận mỗi lượt.</p>
            {limit < filtered.length && (
              <button
                className="admin-comments__more"
                type="button"
                onClick={() => setLimit((current) => current + 5)}
              >
                Hiển thị thêm bình luận
              </button>
            )}
          </div>
        </>
      )}
      <dialog
        ref={dialogRef}
        className="admin-comments__dialog"
        aria-labelledby="admin-comments-dialog-title"
        aria-describedby="admin-comments-dialog-description"
        onClose={() => setSelected(null)}
      >
        <h2 id="admin-comments-dialog-title">Ẩn bình luận</h2>
        <p id="admin-comments-dialog-description">
          Nội dung sẽ bị ẩn với người đọc; điểm sao vẫn được tính.
        </p>
        <div className="admin-comments__dialog-actions">
          <button
            type="button"
            className="admin-comments__more"
            autoFocus
            onClick={() => dialogRef.current.close()}
          >
            Hủy
          </button>
          <button
            type="button"
            className="admin-comments__button"
            onClick={() => {
              const review = selected;
              dialogRef.current.close();
              if (review) updateVisibility(review, true);
            }}
          >
            Ẩn bình luận
          </button>
        </div>
      </dialog>
    </main>
  );
}
