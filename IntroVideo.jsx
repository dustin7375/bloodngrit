import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function IntroVideo() {
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay failed; user must interact
      });
    }

    const timer = setTimeout(() => {
      navigate("/profile");
    }, 32000); // 32 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSkip = () => {
    navigate("/profile");
  };

  return (
    <div
      className="intro-video-container"
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        margin: 0,
        padding: 0,
      }}
    >
      <video
        ref={videoRef}
        src="/movies/intro.mp4"
        controls
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 1,
        }}
      />
      <button
        onClick={handleSkip}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 10,
          padding: "10px 20px",
          backgroundColor: "#b07b1d", // western gold/brown
          color: "white",
          border: "2px solid #7a5a10",
          borderRadius: "6px",
          fontWeight: "bold",
          fontFamily: "Georgia, serif",
          letterSpacing: "1px",
          cursor: "pointer",
          boxShadow: "2px 2px 6px rgba(0,0,0,0.5)",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#a06e1b")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#b07b1d")}
      >
        ⟶ Skip
      </button>
    </div>
  );
}
