// models/Post.js (actualizado para HU-16)
const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    community: { type: Schema.Types.ObjectId, ref: "Community", required: true },
    title: { type: String, trim: true },
    content: { type: String, required: true, trim: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    isReported: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
