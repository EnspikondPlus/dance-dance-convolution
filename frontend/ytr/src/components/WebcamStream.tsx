import { useRef, useEffect, useState } from "react";
import { sendFrameFlask, sendTrackFlask, calculateScores } from "../services/api";
import confetti from "canvas-confetti";

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

  const [score, setScore] = useState(0.0);
  const [possible, setPossible] = useState(0.0);

  const [showResults, setShowResults] = useState(false);
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
    if ((!isTrackOn) && isOn) {
      startTrack();
      setScore(0);
      setPossible(0);
    }
    else stopTrack();
  };

  const calculateScore = async (latestTrackLandmarks?: any) => {
    const track = latestTrackLandmarks || trackLandmarks;
    const newscore = await calculateScores(poseLandmarks, track);
    setScore(score => score + newscore.score);
    setPossible(possible => possible + 1.0);
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
      setPoseLandmarks(response.landmarks);
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
      calculateScore(response.landmarks);
    } catch (err) {
      console.error("Failed to send frame:", err);
    }
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

  useEffect(() => {
    const trackVideo = trackRef.current;
    if (!trackVideo) return;

    const handleEnded = () => {
      console.log("Track video has ended!");
      setIsTrackOn(false); // optional: automatically stop tracking
    };

    trackVideo.addEventListener("ended", handleEnded);

    // Cleanup
    return () => {
      trackVideo.removeEventListener("ended", handleEnded);
    };
  }, [trackRef.current]);

  return (
    <div style={{ textAlign: "center" }}>
      {error && <p>{error}</p>}

      <button onClick={toggleWebcam}>
        {isOn ? "Turn Off Webcam" : "Turn On Webcam"}
      </button>

      <button onClick={toggleTrack} style={{ marginLeft: "10px" }}>
        {isTrackOn ? "Stop Track" : "Start Track"}
      </button>

      <p><b>Score:</b> {score.toFixed(1)} / {possible.toFixed(0)}</p>

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
      {showResults && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center"
          }}>
            <h2>Results!</h2>
            <p><b>Score:</b> {score.toFixed(1)} / {possible.toFixed(0)}</p>
            <button onClick={() => setShowResults(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}