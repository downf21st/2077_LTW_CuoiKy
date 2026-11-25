const { getReviewStats } = require('./reviewStats');

const calcRatingStats = (reviews) => getReviewStats(reviews);

module.exports = { calcRatingStats };
