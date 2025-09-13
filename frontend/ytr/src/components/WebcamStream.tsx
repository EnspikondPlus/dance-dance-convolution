import { useRef, useEffect, useState } from "react";
import { sendFrameFlask, sendTrackFlask, calculateScores } from "../services/api"

export default function WebcamStream() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackRef = useRef<HTMLVideoElement | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isOn, setIsOn] = useState(false);

  const [isTrackOn, setIsTrackOn] = useState(false);
  const [poseImage, setPoseImage] = useState<string | null>(null);
  const [trackImage, setTrackImage] = useState<string | null>(null);

  const [poseLandmarks, setPoseLandmarks] = useState<any>(null);
  const [trackLandmarks, setTrackLandmarks] = useState<any>(null);

  const [score, setScore] = useState(0);
  // Start webcam
  const startWebcam = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch((err) => console.error(err));
      }
      setStream(newStream);
      setIsOn(true);
    } catch (err) {
      console.error(err);
      setError("Cannot access webcam");
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setIsOn(false);
  };

  // Toggle button handler
  const toggleWebcam = () => {
    if (isOn) stopWebcam();
    else startWebcam();
  };

   const startTrack = () => {
    if (trackRef.current) {
      trackRef.current.src = "http://127.0.0.1:5000/api/video";
      trackRef.current.play().catch((err) => console.error(err));
      setIsTrackOn(true);
    }
  };

  const stopTrack = () => {
    if (trackRef.current) {
      trackRef.current.pause();
      trackRef.current.removeAttribute("src"); // remove source
      trackRef.current.load(); // reset video element
    }
    setIsTrackOn(false);
  };

  const toggleTrack = () => {
    if ((!isTrackOn) && isOn){
      startTrack();
      setScore(0);
    }
    else stopTrack();
  };

  const calculateScore = async () => {
    const newscore = await calculateScores(poseLandmarks, trackLandmarks, score);
    setScore(newscore);
  }

  // Capture a frame and POST to backend
  const sendFrame = async () => {
    if (!videoRef.current || !isOn) return;

    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg");

    try {
      const response = await sendFrameFlask(dataUrl);
      setPoseImage(response.image);
      setPoseLandmarks(response.poseLandmarks);
      console.log(poseLandmarks);
    } catch (err) {
      console.error("Failed to send frame:", err);
    }
  };

  const sendTrack = async () => {
    if (!trackRef.current) return;

    const video = trackRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg");

    try {
      const response = await sendTrackFlask(dataUrl);
      setTrackImage(response.image);
      setTrackLandmarks(response.landmarks);
      console.log(trackLandmarks);
    } catch (err) {
      console.error("Failed to send frame:", err);
    }

    calculateScore();
  };

  // Periodically send frames while webcam is on
  useEffect(() => {
    if ((!isOn) || (isTrackOn)) return;

    const interval = setInterval(sendFrame, 150); // every 500ms
    return () => clearInterval(interval);
  }, [isOn]);
  
  useEffect(() => {
    if ((!isOn) || (!isTrackOn)) return;
    const interval = setInterval(sendFrame, 150);
    const tinterval = setInterval(sendTrack, 150);
    return () => {
      clearInterval(interval);
      clearInterval(tinterval);
    }
  }, [isTrackOn]);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.src = "http://127.0.0.1:5000/api/video";
    }
  }, []);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

    return (
    <div style={{ textAlign: "center" }}>
      {error && <p>{error}</p>}

      <button onClick={toggleWebcam}>
        {isOn ? "Turn Off Webcam" : "Turn On Webcam"}
      </button>

      <button onClick={toggleTrack} style={{ marginLeft: "10px" }}>
        {isTrackOn ? "Stop Track" : "Start Track"}
      </button>

      <p><b>Score:</b> {score * 100}</p>

      <br />

      <video
        ref={trackRef}
        playsInline
        crossOrigin="anonymous"
        style={{ width: "0px", borderRadius: "8px" }}
      />
      {trackImage && (
        <img
          src={trackImage}
          alt="Track Frame"
          style={{
            height: "300px",
            borderRadius: "8px",
            marginLeft: "20px",
          }}
        />
      )}

      <video
        className="imgflip"
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "0px", borderRadius: "8px" }}
      />
      {poseImage && isOn && (
        <img
          className="imgflip"
          src={poseImage}
          alt="Pose Frame"
          style={{
            width: "400px",
            height: "300px",
            borderRadius: "8px",
            marginLeft: "20px",
          }}
        />
      )}
    </div>
  );
}