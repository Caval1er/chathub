const express = require("express");
const router = express.Router();
const Message = require("@/models/chat/Message");
const ResponseResult = require("@/utlis/result"); // 确保路径正确

// 创建消息的 API
router.post("/", async (req, res, next) => {
  try {
    const { sender, room, type, text, code, imageUrl } = req.body;

    // 验证必要的字段
    if (!sender || !room || !type) {
      return ResponseResult.fail(
        res,
        "Missing required fields: sender, room, or type",
        400
      );
    }

    // 验证消息类型
    if (!["text", "code", "image"].includes(type)) {
      return ResponseResult.fail(res, "Invalid message type", 400);
    }

    // 创建新的消息对象
    let newMessage;
    switch (type) {
      case "text":
        if (!text)
          return ResponseResult.fail(res, "Text content is required", 400);
        newMessage = new Message({ sender, room, type, text });
        break;
      case "code":
        if (!code || !code.content)
          return ResponseResult.fail(res, "Code content is required", 400);
        newMessage = new Message({ sender, room, type, code });
        break;
      case "image":
        if (!imageUrl)
          return ResponseResult.fail(res, "Image URL is required", 400);
        newMessage = new Message({ sender, room, type, imageUrl });
        break;
      default:
        return ResponseResult.fail(res, "Unknown message type", 400);
    }

    // 保存消息
    const savedMessage = await newMessage.save();
    return ResponseResult.success(res, savedMessage, "消息创建成功");
  } catch (error) {
    console.error("Error creating message:", error);
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { room, before, limit = 20 } = req.query;
    console.log("b", before);
    // 验证必要的字段
    if (!room) {
      return ResponseResult.fail(res, "Missing required field: room", 400);
    }

    // 设置查询条件
    const query = { room };
    if (before) {
      query.createdAt = { $lt: new Date(before) }; // 使用 `createdAt` 进行分页
    }

    // 查询消息并按时间正序排序
    const messages = await Message.find(query)
      .populate({ path: "sender", select: "nickname avatar" })
      .sort({ createdAt: -1 }) // 按时间正序排列
      .limit(Number(limit)); // 限制返回条数

    // 将结果按时间正序返回给客户端
    return ResponseResult.success(res, messages.reverse(), "消息列表返回成功");
  } catch (error) {
    console.error("Error fetching messages:", error);
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const messageId = req.params.id;

    // 查询特定 id 的消息
    const message = await Message.findById(messageId).populate({
      path: "sender",
      select: "nickname avatar",
    });

    if (!message) {
      return ResponseResult.fail(res, "Message not found", 404);
    }

    // 返回特定 id 的消息
    return ResponseResult.success(res, message, "Message found");
  } catch (error) {
    console.error("Error fetching message:", error);
    next(error);
  }
});

module.exports = router;
