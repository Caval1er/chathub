const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ChannelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    /*
    存储头像的注意事项
    1.验证 URL：虽然在模型定义中我们没有加入 URL 的验证，但在实际应用中，为了确保存储的 URL 是有效的，您可以在应用逻辑中添加一些基本的格式验证。
    2.图片存储与托管：您可以使用外部服务如 Amazon S3 或其他 CDN 服务来存储实际的图片文件，并在数据库中仅保存一个指向这些文件的 URL。这种方法有助于分离静态文件存储和应用数据存储，同时可以提高图片加载的效率。
    3.动态更新：在您的应用中，您可能需要提供一个接口让用户能够上传或更新频道的头像。这通常涉及到文件上传的处理，可能需要额外的中间件，如 multer 用于处理 express 中的文件上传。
    4.安全性：存储外部链接时，特别是在开放给用户上传的场景下，确保您的系统对上传的内容进行了适当的安全检查，防止恶意文件上传或服务滥用。
     */
    avatar: {
      type: String,
      required: true, //
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
); // 开启自动时间戳
module.exports = mongoose.model("Channel", ChannelSchema);
