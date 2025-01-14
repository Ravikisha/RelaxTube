const { Kafka, logLevel } = require("kafkajs");
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
const kafka = new Kafka({
  clientId: "transcoding-service",
  brokers: ["localhost:9092"],
  logLevel: logLevel.DEBUG,
});
const consumer = kafka.consumer({
  groupId: "transcoding-group",
  sessionTimeout: 3000000
});

(async () => {
  try{
    await consumer.connect();
    await consumer.subscribe({
      topic: "video-transcoding-jobs",
      fromBeginning: false,
    });
  }catch(err){
    console.error("Error connecting to Kafka:", err);
    process.exit(1);
  }

  console.log("Kafka consumer connected.");

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const job = JSON.parse(message.value.toString());
        console.log("Processing job:", job);

        // Update MongoDB to mark the job as "In Progress"
        const video = await Video.findOne({ videoId: job.videoId });
        if (!video) {
          console.error(`Video with ID ${job.videoId} not found.`);
          return;
        }
        if (video) {
          video.status = "in-progress";
          await video.save();
        }

        // Transcode video
        await transcodeVideoToHLS(job.filePath, job.videoId);
        await thumbnailGeneration(job.filePath, job.videoId);
        console.log("Completed transcoding job:", job.videoId);
        // Commit the message offset manually after successful processing
        console.log("Committing offset: ", { topic, partition, offset: `${Number(message.offset) + 1}` });
        console.log("Committed offset for:", job.videoId);
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
    }
    createMasterFile(videoId, resolutions);
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
      `ffmpeg -i ${inputPath} -ss 00:00:01.000 -vframes 1 ${outputDir}/thumbnail.jpg -y`
    );

    console.log("Thumbnail generation complete for:", videoId);
  } catch (err) {
    console.error("Error during thumbnail generation:", err);
  }
}

async function createMasterFile(videoId, resolutions) {
  const masterFilePath = `../uploads/transcoded/segments/${videoId}/master.m3u8`;
  const header = `#EXTM3U\n#EXT-X-VERSION:3\n`;
  const lines = resolutions
    .map(
      (res) =>
        `#EXT-X-STREAM-INF:BANDWIDTH=${res.bitrate},RESOLUTION=${res.resolution}\n${res.name}/playlist.m3u8`
    )
    .join("\n");

    await fs.promises.writeFile(masterFilePath, header + lines);
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
