const calcRatingStats = (reviews) => {
  const list = Array.isArray(reviews) ? reviews : [];
  const reviewCount = list.length;
  if (reviewCount === 0) return { averageRating: 0, reviewCount: 0 };

  const total = list.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
  return {
    averageRating: Math.round((total / reviewCount) * 10) / 10,
    reviewCount,
  };
};

module.exports = { calcRatingStats };