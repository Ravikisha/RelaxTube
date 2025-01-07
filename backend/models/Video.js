const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  originalName: { type: String, required: true },
  resolutions: { type: [String], default: [] },
  status: { type: String, default: "pending" },
  filePath: { type: String, required: true },
  hlsResolutions: { type: [Object], default: [] }
});

module.exports = mongoose.model("Video", videoSchema);
