const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("@/models/auth/User");
const ResponseResult = require("@/utlis/result");
const { sendToEmail } = require("@/utlis/email");
const Cache = require("@/utlis/cache");
const { otpLimiter, limiter } = require("@/utlis/rate-limit");
const cache = new Cache();
router.get("/", async (req, res) => {
  res.json("aa");
});
//github验证登录
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failWithError: true }),
  async (req, res, next) => {
    try {
      res.redirect(`http://localhost:5173/thirdLogin?token=${req.user}`);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//关联账号(注册阶段)
router.post("/session", async (req, res, next) => {
  const { email, password, profile, linkWay } = req.query;
  try {
    const user = new User({
      email,
      profile,
    });
    const newUser = await User.register(user, password);

    ResponseResult.success(
      res,
      {
        token: newUser.id,
      },
      `注册成功，并关联${linkWay}`
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//关联账号(现已账号链接)

//发送验证码
router.get("/otp", otpLimiter, async (req, res, next) => {
  const { email } = req.query;
  cache.remove(email);
  try {
    await sendToEmail(email, cache);
    ResponseResult.success(res, null, "发送验证码成功");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//验证验证码
router.post("/otp", async (req, res, next) => {
  const { email, otp } = req.query;
  if (!cache.get(email) || cache.get(email) !== otp) {
    ResponseResult.fail(res, "验证码不正确", 400);
    return;
  }
  ResponseResult.success(res, null, "验证通过");
});

//验证email是否存在
router.get("/email/:email", async (req, res, next) => {
  const email = req.params.email;
  try {
    const user = await User.findOne({ email });
    if (user) {
      ResponseResult.success(res, null, "邮箱存在");
      return;
    }
    ResponseResult.fail(res, "邮箱不存在", 404);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
