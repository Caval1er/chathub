const express = require("express");
const router = express.Router();
const ChannelMembership = require("@/models/chat/ChannelMembership");
const ResponseResult = require("@/utlis/result");
const RoomModel = require("@/models/chat/Room");
// 添加用户到频道
router.post("/", async (req, res, next) => {
  try {
    const { channelId, userId } = req.body;
    // 检查是否已存在相同的成员关系
    const existingMembership = await ChannelMembership.findOne({
      channelId,
      userId,
    });
    if (existingMembership) {
      return ResponseResult.fail(res, "用户已经在该频道中", 409);
    }

    const newMembership = new ChannelMembership({
      channelId,
      userId,
    });

    const savedMembership = await newMembership.save();
    ResponseResult.success(res, savedMembership, "成功添加用户到频道");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 获取指定频道的所有成员
router.get("/channel/:channelId", async (req, res, next) => {
  try {
    const members = await ChannelMembership.find({
      channelId: req.params.channelId,
    }).populate("userId", "nickname email avatar bio isOnline");
    // 假设我们想返回用户名和邮箱/ 也返回频道名
    const user = members.map((value) => value.userId);
    ResponseResult.success(res, user, "获取频道成员成功");
  } catch (err) {
    console.error(err);
    ResponseResult.fail(res, "获取频道成员失败", 500);
    next(err);
  }
});

// 获取特定用户的所有频道信息
router.get("/member/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const memberships = await ChannelMembership.find({
      userId: userId,
    }).populate({
      path: "channelId",
      select: "name description avatar creator", // 选择返回频道的名称和描述
    });

    if (!memberships || memberships.length === 0) {
      return ResponseResult.fail(res, "该用户没有加入任何频道", 404);
    }

    const channels = await Promise.all(
      memberships.map(async (membership) => {
        const channel = membership.channelId;
        if (channel) {
          console.log(channel);
          const rooms = await RoomModel.find({ channelId: channel._id }).select(
            "-password -channelId"
          );

          return {
            channel: membership.channelId,
            rooms,
          };
        }
        return null; // 确保 `map` 的每一项都有返回值
      })
    );

    // 过滤掉返回值中的 null
    const filteredChannels = channels.filter((c) => c !== null);

    return ResponseResult.success(res, filteredChannels);
  } catch (err) {
    console.error(err);
    ResponseResult.fail(res, "获取用户频道信息失败", 500);
    next(err);
  }
});

// 从频道中移除特定用户
router.delete("/channel/:channelId/user/:userId", async (req, res, next) => {
  try {
    const { channelId, userId } = req.params;
    const membership = await ChannelMembership.findOneAndDelete({
      channelId,
      userId,
    });
    if (!membership) {
      return ResponseResult.fail(
        res,
        "未找到对应的频道成员关系，无法删除",
        404
      );
    }
    ResponseResult.success(res, null, "频道成员已成功移除");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
