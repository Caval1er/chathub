const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const User = require("@/models/auth/User");
const Message = require("@/models/chat/Message");
function useSocketIo(server) {
  const users = new Map();
  const channels = new Map();
  const rooms = new Map();
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });
  //jwt 认证
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.query.token;
      if (token) {
        const decode = await jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decode.userId);
        if (!user) {
          socket.emit("error", { message: "用户不存在" });
          return;
        }
        user.isOnline = true;
        await user.save();
        next();
      } else {
        socket.disconnect();
        return;
      }
    } catch (error) {
      return next(new Error("Authentication error"));
    }
  });
  io.on("connection", async (socket) => {
    socket.on("join-channel", async ({ userId, channelId }, cb) => {
      try {
        console.log("User joining:", userId, "to channel:", channelId);
        socket.join(channelId);

        if (!channels.has(channelId)) {
          channels.set(channelId, new Set());
        }

        const user = await User.findById(userId);
        if (!user) {
          socket.emit("error", { message: "用户不存在" });
          return;
        }

        // 使用用户ID加入频道
        channels.get(channelId).add(user._id);

        if (!users.has(user._id)) {
          users.set(user._id, {
            sockets: new Set(),
            channels: new Set(),
            rooms: new Set(),
          });
        }
        users.get(user._id).sockets.add(socket.id);
        users.get(user._id).channels.add(channelId);

        await updateChannelUsers(userId, channelId, true);
        cb({ status: "ok" });
      } catch (error) {
        console.error("Error on join-channel:", error);
        cb({ status: "error", message: error.message });
      }
    });
    socket.on("leave-channel", async ({ userId, channelId }, cb) => {
      if (users.has(userId)) {
        users.get(userId).channels.delete(channelId);

        channels.get(channelId).delete(userId);

        await updateChannelUsers(userId, channelId, false);
        socket.leave(channelId);
        cb({ status: "ok" });
      } else {
        cb({ status: "error", message: "用户未加入频道" });
      }
    });
    socket.on("join-room", async ({ userId, roomId }, cb) => {
      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }

      rooms.get(roomId).add(userId);
      if (users.get(userId)) {
        users.get(userId).rooms.add(roomId);
      }

      await updateRoomUsers(roomId);
      cb({ status: "ok" });
    });

    socket.on("leave-room", async ({ userId, roomId }, cb) => {
      if (rooms.get(roomId)) rooms.get(roomId).delete(userId);
      if (users.get(userId)) users.get(userId).rooms.delete(roomId);
      await updateRoomUsers(roomId);
      socket.leave(roomId);
      cb({ status: "leave room ok" });
    });
    socket.on(
      "send-message",
      async ({ sender, room, type, text, code, imageUrl }, cb) => {
        try {
          // 验证必要的字段
          if (!sender || !room || !type) {
            return cb({ status: "error", message: "缺少必要字段" });
          }
          if (!["text", "code", "image"].includes(type)) {
            return cb({ status: "error", message: "不合法的消息类型" });
          }
          let newMessage;
          switch (type) {
            case "text":
              if (!text)
                return cb({ status: "error", message: "文本不能为空" });
              newMessage = new Message({ sender, room, type, text });
              break;
            case "code":
              if (!code || !code.content)
                return cb({ status: "error", message: "代码不能为空" });
              newMessage = new Message({ sender, room, type, code });
              break;
            case "image":
              if (!imageUrl)
                return cb({ status: "error", message: "图片必须提供链接" });
              newMessage = new Message({ sender, room, type, imageUrl });
              break;
            default:
              return cb({ status: "error", message: "未知的文本类型" });
          }
          // 创建新的消息对象，根据需求可以调整模型

          // 保存消息
          const savedMessage = await newMessage.save();
          // 广播新消息给房间内的所有用户
          const resultMessage = await savedMessage.populate({
            path: "sender",
            select: "avatar nickname",
          });
          io.to(room).emit("new-message", {
            room,
            message: resultMessage,
          });

          // 回调成功
          cb({ status: "ok", message: resultMessage });
        } catch (error) {
          console.error("Error sending message:", error);
          cb({ status: "error", message: error.message });
        }
      }
    );
    socket.on("edit-code", () => {});
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);
      try {
        // 需要遍历用户来找到对应的socket.id
        users.forEach(async (data, userId) => {
          if (data.sockets.has(socket.id)) {
            data.sockets.delete(socket.id);
            if (data.sockets.size === 0) {
              await User.findByIdAndUpdate(userId, { isOnline: false });
              data.channels.forEach(async (channelId) => {
                channels.get(channelId).delete(userId);

                await updateChannelUsers(userId, channelId, false);
              });
              for (const roomId of data.rooms) {
                rooms.get(roomId).delete(userId);
                await updateRoomUsers(roomId);
              }
              users.delete(userId);
            }
            return;
          }
        });
      } catch (error) {}
    });

    async function updateChannelUsers(userId, channelId, isOnline) {
      const userIds = Array.from(channels.get(channelId) || []);
      io.to(channelId).emit("channelUsersUpdate", {
        channelId,
        users: userIds.filter((user) => user !== null),
        userId,
        isOnline,
      });
    }

    async function updateRoomUsers(roomId) {
      console.log(rooms.get(roomId));
      const userIds = Array.from(rooms.get(roomId) || []);
      const usersInfo = await Promise.all(
        userIds.map(async (userId) => {
          const user = await User.findById(userId);
          return user
            ? { userId: user._id, nickname: user.nickname, avatar: user.avatar }
            : null;
        })
      );

      io.to(roomId).emit("roomUsersUpdate", {
        roomId,
        users: usersInfo.filter((user) => user !== null),
      });
    }
  });

  return io;
}

module.exports = {
  useSocketIo,
};
