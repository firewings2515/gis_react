import React, { useState } from "react";

export default function HamburgerMenu({ options = [], onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger Icon */}
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 2001,
          cursor: "pointer",
          background: "#f7fafb",
          borderRadius: 8,
          padding: 8,
          boxShadow: "0 1px 4px #0002",
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        onClick={() => setOpen(true)}
        title="Open Menu"
      >
        <div style={{ width: 22, height: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: 3, background: "#222", borderRadius: 2 }} />
          ))}
        </div>
      </div>

      {/* Side Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: open ? 0 : -250,
          width: 250,
          height: "100vh",
          background: "#fff",
          boxShadow: "2px 0 16px #0002",
          transition: "left 0.25s cubic-bezier(.4,0,.2,1)",
          zIndex: 2002,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ padding: 20, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>Menu</span>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#999"
            }}
            aria-label="Close"
          >×</button>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 10, gap: 8 }}>
          {options.map((option, idx) => (
            <button
              key={idx}
              style={{
                background: "#f4f4f4",
                border: "none",
                borderRadius: 6,
                padding: "10px 14px",
                textAlign: "left",
                fontSize: 16,
                cursor: "pointer",
                fontWeight: 500
              }}
              onClick={() => {
                setOpen(false);
                onSelect && onSelect(option, idx);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "#0003",
            zIndex: 2000
          }}
        />
      )}
    </>
  );
}
