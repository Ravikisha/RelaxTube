const { Kafka } = require("kafkajs");
const { exec, spawn } = require("child_process");
const mongoose = require("mongoose");
const Video = require("./models/Video");
const fs = require("fs");

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/videoApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

// Initialize Kafka
const kafka = new Kafka({ brokers: ["localhost:9092"] });
const consumer = kafka.consumer({ groupId: "transcoding-group" });

(async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "video-transcoding-jobs" });

  console.log("Kafka consumer connected.");

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const job = JSON.parse(message.value.toString());
        console.log("Processing job:", job);

        // Update MongoDB to mark the job as "In Progress"
        const video = await Video.findOne({ videoId: job.videoId });
        if (video) {
          video.status = "in-progress";
          await video.save();
        }

        // Transcode video
        await transcodeVideoToHLS(job.filePath, job.videoId);
        await thumbnailGeneration(job.filePath, job.videoId);
        // Commit the message offset manually after successful processing
        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (parseInt(message.offset, 10) + 1).toString(),
          },
        ]);
      } catch (err) {
        console.error("Error processing job:", err);
      }
    },
  });
})();

async function transcodeVideoToHLS(inputPath, videoId) {
  console.log("Start HLS Transcoding for:", videoId);

  const resolutions = [
    { name: "1080p", resolution: "1920x1080", bitrate: "5000k" },
    { name: "720p", resolution: "1280x720", bitrate: "3000k" },
    { name: "480p", resolution: "854x480", bitrate: "1500k" },
  ];

  try {
    for (const { name, resolution, bitrate } of resolutions) {
      const outputDir = `../uploads/transcoded/segments/${videoId}/${name}`;
      await fs.promises.mkdir(outputDir, { recursive: true }); // Create output directory

      console.log(
        `ffmpeg -i ${inputPath} -vf scale=${resolution} -b:v ${bitrate} -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputDir}/segment_%03d.ts" ${outputDir}/playlist.m3u8`
      );

      await execCommand(
        `ffmpeg -i ${inputPath} -vf scale=${resolution} -b:v ${bitrate} -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputDir}/segment_%03d.ts" ${outputDir}/playlist.m3u8`
      );

      // Update MongoDB with completed status and HLS paths (assuming similar logic)
      // ... your MongoDB update logic here ...
    }
    const video = await Video.findOne({ videoId });
    if (video) {
      video.status = "completed";
      await video.save();
    }

    console.log("HLS Transcoding complete for:", videoId);
  } catch (err) {
    console.error("Error during HLS transcoding:", err);
  }
}

async function thumbnailGeneration(inputPath, videoId) {
  console.log("Generating thumbnail for:", videoId);

  try {
    const outputDir = `../uploads/thumbnails/${videoId}`;
    await fs.promises.mkdir(outputDir, { recursive: true }); // Create output directory

    console.log(
      `ffmpeg -i ${inputPath} -ss 00:00:01.000 -vframes 1 ${outputDir}/thumbnail.jpg`
    );

    await execCommand(
      `ffmpeg -i ${inputPath} -ss 00:00:01.000 -vframes 1 ${outputDir}/thumbnail.jpg`
    );

    console.log("Thumbnail generation complete for:", videoId);
  } catch (err) {
    console.error("Error during thumbnail generation:", err);
  }
}

function createMasterFile(videoId, resolutions) {
  const masterFilePath = `../uploads/transcoded/segments/${videoId}/master.m3u8`;
  const lines = resolutions
    .map(
      (res) =>
        `#EXT-X-STREAM-INF:BANDWIDTH=${res.bitrate},RESOLUTION=${res.resolution}\n${res.name}/playlist.m3u8`
    )
    .join("\n");

  fs.writeFileSync(masterFilePath, lines);
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${stderr}`);
        reject(error);
      } else {
        console.log(stdout);
        resolve(stdout);
      }
    });
  });
}
