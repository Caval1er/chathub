const express = require("express");
const router = express.Router();
const userRouter = require("./user/auth/local");
const authRouter = require("./user/auth/auth");
const channelRouter = require("./user/chat/channel");
const roomRouter = require("./user/chat/room");
const ChannelMembershipRouter = require("./user/chat/channel-membership");
const messageRouter = require("./user/chat/message");
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/channels", channelRouter);
router.use("/rooms", roomRouter);
router.use("/channel-memberships", ChannelMembershipRouter);
router.use("/messages", messageRouter);
module.exports = router;