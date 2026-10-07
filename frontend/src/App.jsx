
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load scan history
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem("phishguard_history");

    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // Save history
  useEffect(() => {
    localStorage.setItem(
      "phishguard_history",
      JSON.stringify(history)
    );
  }, [history]);


  // =========================
  // SCAN URL
  // =========================

  const scanURL = async () => {
    if (!url.trim()) {
      alert("Please enter a URL");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "https://phisguardai-1.onrender.com/predict",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            url: url,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();

      // Show result
      setResult(data);

      // Save scan history
      setHistory((previousHistory) => [
        {
          id: Date.now(),
          url: data.url,
          prediction: data.prediction,
          risk_score: data.risk_score,
          risk_level: data.risk_level,
          time: new Date().toLocaleTimeString(),
        },
        ...previousHistory,
      ]);

      // Clear input
      setUrl("");

    } catch (error) {
      console.error("Scan error:", error);

      alert("Unable to connect to PhishGuard backend");
    }

    setLoading(false);
  };


  // =========================
  // DASHBOARD STATISTICS
  // =========================

  const totalScans = history.length;

  const phishingCount = history.filter(
    (item) => item.prediction === "Phishing"
  ).length;

  const legitimateCount = history.filter(
    (item) => item.prediction === "Legitimate"
  ).length;

  const highRiskCount = history.filter(
    (item) => item.risk_level === "High"
  ).length;


  // =========================
  // RISK CLASS
  // =========================

  const getRiskClass = (riskLevel) => {
    if (riskLevel === "High") {
      return "high";
    }

    if (riskLevel === "Medium") {
      return "medium";
    }

    return "low";
  };


  // =========================
  // CLEAR HISTORY
  // =========================

  const clearHistory = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all scan history?"
    );

    if (!confirmClear) {
      return;
    }

    setHistory([]);
    setResult(null);

    localStorage.removeItem("phishguard_history");
  };


  // =========================
  // UI
  // =========================

  return (
    <div className="app">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="logo">

          <span className="logo-icon">
            🛡️
          </span>

          <span>
            PhishGuard <b>AI</b>
          </span>

        </div>

        <div className="nav-status">

          <span className="status-dot"></span>

          System Online

        </div>

      </nav>


      {/* MAIN */}

      <main>

        {/* HERO */}

        <section className="hero">

          <div className="hero-badge">
            🛡️ AI-POWERED SECURITY
          </div>

          <h1>
            Detect Phishing.
            <br />
            <span>Stay Safe.</span>
          </h1>

          <p>
            PhishGuard AI analyzes URLs using machine learning
            to identify potentially malicious and phishing websites.
          </p>

        </section>


        {/* SCANNER */}

        <section className="scanner-card">

          <div className="scanner-header">

            <div>

              <h2>
                Scan a URL
              </h2>

              <p>
                Enter a website URL to check its security risk.
              </p>

            </div>

          </div>


          <div className="scanner-input">

            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(event) =>
                setUrl(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  scanURL();
                }
              }}
            />

            <button
              onClick={scanURL}
              disabled={loading}
            >
              {loading ? "Scanning..." : "Scan URL"}
            </button>

          </div>


          <div className="scanner-info">

            <span>
              🔒 Your URL is analyzed securely
            </span>

            <span>
              ⚡ AI-powered detection
            </span>

          </div>

        </section>


        {/* RESULT */}

        {result && (

          <section className="result-card">

            <div className="result-header">

              <h2>
                Scan Result
              </h2>

              <span
                className={`risk-badge ${getRiskClass(
                  result.risk_level
                )}`}
              >
                {result.risk_level} Risk
              </span>

            </div>


            <div className="result-url">

              <span>
                Scanned URL
              </span>

              <strong>
                {result.url}
              </strong>

            </div>


            <div className="result-main">

              <div className="prediction">

                <span className="result-label">
                  Prediction
                </span>

                <h3
                  className={
                    result.prediction === "Phishing"
                      ? "phishing"
                      : "legitimate"
                  }
                >
                  {result.prediction}
                </h3>

              </div>


              <div className="risk-score">

                <span className="result-label">
                  Risk Score
                </span>

                <div className="score">

                  {result.risk_score}

                  <small>
                    /100
                  </small>

                </div>

              </div>

            </div>


            <div className="reasons">

              <h3>
                Security Analysis
              </h3>

              {result.reasons.map(
                (reason, index) => (

                  <div
                    className="reason"
                    key={index}
                  >

                    <span>
                      ⚠️
                    </span>

                    {reason}

                  </div>

                )
              )}

            </div>

          </section>

        )}


        {/* DASHBOARD */}

        <section className="dashboard">

          <h2>
            Security Dashboard
          </h2>


          <div className="stats-grid">

            <div className="stat-card">

              <span className="stat-icon">
                🔍
              </span>

              <div>

                <span>
                  Total Scans
                </span>

                <strong>
                  {totalScans}
                </strong>

              </div>

            </div>


            <div className="stat-card">

              <span className="stat-icon">
                🚨
              </span>

              <div>

                <span>
                  Phishing Detected
                </span>

                <strong>
                  {phishingCount}
                </strong>

              </div>

            </div>


            <div className="stat-card">

              <span className="stat-icon">
                ✅
              </span>

              <div>

                <span>
                  Legitimate
                </span>

                <strong>
                  {legitimateCount}
                </strong>

              </div>

            </div>


            <div className="stat-card">

              <span className="stat-icon">
                ⚠️
              </span>

              <div>

                <span>
                  High Risk
                </span>

                <strong>
                  {highRiskCount}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* SCAN HISTORY */}

        <section className="history">

          <div className="history-header">

            <div>

              <h2>
                Scan History
              </h2>

              <p>
                Your recent URL scans
              </p>

            </div>


            {history.length > 0 && (

              <button
                className="clear-history"
                onClick={clearHistory}
              >
                Clear History
              </button>

            )}

          </div>


          {history.length === 0 ? (

            <div className="empty-history">

              <span>
                📋
              </span>

              <p>
                No scans yet
              </p>

              <small>
                Your scanned URLs will appear here.
              </small>

            </div>

          ) : (

            <div className="history-list">

              {history.map((item) => (

                <div
                  className="history-item"
                  key={item.id}
                >

                  <div className="history-url">

                    <strong>
                      {item.url}
                    </strong>

                    <span>
                      {item.time}
                    </span>

                  </div>


                  <div className="history-result">

                    <span
                      className={`history-prediction ${
                        item.prediction === "Phishing"
                          ? "phishing"
                          : "legitimate"
                      }`}
                    >
                      {item.prediction}
                    </span>


                    <span
                      className={`history-risk ${getRiskClass(
                        item.risk_level
                      )}`}
                    >
                      {item.risk_level}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>


      {/* FOOTER */}

      <footer>

        <p>
          © 2026 PhishGuard AI
        </p>

        <p>
          AI-Powered Phishing Detection System
        </p>

      </footer>

    </div>
  );
}
export default App;

