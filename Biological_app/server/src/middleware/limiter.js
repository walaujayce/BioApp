const RateLimiter = require('limiter').RateLimiter

const limiter = new RateLimiter({
	tokensPerInterval: 5,
	interval: "second",
	fireImmediately: true
  });

module.exports = async function(req, res, next) {
	// const remainingRequests = await limiter.removeTokens(1);
	// if (remainingRequests < 0) {
	// 	res.status(429).json({
	// 		"status": "error",
	// 		"code": 429,
	// 		"message": "Too Many Requests - you are being rate limited"
	// 	})
	// 	return;
	// } else {
		next();
	// }
};
