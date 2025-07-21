import React, { useRef, useState, useEffect } from "react";

export default function GpsImagePanel({ imageName, onClose }) {
  const panelRef = useRef(null);
  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 24 });
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Always call hooks at the top

  const onMouseDown = (e) => {
    setDragging(true);
    const rect = panelRef.current.getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e) => {
      const width = panelRef.current.offsetWidth;
      const height = panelRef.current.offsetHeight;
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;
      let newX = e.clientX - offsetRef.current.x;
      let newY = e.clientY - offsetRef.current.y;
      newX = Math.max(0, Math.min(winWidth - width, newX));
      newY = Math.max(0, Math.min(winHeight - height, newY));
      setPosition({ x: newX, y: newY });
    };
    const onMouseUp = () => {
      setDragging(false);
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  // Only render UI if imageName exists
  if (!imageName) return null;

  //imageName = "000072.jpg"
  const imgUrl = `http://localhost:8080/images/${imageName}`;
console.log("image url", imgUrl);
  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        zIndex: 1001,
        background: '#fff',
        borderRadius: '1em',
        padding: '1em',
        boxShadow: '0 2px 16px #0003',
        minWidth: 160,
        maxWidth: 320,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: dragging ? "grabbing" : "default",
      }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
          cursor: "grab",
          userSelect: "none"
        }}
      >
        <b style={{ fontSize: 16 }}>Image</b>
        <button
          onClick={onClose}
          style={{
            background: '#eee', border: 'none', borderRadius: '50%', width: 28, height: 28,
            cursor: 'pointer', fontWeight: 600, fontSize: 17, color: '#888'
          }}
          title="Close"
        >×</button>
      </div>
      <div style={{ fontWeight: 500, marginBottom: 7, fontSize: 13, wordBreak: "break-all" }}>
        {imageName}
      </div>
      <img
        src={imgUrl}
        alt={imageName}
        style={{
          maxWidth: 260, maxHeight: 320, objectFit: "contain", borderRadius: 8,
          border: "1px solid #eee", background: "#fafbfc"
        }}
        onError={e => { e.target.style.opacity = 0.3; e.target.src = "" }}
      />
    </div>
  );
}
