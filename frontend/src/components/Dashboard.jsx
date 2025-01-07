// src/components/Dashboard.jsx
import { useState, useEffect } from "react";
import axios from "../api";
import { Link } from "react-router-dom";
import VideoGallery from './VideoGallery';

const Dashboard = ({ setSelectedVideo }) => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("/videos");
        setVideos(response.data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div>
      {videos.length === 0 ? (
        <p>No videos available.</p>
      ) : (
        <VideoGallery videos={videos} />
      )}
    </div>
  );
};

export default Dashboard;
