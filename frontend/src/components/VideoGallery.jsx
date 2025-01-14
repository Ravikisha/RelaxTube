import React from "react";
import { Link } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

const VideoGallery = ({ videos }) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">
          Video Transcoding and Streaming
        </h2>
        <p className="max-w-lg mx-auto mt-4 text-base leading-relaxed text-gray-600">
          Demonstration of video transcoding and streaming using React, Node.js, and FFmpeg.
        </p>
      </div>
      <hr className="max-w-xs mx-auto my-8 border-gray-300" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.filter(video => video.status === 'completed').map((video) => (
          <Link
            key={video._id}
            to={`/player/${video.videoId}`}
            className="group block"
          >
            <img
              src={`${BASE_URL}/thumbnails/${video.videoId}`}
              alt={video.videoId}
              className="w-full h-48 object-cover rounded-md shadow-lg group-hover:opacity-80"
            />
            <p className="mt-2 text-lg font-medium text-gray-800 group-hover:text-blue-600"
              style={{fontFamily: 'Playfair Display, serif'}}
            >
              {video.title.length > 30 ? `${video.title.substring(0, 30)}...` : video.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VideoGallery;