const getReviewStats = (reviews) => {
  const ratings = Array.isArray(reviews)
    ? reviews.map((review) => Number(review?.rating))
      .filter((rating) => Number.isFinite(rating) && rating >= 1 && rating <= 5)
    : [];

  return {
    averageRating: ratings.length
      ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
      : 0,
    reviewCount: ratings.length
  };
};

const withReviewStats = (recipe, includeReviews = false) => {
  const { reviews, ...recipeData } = recipe;
  return {
    ...recipeData,
    ...getReviewStats(reviews),
    ...(includeReviews ? {
      reviews: Array.isArray(reviews)
        ? reviews.map((review) => (
            review?.hidden ? { ...review, comment: '' } : review
          ))
        : []
    } : {})
  };
};

module.exports = { getReviewStats, withReviewStats };
