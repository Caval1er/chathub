const rateLimit = require("express-rate-limit");

const otpKeyGenerator = (req) => {
  return req.query.email ? req.query.email : req.ip;
};
const keyGenerator = (req) => {
  return req.user ? req.user.userId : req.ip;
};
const otpLimiter = rateLimit({
  windowMs: process.env.OPT_EXPIRE * 1000, // 一分钟
  limit: 2, // 每个用户在窗口期内最多能发出两个个请求
  keyGenerator: otpKeyGenerator,
  message: {
    code: 429,
    msg: "短时间请求过多",
    data: null,
  },
  handler: function (req, res, next, options) {
    res.status(options.statusCode).json(options.message);
  },
  //   message: "请求过于频繁，请稍后再试",
});

const limiter = rateLimit({
  windowMs: 60 * 1000, // 一分钟
  limit: 1,
  keyGenerator,
  message: {
    code: 429,
    msg: "短时间请求过多",
    data: null,
  },
  handler: function (req, res, next, options) {
    res.status(options.statusCode).json("a");
  },
});

module.exports = { otpLimiter, limiter };
