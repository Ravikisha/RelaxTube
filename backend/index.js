const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const Video = require("./models/Video");
const path = require("path");
const { Kafka } = require("kafkajs");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
const PORT = 5000;
const kafka = new Kafka({ brokers: ["localhost:9092"] });
const producer = kafka.producer();

(async () => {
  await producer.connect();
  console.log("Kafka producer connected.");
})();

// Middleware
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: "../uploads/raw",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
});

app.get("/videos", async (req, res) => {
  const videos = await Video.find();
  res.status(200).json(videos);
});

app.post("/upload", upload.single("video"), async (req, res) => {
  const { file } = req;
  if (!file) return res.status(400).send("No file uploaded.");

  const video = new Video({
    videoId: uuidv4(),
    originalName: file.originalname,
    filePath: file.path,
    status: "pending",
  });

  await video.save();

  // Enqueue the transcoding job
  await producer.send({
    topic: "video-transcoding-jobs",
    messages: [
      {
        value: JSON.stringify({
          videoId: video.videoId,
          filePath: video.filePath,
        }),
      },
    ],
  });

  res.status(200).json({ message: "Video uploaded and job enqueued.", video });
});

app.post("/update-status", async (req, res) => {
  const { videoId, resolutions } = req.body;

  const video = await Video.findOne({ videoId });
  if (!video) return res.status(404).send("Video not found.");

  video.resolutions = resolutions;
  video.status = "completed";
  await video.save();

  res.status(200).send("Status updated.");
});

app.get("/status/:videoId", async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findOne({ videoId });

  if (!video) return res.status(404).send("Video not found.");
  res.status(200).json({ status: video.status });
});

// Serve HLS playlist
// app.get("/videos/:videoId/playlist.m3u8", async (req, res) => {
//   const { videoId } = req.params;
//   const video = await Video.findOne({ videoId });

//   if (!video || video.status !== "completed") {
//     return res.status(404).send("Video not found or not ready.");
//   }

//   const playlistPath = path.resolve(`segments/${videoId}/master.m3u8`);
//   if (!fs.existsSync(playlistPath)) {
//     return res.status(404).send("Playlist not found.");
//   }

//   res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
//   res.sendFile(playlistPath);
// });

app.get("/videos/:videoId/playlist.m3u8", async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findOne({ videoId });

  if (!video || video.status !== "completed") {
    return res.status(404).send("Video not found or not ready.");
  }

  const playlistPath = path.join(__dirname, `../uploads/transcoded/segments/${videoId}/master.m3u8`);
  if (!fs.existsSync(playlistPath)) {
    return res.status(404).send("Playlist not found.");
  }

  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.sendFile(playlistPath);
});

app.get("/videos/:videoId/:resolution/playlist.m3u8", async(req, res) => {
  const { videoId, resolution } = req.params;
  //  path of the file: ../uploads/transcoded/segments/${videoId}/${resolution}/playlist.m3u8
  // const playlistPath = path.resolve(`../uploads/transcoded/segments/${videoId}/${resolution}/playlist.m3u8`);
  const playlistPath = path.join(__dirname, `../uploads/transcoded/segments/${videoId}/${resolution}/playlist.m3u8`);
  if (!fs.existsSync(playlistPath)) {
    return res.status(404).send("Playlist not found.");
  }
  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.sendFile(playlistPath);
})

// Serve video segments
app.get("/videos/:videoId/:resolution/segment_:segmentId.ts", (req, res) => {
  const { videoId, resolution, segmentId } = req.params;
  const segmentPath  = path.join(__dirname, `../uploads/transcoded/segments/${videoId}/${resolution}/segment_${segmentId}.ts`);
  if (!fs.existsSync(segmentPath)) {
    return res.status(404).send("Segment not found.");
  }
  res.setHeader("Content-Type", "video/mp2t");
  res.sendFile(segmentPath);
});

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/videoApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
