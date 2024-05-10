const express = require("express");
const router = express.Router();
const RoomModel = require("@/models/chat/Room");
const bcrypt = require("bcrypt");
const ResponseResult = require("@/utlis/result");

// 获取所有房间
router.get("/", async (req, res, next) => {
  try {
    const rooms = await RoomModel.find()
      .select("-password")
      .populate("channel");
    ResponseResult.success(res, rooms, "获取所有房间成功");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 创建新房间
router.post("/", async (req, res, next) => {
  try {
    const { name, channelId, password } = req.body; // 注意: 改为从 body 获取数据
    const newRoom = new RoomModel({
      name,
      channelId,
      password,
    });

    const savedRoom = await newRoom.save();
    ResponseResult.success(
      res,
      {
        id: savedRoom.id,
        name: savedRoom.name,
        channelId: savedRoom.channelId,
      },
      "创建新房间成功"
    );
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 根据 房间ID 获取房间
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const room = await RoomModel.findById(id)
      .select("-password")
      .populate("channelId");
    if (!room) {
      ResponseResult.fail(res, "房间未找到", 404);
      return;
    }
    ResponseResult.success(res, room, "获取房间成功");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//根据频道Id获取房间列表
router.get("/channel/:channelId", async (req, res, next) => {
  try {
    const id = req.params.channelId;
    const room = await RoomModel.find({ channelId: id }).select(
      "-password -channelId"
    );
    if (!room || room.length === 0) {
      ResponseResult.fail(res, "房间未找到", 404);
      return;
    }
    ResponseResult.success(res, room, "获取房间成功");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 更新房间信息
router.patch("/:id", async (req, res, next) => {
  try {
    const { name, channel, password } = req.body;
    const room = await RoomModel.findById(req.params.id);
    if (!room) {
      ResponseResult.fail(res, "房间未找到", 404);
      return;
    }

    room.name = name || room.name;
    room.channel = channel || room.channel;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      room.password = await bcrypt.hash(password, salt);
    }

    const updatedRoom = await room.save();
    ResponseResult.success(
      res,
      {
        id: updatedRoom.id,
        name: updatedRoom.name,
        channel: updatedRoom.channel,
      },
      "更新房间信息成功"
    );
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 删除房间
router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const removedRoom = await RoomModel.findByIdAndDelete(id);
    if (!removedRoom) {
      ResponseResult.fail(res, "房间未找到，不能删除", 404);
      return;
    }
    ResponseResult.success(res, null, "删除房间成功");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
