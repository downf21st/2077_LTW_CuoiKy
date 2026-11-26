import { useId, useRef, useState } from "react";
import StarRatingInput from "../StarRating/StarRatingInput";
import { validateReview } from "../../utils/validateReview";
import "./ReviewForm.css";

export default function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const pendingRef = useRef(false);
  const commentId = useId();
  const countId = useId();
  const commentErrorId = useId();

  async function handleSubmit(event) {
    event.preventDefault();
    if (pendingRef.current) return;
    const nextErrors = validateReview({ rating, comment });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length !== 0) return;
    pendingRef.current = true;
    setPending(true);
    setSubmitError("");
    setSubmitted(false);
    try {
      await onSubmit({ rating, comment });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error?.message || "Không thể gửi đánh giá. Vui lòng thử lại.",
      );
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit} noValidate>
      <div className="review-form__field">
        <span>Điểm của bạn *</span>
        <StarRatingInput
          value={rating}
          onChange={(value) => {
            setRating(value);
            setErrors((previous) => ({ ...previous, rating: undefined }));
          }}
        />
        {errors.rating && (
          <p className="review-form__error" role="alert">
            {errors.rating}
          </p>
        )}
      </div>
      <div className="review-form__field">
        <label htmlFor={commentId}>Bình luận của bạn</label>
        <textarea
          id={commentId}
          value={comment}
          onChange={(event) => {
            setComment(event.target.value);
            setErrors((previous) => ({ ...previous, comment: undefined }));
          }}
          aria-invalid={Boolean(errors.comment)}
          aria-describedby={`${countId}${errors.comment ? ` ${commentErrorId}` : ""}`}
        />
        <span id={countId} className="review-form__count">
          {comment.length} / 500 ký tự
        </span>
        {errors.comment && (
          <p id={commentErrorId} className="review-form__error" role="alert">
            {errors.comment}
          </p>
        )}
      </div>
      {submitError && (
        <p className="review-form__error" role="alert">
          {submitError}
        </p>
      )}
      {submitted && <p role="status">Đã gửi đánh giá.</p>}
      <button className="review-form__submit" type="submit" disabled={pending}>
        {pending ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
}
