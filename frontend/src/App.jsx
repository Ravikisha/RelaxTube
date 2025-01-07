// src/App.js
import React, { useState } from "react";
import VideoUploadForm from "./components/VideoUploadForm";
import Dashboard from "./components/Dashboard";
import VideoPlayer from "./components/VideoPlayer";

function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <div>
      <h1>Video Transcoding and Streaming</h1>
      <VideoUploadForm />
      <Dashboard setSelectedVideo={setSelectedVideo} />
      {selectedVideo && <VideoPlayer url={selectedVideo} />}
    </div>
  );
}

export default App;
