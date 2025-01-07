// import React, { useEffect, useRef, useState } from "react";
// import Hls from "hls.js";
// import ReactPlayer from "react-player";

// const VideoPlayer = ({ url }) => {
//   const [quality, setQuality] = useState("480"); // Default quality
//   const [availableQualities, setAvailableQualities] = useState([]);
//   const videoRef = useRef(null); // Reference to the video element
//   const hlsRef = useRef(null); // Reference to the HLS instance
//   const BACKEND_URL = "http://localhost:5000";
//   const videoUrl = `${BACKEND_URL}/videos/${url.videoId}/playlist.m3u8`;

//   // useEffect(() => {
//   //   const video = videoRef.current;

//   //   if (Hls.isSupported()) {
//   //     const hls = new Hls();
//   //     hlsRef.current = hls;

//   //     hls.loadSource(videoUrl);
//   //     hls.attachMedia(video);

//   //     // Listen for quality levels and update state
//   //     hls.on(Hls.Events.MANIFEST_PARSED, () => {
//   //       const levels = hls.levels.map((level, index) => ({
//   //         index,
//   //         resolution: `${level.height}p`,
//   //       }));
//   //       setAvailableQualities([{ index: -1, resolution: "auto" }, ...levels]);
//   //     });

//   //     // Handle quality change
//   //     hls.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
//   //       console.log(`Switching to level ${data.level}`);
//   //     });

//   //     return () => {
//   //       hls.destroy();
//   //       hlsRef.current = null;
//   //     };
//   //   } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//   //     video.src = videoUrl;
//   //     video.addEventListener("loadedmetadata", () => video.play());
//   //   }
//   // }, [videoUrl]);

//   useEffect(() => {
//     const video = videoRef.current;
  
//     if (Hls.isSupported()) {
//       const hls = new Hls();
//       hlsRef.current = hls;
  
//       hls.loadSource(videoUrl);
//       hls.attachMedia(video);
  
//       // Listen for manifest parsed event
//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         const levels = hls.levels.map((level, index) => ({
//           index,
//           resolution: `${level.height}p`,
//         }));
//         setAvailableQualities([{ index: -1, resolution: "auto" }, ...levels]);
//       });
  
//       // Handle level switching events for smoother transition
//       hls.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
//         console.log(`Switching to level ${data.level}`);
//         // You can add logic here to handle the transition,
//         // such as displaying a loading indicator or using a placeholder image.
//       });
  
//       hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
//         console.log(`Switched to level ${data.level}`);
//         // Playback should resume after the switch is complete.
//       });
  
//       return () => {
//         hls.destroy();
//         hlsRef.current = null;
//       };
//     } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//       video.src = videoUrl;
//       video.addEventListener("loadedmetadata", () => video.play());
//     }
//   }, [videoUrl]);

//   const handleQualityChange = (event) => {
//     const selectedLevel = Number(event.target.value);

//     if (selectedLevel === -1) {
//       // Automatic quality switching
//       hlsRef.current.currentLevel = -1;
//     } else {
//       // Set to the selected quality
//       hlsRef.current.currentLevel = selectedLevel;
//     }
//     setQuality(selectedLevel);
//   };

//   return (
//     <div className="flex flex-col items-center p-4 bg-gray-900 text-white rounded-lg shadow-lg max-w-3xl mx-auto">
//       <h2 className="text-xl font-bold mb-4">Video Player</h2>
      
//       <div className="relative w-full aspect-w-16 aspect-h-9 mb-4">
//         <video
//           ref={videoRef}
//           controls
//           className="absolute inset-0 w-full h-full rounded-lg"
//         ></video>
//       </div>

//       <div className="flex items-center space-x-4">
//         <label htmlFor="quality" className="text-sm font-medium">
//           Select Quality:
//         </label>
//         <select
//           id="quality"
//           value={quality}
//           onChange={handleQualityChange}
//           className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 text-white"
//         >
//           {availableQualities.map(({ index, resolution }) => (
//             <option key={index} value={index}>
//               {resolution}
//             </option>
//           ))}
//         </select>
//       </div>
//     </div>
//   );
// };

// export default VideoPlayer;


import React, { useRef, useState, useEffect, forwardRef } from "react";
import { usePlyr } from "plyr-react";
import "plyr-react/plyr.css"
import Hls from "hls.js";

const videoOptions = null;
// const videoSource = 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8';
const BACKEND_URL = 'http://localhost:5000';


const useHls = (src, options) => {
  const hls = useRef(new Hls());
  const hasQuality = useRef(false);
  const [plyrOptions, setPlyrOptions] = useState(options);

  useEffect(() => {
    hasQuality.current = false;
  }, [options]);

  useEffect(() => {
    hls.current.loadSource(src);
    hls.current.attachMedia(document.querySelector(".plyr-react"));

    hls.current.on(Hls.Events.MANIFEST_PARSED, () => {
      if (hasQuality.current) return;

      const levels = hls.current.levels;
      const quality = {
        default: 0, // Default to AUTO
        options: [0, ...levels.map((level) => level.height)], // Prepend 0 for AUTO
        forced: true,
        onChange: (newQuality) => {
          if (newQuality === 0) {
            hls.current.currentLevel = -1; // Enable AUTO quality
          } else {
            levels.forEach((level, levelIndex) => {
              if (level.height === newQuality) {
                hls.current.currentLevel = levelIndex;
              }
            });
          }
        },
      };

      setPlyrOptions({
        ...plyrOptions,
        quality,
        i18n: {
          qualityLabel: {
            0: "Auto",
          },
        },
      });

      hls.current.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const span = document.querySelector(
          ".plyr__menu__container [data-plyr='quality'][value='0'] span"
        );
        if (hls.current.autoLevelEnabled) {
          span.innerHTML = `AUTO (${hls.current.levels[data.level].height}p)`;
        } else {
          span.innerHTML = "AUTO";
        }
      });

      hasQuality.current = true;
    });

    // return () => {
    //   hls.current.destroy();
    // };
  }, [src, plyrOptions]);

  
  return { options: plyrOptions };
};

const CustomPlyrInstance = forwardRef((props, ref) => {
  const { source, options = null, hlsSource } = props;
  const raptorRef = usePlyr(ref, {
    ...useHls(hlsSource, options),
    source,
  });

  return <video controls playsInline ref={raptorRef} className="plyr-react plyr" />;
});

const VideoPlayer = ({ url }) => {
  const ref = useRef(null);
  const supported = Hls.isSupported();
  const hlsSource = `${BACKEND_URL}/videos/${url.videoId}/playlist.m3u8`;
  // const hlsSource = 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8';  

  return (
    <div className="wrapper">
      {supported ? (
        <CustomPlyrInstance
          ref={ref}
          source={null}
          options={null}
          hlsSource={hlsSource}
        />
      ) : (
        "HLS is not supported in your browser"
      )}
    </div>
  );
};

export default VideoPlayer;