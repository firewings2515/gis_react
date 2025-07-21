import React, { useRef, useState } from "react";

export default function GpsPropertyPanel({ data, onClose }) {
  const panelRef = useRef(null);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Mouse event handlers
  const onMouseDown = (e) => {
    setDragging(true);
    // Panel's bounding rect
    const rect = panelRef.current.getBoundingClientRect();
    // Save offset of mouse inside the panel
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    // Prevent text selection
    document.body.style.userSelect = "none";
  };

  React.useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e) => {
      // Clamp to window
      const width = panelRef.current.offsetWidth;
      const height = panelRef.current.offsetHeight;
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;
      let newX = e.clientX - offsetRef.current.x;
      let newY = e.clientY - offsetRef.current.y;
      // Boundaries (keep some margin)
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

  if (!data) return null;

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        zIndex: 1000,
        background: 'rgba(255,255,255,0.98)',
        borderRadius: '1em',
        padding: '1.5em 2em 1em 2em',
        boxShadow: '0 2px 16px #0003',
        minWidth: 270,
        fontSize: 15,
        maxWidth: 340,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: dragging ? 'grabbing' : 'default'
      }}
    >
      {/* Draggable header */}
      <div
        onMouseDown={onMouseDown}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
          cursor: 'grab',
          userSelect: 'none'
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 600, fontSize: 19 }}>Camera Info</h3>
        <button
          onClick={onClose}
          style={{
            background: '#eee',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 17,
            color: '#888'
          }}
          title="Close"
        >×</button>
      </div>

      <div style={{ borderTop: '1px solid #ececec', marginBottom: 10 }} />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
        <tbody>
          <tr>
            <td style={{ color: '#777', fontWeight: 500, width: 70 }}>Image</td>
            <td style={{ wordBreak: 'break-all' }}>{data.imageName}</td>
          </tr>
          <tr>
            <td style={{ color: '#777', fontWeight: 500 }}>Lng / Lat</td>
            <td>{data.lnglat[0]} / {data.lnglat[1]}</td>
          </tr>
          <tr>
            <td style={{ color: '#777', fontWeight: 500 }}>TWD97</td>
            <td>{data.twd97[0]} / {data.twd97[1]}</td>
          </tr>
          <tr>
            <td style={{ color: '#777', fontWeight: 500 }}>Height</td>
            <td>{data.height}</td>
          </tr>
          <tr>
            <td style={{ color: '#777', fontWeight: 500 }}>Yaw</td>
            <td>{data.rotation[0]}</td>
          </tr>
          <tr>
            <td style={{ color: '#777', fontWeight: 500 }}>Pitch</td>
            <td>{data.rotation[1]}</td>
          </tr>
          <tr>
            <td style={{ color: '#777', fontWeight: 500 }}>Roll</td>
            <td>{data.rotation[2]}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
