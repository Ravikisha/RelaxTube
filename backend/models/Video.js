const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  originalName: { type: String, required: true },
  status: { type: String, default: "pending" },
  filePath: { type: String, required: true },
  title: {type: String, required: true}
});

module.exports = mongoose.model("Video", videoSchema);
