import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#f0eaf8",
      // Load both fonts globally
      fontFamily: "'Merriweather', Georgia, serif",
    }}>
      {/* Load Google Fonts in layout */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Merriweather:wght@300;400;700&display=swap');
      `}</style>

      <Header />

      <main style={{
        flex: 1,
        padding: "28px 24px",
        background: "linear-gradient(180deg, #f0eaf8 0%, #fce8f3 100%)",
      }}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
