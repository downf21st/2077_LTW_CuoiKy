import StarRating from "../StarRating/StarRating";
import "./ReviewList.css";

export default function ReviewList({
  reviews = [],
  averageRating,
  reviewCount = reviews.length,
}) {
  return (
    <section className="review-list" aria-label="Danh sách đánh giá">
      {reviewCount > 0 && averageRating != null && (
        <StarRating value={averageRating} count={reviewCount} />
      )}
      {reviews.length === 0 ? (
        <p className="review-list__empty">
          Chưa có đánh giá. Hãy là người đầu tiên chia sẻ cảm nhận!
        </p>
      ) : (
        <ul className="review-list__items">
          {reviews.map((review, index) => {
            const date = review.createdAt ? new Date(review.createdAt) : null;
            const validDate = date && !Number.isNaN(date.getTime());
            const comment = review.comment ?? review.text ?? "";
            return (
              <li className="review-list__item" key={review.id ?? index}>
                <article className="review-list__review">
                  <div className="review-list__header">
                    <strong>
                      {review.userName || review.name || "Người dùng"}
                    </strong>
                    {validDate && (
                      <time dateTime={date.toISOString()}>
                        {date.toLocaleDateString("vi-VN")}
                      </time>
                    )}
                  </div>
                  {review.rating != null && (
                    <StarRating value={review.rating} size="sm" />
                  )}
                  {review.hidden ? (
                    <p>Bình luận đã bị ẩn</p>
                  ) : (
                    comment && <p>{comment}</p>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
