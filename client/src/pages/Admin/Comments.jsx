import { useEffect, useState } from "react";
import { getAdminReviews } from "../../api";
import StarRating from "../../components/StarRating/StarRating";
import "./Comments.css";

const FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "visible", label: "Đang hiện" },
  { value: "hidden", label: "Đã ẩn" },
];

export default function Comments() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState("all");
  const [limit, setLimit] = useState(5);
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
  const filtered = items.filter(
    (review) =>
      filter === "all" ||
      (filter === "hidden" ? review.hidden : !review.hidden),
  );
  const ready = status !== "loading" && status !== "error";

  function changeFilter(value) {
    setFilter(value);
    setLimit(5);
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
      <p className="admin-comments__notice">
        Chức năng ẩn và bỏ ẩn bình luận chưa được kết nối.
      </p>
      <div className="admin-comments__filters" aria-label="Lọc bình luận">
        {FILTERS.map(({ value, label }) => (
          <button
            className="admin-comments__filter"
            type="button"
            key={value}
            aria-pressed={filter === value}
            onClick={() => changeFilter(value)}
          >
            {label}
            {ready && (
              <span className="admin-comments__count">{counts[value]}</span>
            )}
          </button>
        ))}
      </div>
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
          {items.length
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
                    disabled
                    aria-label={`${review.hidden ? "Bỏ ẩn" : "Ẩn"} bình luận của ${review.userName || "Người dùng"} về ${review.recipeTitle || "công thức"}`}
                  >
                    {review.hidden ? "Bỏ ẩn" : "Ẩn"}
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
    </main>
  );
}
