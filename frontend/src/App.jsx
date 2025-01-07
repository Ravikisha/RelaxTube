// src/App.js
import { useState } from "react";
import VideoUploadForm from "./components/VideoUploadForm";
import Dashboard from "./components/Dashboard";
import VideoPlayer from "./components/VideoPlayer";
import { Routes, Route, Link } from 'react-router-dom';

function App() {

  return (
    <>
      <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-white text-sm py-3">
        <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
          <a className="flex-none font-bold text-xl text-black focus:outline-none focus:opacity-80" href="#" aria-label="Brand">RelaxTube</a>
          <div className="flex flex-row items-center gap-5 mt-5 sm:justify-end sm:mt-0 sm:ps-5">
            <Link className="font-medium text-gray-800 hover:text-gray-400 focus:outline-none focus:text-gray-400" to={'/'} aria-current="page">Home</Link>
            <Link className="font-medium text-gray-800 hover:text-gray-400 focus:outline-none focus:text-gray-400" to={'/upload'}>Upload</Link>
          </div>
        </nav>
      </header>
      <section className="py-10 bg-gray-100">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<VideoUploadForm />} />
            <Route path="/player/:id" element={<VideoPlayer />} />
          </Routes>
        </div>
      </section>
    </>
  );
}




export default App;
