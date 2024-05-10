const express = require("express");
const router = express.Router();
const ChannelModel = require("@/models/chat/Channel");
const RoomModel = require("@/models/chat/Room");
const ChannelMembership = require("@/models/chat/ChannelMembership");
const ResponseResult = require("@/utlis/result");
const upload = require("@/plugins/multer");
// 获取所有频道
router.get("/", async (req, res, next) => {
  try {
    const channels = await ChannelModel.find();
    ResponseResult.success(res, channels, "获取所有频道成功");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 创建新频道
router.post("/", upload.single("avatar"), async (req, res, next) => {
  try {
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    const { name, description, userId } = req.body;
    const newChannel = new ChannelModel({
      name,
      description,
      avatar: imageUrl,
      creator: userId,
    });
    const savedChannel = await newChannel.save();
    const newMembership = new ChannelMembership({
      channelId: savedChannel._id,
      userId: userId,
    });
    await newMembership.save();
    const newRoom = new RoomModel({
      name: "默认房间",
      channelId: savedChannel._id,
    });

    const savedRoom = await newRoom.save();
    ResponseResult.success(
      res,
      { channel: savedChannel, membership: newMembership, room: savedRoom },
      "频道创建成功"
    );
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 根据 ID 获取频道
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const channel = await ChannelModel.findById(id);
    if (!channel) {
      ResponseResult.fail(res, "频道未找到", 404);
      return;
    }
    ResponseResult.success(res, channel, "获取频道成功");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 更改频道
router.patch("/:id", async (req, res, next) => {
  try {
    const { name, description, avatar, creator } = req.body;
    const channel = await ChannelModel.findById(req.params.id);
    if (!channel) {
      ResponseResult.fail(res, "频道未找到", 404);
      return;
    }

    // 更新字段，如果提供了新值则更新
    channel.name = name || channel.name;
    channel.description = description || channel.description;
    channel.avatar = avatar || channel.avatar;
    channel.creator = creator || channel.creator;
    const updatedChannel = await channel.save();
    ResponseResult.success(res, updatedChannel, "频道信息更新成功");
  } catch (err) {
    console.error(err);
    next(err);
  }
});
// 删除频道
router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const channel = await ChannelModel.findById(id);
    if (!channel) {
      ResponseResult.fail(res, "频道未找到,不能删除", 404);
      return;
    }
    await ChannelMembership.deleteMany({ channelId: id });
    // 删除该频道下的所有房间
    await RoomModel.deleteMany({ channel: id });

    // 删除频道本身
    await ChannelModel.findByIdAndDelete(id);

    ResponseResult.success(
      res,
      null,
      "频道、相关房间和和所有相关成员关系删除成功"
    );
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
