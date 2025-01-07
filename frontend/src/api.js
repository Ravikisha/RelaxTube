// src/api.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000", // Backend URL
});

export default instance;
