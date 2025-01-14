import React, { useState } from "react";
import axios from "../api";
import { useNavigate } from "react-router-dom";

const BatchUploadForm = () => {
    const [files, setFiles] = useState([]);
    const [title, setTitle] = useState("");
    const [uploadStatus, setUploadStatus] = useState("");
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        setFiles(event.target.files);
    };

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (files.length === 0) {
            setUploadStatus("Please select files to upload.");
            return;
        }

        const formData = new FormData();
        for (const file of files) {
            formData.append("videos", file);
        }
        formData.append("title", title);

        try {
            const response = await axios.post("/uploadBatch", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setUploadStatus("Upload successful! Videos enqueued for transcoding.");
            navigate('/')
            console.log(response.data);
        } catch (error) {
            setUploadStatus("Upload failed. Please try again.");
            console.error(error);
        }
    };

    return (
        <>
            <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">
                    Batch Video Transcoding and Streaming
                </h2>
                <p className="max-w-lg mx-auto mt-4 text-base leading-relaxed text-gray-600">
                    Demonstration of video transcoding and streaming using React, Node.js, and FFmpeg.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex flex-col gap-4 mt-8">

                <div className="relative w-full max-w-xl">
                    <input className="peer transition-all px-5 py-3 w-full text-lg text-gray-600 bg-white rounded-md border border-gray-800 outline-none select-all" type="text" placeholder=" "
                        value={title} onChange={handleTitleChange} />
                    <label className="z-2 text-gray-500 pointer-events-none absolute left-5 inset-y-0 h-fit flex items-center select-none transition-all text-sm peer-focus:text-sm peer-placeholder-shown:text-lg px-1 peer-focus:px-1 peer-placeholder-shown:px-0 bg-white peer-focus:bg-white peer-placeholder-shown:bg-transparent m-0 peer-focus:m-0 peer-placeholder-shown:m-auto -translate-y-1/2 peer-focus:-translate-y-1/2 peer-placeholder-shown:translate-y-0">Title</label>
                </div>


                <label for="uploadFile1"
                    className="bg-white text-gray-500 font-semibold text-base rounded max-w-md h-52 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto font-[sans-serif]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-11 mb-2 fill-gray-500" viewBox="0 0 32 32">
                        <path
                            d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                            data-original="#000000" />
                        <path
                            d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                            data-original="#000000" />
                    </svg>
                    Upload file

                    <input type="file" id='uploadFile1' className="hidden" multiple accept="video/*" onChange={handleFileChange} />
                    <p className="text-xs font-medium text-gray-400 mt-2 p-2">MP4, AVI, MKV, and MOV are Allowed.</p>
                </label>
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Upload Video</button>
                <p>{uploadStatus && <p>{uploadStatus}</p>}</p>
            </form>
        </>
    );
};

export default BatchUploadForm;
