export default function Header() {
  return (
    <header style={{
      padding: "16px 28px",
      background: "linear-gradient(135deg, #e8dff8 0%, #fce8f3 100%)",
      borderBottom: "2px solid #d8cef0",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "0 2px 12px rgba(167,139,218,0.12)",
    }}>
      <span style={{ fontSize: "28px" }}>⚡</span>
      <h1 style={{
        margin: 0,
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: "28px",
        fontWeight: 700,
        letterSpacing: "4px",
        textTransform: "uppercase",
        background: "linear-gradient(90deg, #a78bda, #f4a7c3)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        Rift‑Rumble Arena
      </h1>
    </header>
  );
}