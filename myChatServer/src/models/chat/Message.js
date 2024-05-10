const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 定义消息类型常量
const MessageType = {
  TEXT: "text",
  CODE: "code",
  IMAGE: "image",
};

// 定义消息模型
const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User", // 引用用户模型
      required: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room", // 引用房间模型
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    code: {
      content: { type: String, default: "" },
      language: { type: String, default: "" },
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// 定义消息模型的消息类型常量
messageSchema.statics.MessageType = MessageType;

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
