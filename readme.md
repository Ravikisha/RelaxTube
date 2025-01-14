![Poster](./docs/poster.png)

# RealxTube

RealxTube is a scalable and efficient application designed to demonstrate the workflow of video transcoding and streaming. Built using Node.js, React, Kafka, and FFmpeg, this project showcases key features like video transcoding to multiple qualities, segment generation for smoother streaming, and thumbnail creation. The data is stored in MongoDB, while video files and metadata are managed in a local file storage system.

<p float="left">
    <img src="https://img.shields.io/github/license/ravikisa/realxtube" alt="License" />
    <img src="https://img.shields.io/github/issues/ravikisa/realxtube" alt="Issues" />
    <img src="https://img.shields.io/github/forks/ravikisa/realxtube" alt="Forks" />
    <img src="https://img.shields.io/github/stars/ravikisa/realxtube" alt="Stars" />
    <img src="https://img.shields.io/github/contributors/ravikisa/realxtube" alt="Contributors" />
</p>

<p float="left">
    <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/Kafka-231F20?logo=apachekafka&logoColor=white" alt="Kafka" />
    <img src="https://img.shields.io/badge/FFmpeg-007808?logo=ffmpeg&logoColor=white" alt="FFmpeg" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript" />
</p>

## Architecture

![Diagram](./docs/diagram.svg)

## Features

- **Video Transcoding**: Convert videos into multiple quality levels (e.g., 360p, 480p, 720p, 1080p) using FFmpeg.
- **Video Segmentation**: Generate video segments in HLS format for efficient streaming and reduced loading times.
- **Thumbnail Generation**: Automatically create thumbnail images for each video.
- **Batch Processing**: Handle multiple video files simultaneously for improved processing efficiency.
- **Scalable Architecture**: Built to handle increased load and scale as required.
- **Data Storage**: Store metadata in MongoDB and manage files in local storage.

## Tech Stack

### Backend
- **Node.js (Express)**: Handles server-side logic, video processing, and API endpoints.
- **Kafka**: Manages message queues for batch processing and scalability.
- **FFmpeg**: Performs video transcoding, segmentation, and thumbnail generation.
- **MongoDB**: Stores video metadata, quality options, and other related data.

### Frontend
- **React**: Provides a user-friendly interface for uploading videos, viewing processed content, and managing workflows.

### Additional Tools
- **Docker**: Used to containerize and run the application locally.

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ravikisha/realxtube.git
   cd realxtube
   ```

2. **Set Up Environment Variables**
   run the docker-compose file
   ```bash
    docker-compose up -d
    ```

3. **Install Dependencies**
   ```bash
    cd frontend
    npm install

    cd ../backend
    npm install

    cd ../transcoding-service
    npm install
   ```

4. **Run Kafka**
   Make sure Kafka is running locally or accessible remotely.

5. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

6. **Start the Frontend**
   ```bash
    cd frontend
    npm run dev
   ```

7. **Start the Transcoding Service**
   ```bash
    cd transcoding-service
    npm run dev
    ```

7. **Access the Application**
   Open your browser and navigate to `http://localhost:3000`.

## Usage

1. Upload a video file through the web interface.
2. The backend processes the video by:
   - Transcoding it into multiple quality levels.
   - Generating video segments for streaming.
   - Creating a thumbnail image.
3. Processed files and metadata are stored in the local file system and MongoDB.
4. Use the frontend to view available videos, stream content, or download specific segments.

## Screenshots
![Home](./docs/home.png)
![Video](./docs/video.png)
![Quality](./docs/quality.png)
![Upload](./docs/upload.png)
![Batch Upload](./docs/batchuplaod.png)

## Scalability
- [x] **Batch Processing**: Process multiple videos concurrently with Kafka queues.
- [ ] **Distributed Architecture**: Add more workers or scale the application horizontally to handle larger workloads.
- [ ] **Cloud Deployment**: Deploy the application on cloud platforms like AWS, Azure, or Google Cloud for improved scalability.
- [ ] **Load Balancing**: Use load balancers to distribute incoming requests across multiple servers.
- [ ] **Caching**: Implement caching mechanisms to reduce processing time and improve performance.
- [ ] **Monitoring**: Use monitoring tools like Prometheus, Grafana, or ELK stack to track performance metrics and identify bottlenecks.

## Future Enhancements
- Integrate cloud storage solutions (e.g., AWS S3, Google Cloud Storage).
- Implement user authentication and access control.
- Add support for advanced analytics and monitoring.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

Feel free to contribute to the project by submitting pull requests or reporting issues!
