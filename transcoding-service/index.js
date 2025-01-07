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

// async function transcodeVideoToHLS(inputPath, videoId) {
//   console.log("Start HLS Transcoding for:", videoId);

//   const resolutions = [
//     { name: "1080p", resolution: "1920x1080", bitrate: "5000k" },
//     { name: "720p", resolution: "1280x720", bitrate: "3000k" },
//     { name: "480p", resolution: "854x480", bitrate: "1500k" },
//   ];

//   try {
//     for (let { name, resolution, bitrate } of resolutions) {
//       const outputDir = `segments/${videoId}/${name}`;
//       const command = `mkdir -p ${outputDir} && ffmpeg -i ${inputPath} -vf scale=${resolution} -b:v ${bitrate} -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputDir}/segment_%03d.ts" ${outputDir}/playlist.m3u8`;

//       console.log("Executing command:", command);
//       await execCommand(command);
//     }

//     // Update MongoDB with completed status and HLS paths
//     const video = await Video.findOne({ videoId });
//     if (video) {
//       video.status = "completed";
//       video.hlsResolutions = resolutions.map((res) => ({
//         resolution: res.name,
//         playlist: `segments/${videoId}/${res.name}/playlist.m3u8`,
//       }));
//       await video.save();
//     }

//     console.log("HLS Transcoding complete for:", videoId);
//   } catch (err) {
//     console.error("Error during HLS transcoding:", err);
//   }
// }

// import { spawn } from 'child_process';

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

      // FFmpeg command with arguments
      // const ffmpeg = spawn("ffmpeg", [
      //   "-i",
      //   inputPath,
      //   "-vf",
      //   `scale=${resolution}`,
      //   "-b:v",
      //   bitrate,
      //   "-hls_time",
      //   "10",
      //   "-hls_playlist_type",
      //   "vod",
      //   "-hls_segment_filename",
      //   `${outputDir}/segment_%03d.ts`,
      //   `${outputDir}/playlist.m3u8`,
      // ]);

      console.log(`ffmpeg -i ${inputPath} -vf scale=${resolution} -b:v ${bitrate} -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputDir}/segment_%03d.ts" ${outputDir}/playlist.m3u8`)

      execCommand(
        `ffmpeg -i ${inputPath} -vf scale=${resolution} -b:v ${bitrate} -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputDir}/segment_%03d.ts" ${outputDir}/playlist.m3u8`
      );

      // console.log("Executing command:", ffmpeg.spawnargs.join(" "));

      // return new Promise((resolve, reject) => {
      //   ffmpeg.stdout.on("data", (data) => {
      //     console.log(`stdout: ${data}`);
      //   });

      //   ffmpeg.stderr.on("data", (data) => {
      //     console.error(`stderr: ${data}`);
      //   });

      //   ffmpeg.on("close", (code) => {
      //     if (code === 0) {
      //       resolve();
      //     } else {
      //       reject(new Error(`ffmpeg exited with code ${code}`));
      //     }
      //   });
      // });
    }

    // Update MongoDB with completed status and HLS paths (assuming similar logic)
    // ... your MongoDB update logic here ...
    const video = await Video.findOne({ videoId });
    if (video) {
      video.status = "completed";
      video.hlsResolutions = resolutions.map((res) => ({
        resolution: res.name,
        playlist: `segments/${videoId}/${res.name}/playlist.m3u8`,
      }));
      await video.save();
    }

    console.log("HLS Transcoding complete for:", videoId);
  } catch (err) {
    console.error("Error during HLS transcoding:", err);
  }
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
