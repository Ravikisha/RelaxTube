// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "../api";

const Dashboard = ({setSelectedVideo}) => {
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
      <h2>Dashboard</h2>
      {videos.length === 0 ? (
        <p>No videos available.</p>
      ) : (
        <ul>
          {videos.map((video) => (
            <li key={video.id}>
              {video.name} - {video.status}
              <button onClick={() => setSelectedVideo(video)}>Play</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
