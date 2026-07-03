import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!url) return setError("Please enter a URL!");
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, manual_text: manualText }),
      });
      const data = await res.json();

      if (data.error) {
        setShowManual(true);
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("Something went wrong!");
    }
    setLoading(false);
  };

  const getColor = (color) => {
    if (color === "red") return "#ff4444";
    if (color === "orange") return "#ff9900";
    return "#00cc66";
  };

  const getEmoji = (label) => {
    if (label === "HIGH RISK") return "🚨";
    if (label === "MEDIUM RISK") return "⚠️";
    return "✅";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "20px"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: "20px",
        padding: "40px",
        width: "100%",
        maxWidth: "600px",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
      }}>
        {/* Header */}
        <h1 style={{ color: "#fff", textAlign: "center", fontSize: "28px", marginBottom: "8px" }}>
          🔍 Fake Internship Detector
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: "30px" }}>
          Paste a job URL to check if it's real or fake
        </p>

        {/* URL Input */}
        <input
          type="text"
          placeholder="https://example.com/job-posting"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: "15px",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: "12px"
          }}
        />

        {/* Manual text fallback */}
        {showManual && (
          <textarea
            placeholder="Scraping failed! Paste job description here manually..."
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(255,165,0,0.5)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: "12px",
              resize: "vertical"
            }}
          />
        )}

        {/* Error */}
        {error && (
          <p style={{ color: "#ff9900", fontSize: "13px", marginBottom: "12px" }}>
            ⚠️ {error}
          </p>
        )}

        {/* Analyze Button */}
        <button
          onClick={analyze}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "none",
            background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(90deg, #6c63ff, #3ecfcf)",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s"
          }}
        >
          {loading ? "Analyzing..." : "Analyze Job Posting"}
        </button>

        {/* Result */}
        {result && (
          <div style={{
            marginTop: "30px",
            padding: "24px",
            borderRadius: "14px",
            border: `2px solid ${getColor(result.color)}`,
            background: `rgba(${result.color === 'red' ? '255,68,68' : result.color === 'orange' ? '255,153,0' : '0,204,102'}, 0.1)`
          }}>
            <h2 style={{ color: getColor(result.color), textAlign: "center", fontSize: "24px", margin: "0 0 20px" }}>
              {getEmoji(result.label)} {result.label}
            </h2>

            {/* Risk Score Bar */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>
                <span>Final Risk Score</span>
                <span style={{ color: getColor(result.color), fontWeight: "bold" }}>{result.final_score}/100</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", height: "10px" }}>
                <div style={{
                  width: `${result.final_score}%`,
                  background: getColor(result.color),
                  borderRadius: "10px",
                  height: "100%",
                  transition: "width 1s ease"
                }} />
              </div>
            </div>

            {/* Score Breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", margin: "0 0 6px" }}>Text Score</p>
                <p style={{ color: "#fff", fontSize: "22px", fontWeight: "bold", margin: 0 }}>{result.text_score}</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", margin: "0 0 6px" }}>URL Score</p>
                <p style={{ color: "#fff", fontSize: "22px", fontWeight: "bold", margin: 0 }}>{result.url_score}</p>
              </div>
            </div>

            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", textAlign: "center", marginTop: "16px" }}>
              Source: {result.source === "auto" ? "Auto-scraped ✅" : "Manual input 📝"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;