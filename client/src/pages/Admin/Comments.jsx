import { useState } from "react";
import StarRating from "../../components/StarRating/StarRating";
import "./Comments.css";

const EXAMPLE_REVIEWS = [
  {
    id: 1,
    recipe: "Phở bò truyền thống",
    author: "Minh Anh",
    rating: 5,
    comment: "Công thức rất dễ làm, nước dùng thơm và đậm đà.",
    hidden: false,
  },
  {
    id: 2,
    recipe: "Gà kho gừng",
    author: "Hoàng Nam",
    rating: 4,
    comment: "Món ăn hợp khẩu vị cả gia đình mình.",
    hidden: false,
  },
  {
    id: 3,
    recipe: "Canh chua cá",
    author: "Thảo Linh",
    rating: 3,
    comment: "Mình đã thử và điều chỉnh gia vị một chút.",
    hidden: true,
  },
  {
    id: 4,
    recipe: "Bún thịt nướng",
    author: "Ngọc Mai",
    rating: 5,
    comment: "Hướng dẫn chi tiết, thành phẩm rất ngon!",
    hidden: false,
  },
  {
    id: 5,
    recipe: "Cơm chiên trứng",
    author: "Hải Đăng",
    rating: 4,
    comment: "Một món nhanh gọn cho bữa sáng.",
    hidden: false,
  },
  {
    id: 6,
    recipe: "Salad rau củ",
    author: "Khánh An",
    rating: 2,
    comment: "Mình muốn phần hướng dẫn rõ hơn.",
    hidden: true,
  },
];
const FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "visible", label: "Đang hiện" },
  { value: "hidden", label: "Đã ẩn" },
];

export default function Comments({
  reviews = EXAMPLE_REVIEWS,
  status = "preview",
  onToggle,
  onRetry,
}) {
  const [filter, setFilter] = useState("all");
  const [limit, setLimit] = useState(5);
  const items = Array.isArray(reviews) ? reviews : [];
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
      {status === "preview" && (
        <p className="admin-comments__notice">
          Dữ liệu minh họa. Chức năng ẩn và bỏ ẩn bình luận chưa được kết nối.
        </p>
      )}
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
            onClick={onRetry}
            disabled={!onRetry}
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
              <li className="admin-comments__row" key={review.id}>
                <div className="admin-comments__row-content">
                  <h2 className="admin-comments__recipe">{review.recipe}</h2>
                  <p className="admin-comments__author">{review.author}</p>
                  <StarRating value={Number(review.rating)} size="sm" />
                  <p className="admin-comments__comment">
                    {review.comment || "Không có nội dung bình luận."}
                  </p>
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
                    disabled={status === "preview" || !onToggle}
                    onClick={() => onToggle(review)}
                    aria-label={`${review.hidden ? "Bỏ ẩn" : "Ẩn"} bình luận của ${review.author} về ${review.recipe}`}
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
