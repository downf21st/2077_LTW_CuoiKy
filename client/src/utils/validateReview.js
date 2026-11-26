export function validateReview({ rating, comment = "" } = {}) {
  const errors = {};
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = "Vui lòng chọn từ 1 đến 5 sao.";
  }
  if (comment.length > 500) errors.comment = "Bình luận tối đa 500 ký tự.";
  return errors;
}
