// src/components/VideoUploadForm.jsx
import { useState } from "react";
import axios from "../api";

const VideoUploadForm = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage("Please select a video file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
      setMessage("Upload successful! Transcoding started.");
    } catch (error) {
      console.log(error);
      setMessage("Error uploading video." + error.getMessage());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button type="submit">Upload Video</button>
      <p>{message}</p>
    </form>
  );
};

export default VideoUploadForm;
