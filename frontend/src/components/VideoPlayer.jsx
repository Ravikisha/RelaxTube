import React, { useRef, useState, useEffect, forwardRef } from "react";
import { usePlyr } from "plyr-react";
import "plyr-react/plyr.css"
import Hls from "hls.js";
import { useParams } from 'react-router-dom';
import axios from "../api";

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

const VideoPlayer = () => {
  const [title, setTitle] = useState("");
  const { id } = useParams();
  const ref = useRef(null);
  const supported = Hls.isSupported();
  const hlsSource = `${BACKEND_URL}/videos/${id}/playlist.m3u8`;

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const response = await axios.get(`/videos/${id}`)
        setTitle(response.data.title);
      } catch (err) {
        console.error("Error Fetching the title: ", err);
      }
    }
    fetchTitle();
  }, []);


  return (
    <div className="wrapper">
      <h2 className="text-2xl font-semibold text-center mb-4 leading-tight text-black sm:text-3xl lg:text-4xl"
      style={{fontFamily: 'Playfair Display, serif'}}
      >{title}</h2>
      <hr className="max-w-xs mx-auto my-8 border-gray-300" />
      <div className="plyr-wrapper mx-auto max-w-3xl rounded-lg shadow-lg">
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
    </div>
  );
};

export default VideoPlayer;