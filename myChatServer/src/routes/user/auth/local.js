const express = require("express");
const router = express.Router();
const ResponseResult = require("@/utlis/result");
const User = require("@/models/auth/User");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;
const JWT_ISSUER = process.env.JWT_ISSUER;
//根据email获取用户的信息
router.get("/email/:email", async (req, res, next) => {
  const email = req.params.email;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      ResponseResult.sendResponse(res, 400, "未找到用户信息");
      return;
    }
    ResponseResult.sendResponse(res, 200, "获取用户信息成功", user);
  } catch (error) {
    next(error);
  }
});

//本地登录
router.post(
  "/sessions",
  passport.authenticate("local", { session: false, failWithError: true }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const token = jwt.sign(
        { userId: user.id, username: user.nickname, issuer: JWT_ISSUER },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRE,
        }
      );
      ResponseResult.success(res, { token }, "登录成功");
    } catch (error) {
      console.error("error-user:", error);
      next(error);
    }
  }
);

//注册
router.post("/", async (req, res, next) => {
  try {
    const { email, password, avatar, bio } = req.body;
    const nickname = req.body.nickname || email;
    const newUser = new User({ email, nickname, avatar, bio });
    await User.register(newUser, password);
    ResponseResult.success(res, null, "注册成功");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 获取特定用户信息(通过id)
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        ResponseResult.fail(res, "找不到用户", 404);
        return;
      }
      ResponseResult.success(
        res,
        {
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          bio: user.bio,
        },
        "用户信息获取成功"
      );
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// 获取特定用户信息(通过token)
router.get(
  "/info/token",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        ResponseResult.fail(res, "找不到用户", 404);
        return;
      }
      ResponseResult.success(
        res,
        {
          id: user._id,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          bio: user.bio,
        },
        "用户信息获取成功"
      );
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);
//修改用户信息
router.patch("/:id", async (req, res, next) => {
  try {
    const { email, password, nickname, avatar, bio, isOnline } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      ResponseResult.fail(res, "用户未找到", 404);
      return;
    }
    user.email = email || user.email;
    user.password = password || user.password;
    user.nickname = nickname || user.nickname;
    user.avatar = avatar || user.avatar;
    user.bio = bio || user.bio;
    user.isOnline = isOnline || user.isOnline;
    const updateUser = await user.save();
    ResponseResult.success(res, updateUser, "用户信息更新成功");
  } catch (error) {
    console.error(err);
    next(err);
  }
});
module.exports = router;
