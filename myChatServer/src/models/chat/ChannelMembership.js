const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChannelMembershipSchema = new Schema(
  {
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChannelMembership", ChannelMembershipSchema);
