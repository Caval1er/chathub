require("module-alias/register");
require("dotenv").config({ debug: true });
const createError = require("http-errors");
const express = require("express");
const db = require("@/utlis/db");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const passport = require("@/utlis/passport");
const indexRouter = require("@/routes/index");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());
app.use(passport.initialize());
app.use("/api", indexRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.error("err:", err); // 打印错误到控制台
  res.status(err.status || 500).json({
    // 返回错误状态码并返回 JSON 格式的错误信息
    error: { message: err.message || "Internal Server Error" },
    stack: req.app.get("env") === "development" ? err.stack : undefined, // 在开发环境下返回错误堆栈信息
  });
});

module.exports = app;
