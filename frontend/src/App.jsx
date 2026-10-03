import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);

  // Load previous scan history from localStorage
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem("phishguard_history");

    return savedHistory
      ? JSON.parse(savedHistory)
      : [];
  });

  const [loading, setLoading] = useState(false);


  // Save history whenever it changes
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
        "http://127.0.0.1:8000/predict",
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


      // Show current result
      setResult(data);


      // Save scan in history
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

    }

    catch (error) {

      console.error(error);

      alert(
        "Unable to connect to PhishGuard backend"
      );

    }

    setLoading(false);
  };


  // =========================
  // DASHBOARD STATISTICS
  // =========================

  const totalScans = history.length;


  const phishingCount = history.filter(
    (item) =>
      item.prediction === "Phishing"
  ).length;


  const legitimateCount = history.filter(
    (item) =>
      item.prediction === "Legitimate"
  ).length;


  const highRiskCount = history.filter(
    (item) =>
      item.risk_level === "High"
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
  // UI
  // =========================

  return (

    <div className="app">


      {/* =========================
          NAVBAR
      ========================= */}

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


      {/* =========================
          MAIN
      ========================= */}

      <main>


        {/* =========================
            HERO
        ========================= */}

        <section className="hero">


          <div className="badge">
            ⚡ AI-POWERED URL SECURITY
          </div>


          <h1>

            Detect <span>Phishing</span>

            <br />

            Before It Hurts

          </h1>


          <p className="hero-text">

            Analyze suspicious URLs using machine learning
            and identify potential phishing threats in seconds.

          </p>


          {/* =========================
              SCANNER
          ========================= */}

          <div className="scanner">


            <div className="input-wrapper">

              <span className="link-icon">
                🔗
              </span>


              <input

                type="text"

                placeholder="Enter a suspicious URL..."

                value={url}

                onChange={(e) =>
                  setUrl(e.target.value)
                }

                onKeyDown={(e) => {

                  if (e.key === "Enter") {
                    scanURL();
                  }

                }}

              />

            </div>


            <button

              className="scan-button"

              onClick={scanURL}

              disabled={loading}

            >

              {loading
                ? "Scanning..."
                : "Scan URL →"}

            </button>


          </div>


          <p className="privacy">

            🔒 Your URL is analyzed securely.
            No browsing activity is stored.

          </p>


        </section>



        {/* =========================
            DASHBOARD
        ========================= */}

        <section className="dashboard">


          <div className="dashboard-title">

            <div>

              <p className="section-label">
                SECURITY DASHBOARD
              </p>


              <h2>
                Scan Statistics
              </h2>

            </div>

          </div>



          <div className="stats-grid">


            {/* TOTAL SCANS */}

            <div className="stat-card">

              <div className="stat-icon">
                🔍
              </div>


              <div>

                <span>
                  Total Scans
                </span>


                <strong>
                  {totalScans}
                </strong>

              </div>

            </div>



            {/* PHISHING */}

            <div className="stat-card phishing-stat">

              <div className="stat-icon">
                ⚠️
              </div>


              <div>

                <span>
                  Phishing Detected
                </span>


                <strong>
                  {phishingCount}
                </strong>

              </div>

            </div>



            {/* LEGITIMATE */}

            <div className="stat-card legitimate-stat">

              <div className="stat-icon">
                ✓
              </div>


              <div>

                <span>
                  Legitimate URLs
                </span>


                <strong>
                  {legitimateCount}
                </strong>

              </div>

            </div>



            {/* HIGH RISK */}

            <div className="stat-card highrisk-stat">

              <div className="stat-icon">
                🚨
              </div>


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



        {/* =========================
            CURRENT RESULT
        ========================= */}

        {result && (

          <section
            className={`result-card ${getRiskClass(
              result.risk_level
            )}`}
          >


            <div className="result-header">


              <div>

                <p className="result-label">
                  LATEST SCAN RESULT
                </p>


                <h2>

                  {result.prediction === "Phishing"

                    ? "⚠️ Phishing Detected"

                    : "✓ URL Appears Legitimate"}

                </h2>

              </div>



              <div
                className={`risk-badge ${getRiskClass(
                  result.risk_level
                )}`}
              >

                {result.risk_level} Risk

              </div>


            </div>



            {/* URL */}

            <div className="url-display">

              <span>
                URL
              </span>


              <p>
                {result.url}
              </p>

            </div>



            {/* METRICS */}

            <div className="result-grid">


              <div className="metric">

                <span>
                  Risk Score
                </span>


                <strong>

                  {result.risk_score}

                  <small>
                    /100
                  </small>

                </strong>

              </div>



              <div className="metric">

                <span>
                  Prediction
                </span>


                <strong>
                  {result.prediction}
                </strong>

              </div>



              <div className="metric">

                <span>
                  Risk Level
                </span>


                <strong>
                  {result.risk_level}
                </strong>

              </div>


            </div>



            {/* SECURITY ANALYSIS */}

            <div className="reasons">


              <h3>
                🔍 Security Analysis
              </h3>


              <ul>

                {result.reasons.map(
                  (reason, index) => (

                    <li key={index}>

                      <span>
                        •
                      </span>

                      {reason}

                    </li>

                  )
                )}

              </ul>


            </div>


          </section>

        )}



        {/* =========================
            SCAN HISTORY
        ========================= */}

        <section className="history-section">


          <div className="history-header">


            <div>

              <p className="section-label">
                ACTIVITY
              </p>


              <h2>
                Scan History
              </h2>

            </div>


            <span className="scan-count">

              {history.length} scans

            </span>


          </div>



          {/* NO HISTORY */}

          {history.length === 0 ? (

            <div className="empty-history">


              <div className="empty-icon">
                🔍
              </div>


              <h3>
                No scans yet
              </h3>


              <p>
                Enter a URL above to start
                analyzing suspicious links.
              </p>


            </div>

          ) : (


            /* HISTORY LIST */

            <div className="history-list">


              {history.map((item) => (


                <div
                  className="history-item"
                  key={item.id}
                >


                  {/* URL */}

                  <div className="history-url">


                    <span className="history-link-icon">
                      🔗
                    </span>


                    <div>

                      <p>
                        {item.url}
                      </p>


                      <small>
                        {item.time}
                      </small>

                    </div>


                  </div>



                  {/* PREDICTION */}

                  <div
                    className={`history-prediction ${getRiskClass(
                      item.risk_level
                    )}`}
                  >

                    {item.prediction}

                  </div>



                  {/* SCORE */}

                  <div className="history-score">

                    <span>
                      Risk
                    </span>


                    <strong>
                      {item.risk_score}/100
                    </strong>

                  </div>



                  {/* RISK */}

                  <div
                    className={`history-risk ${getRiskClass(
                      item.risk_level
                    )}`}
                  >

                    {item.risk_level}

                  </div>


                </div>

              ))}


            </div>

          )}


        </section>



        {/* =========================
            FEATURES
        ========================= */}

        <section className="features">


          <div className="feature">

            <div className="feature-icon">
              🤖
            </div>


            <h3>
              AI Detection
            </h3>


            <p>

              Machine learning analyzes URL
              characteristics to detect phishing patterns.

            </p>

          </div>



          <div className="feature">

            <div className="feature-icon">
              ⚡
            </div>


            <h3>
              Instant Analysis
            </h3>


            <p>

              Get a phishing prediction and risk score
              within seconds.

            </p>

          </div>



          <div className="feature">

            <div className="feature-icon">
              🔐
            </div>


            <h3>
              Security Insights
            </h3>


            <p>

              Understand why a URL was classified
              as suspicious or legitimate.

            </p>

          </div>


        </section>


      </main>



      {/* =========================
          FOOTER
      ========================= */}

      <footer>

        <p>
          PhishGuard AI © 2026
        </p>


        <p>
          AI-Based Phishing URL Detection System
        </p>

      </footer>


    </div>

  );
}


export default App;