import { useEffect, useState, useRef } from 'react';
import { Zap, Activity, Scan } from 'lucide-react';
import { get } from '../auth/api';
import { showToast } from '../common/Toast';
import { useLoader } from '../loader/Loadercontext';
import SecurityScanCard from './SecurityScanCard';
import TargetModal from './TargetModal';

export default function TestManagement() {
  const [tests, setTests] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const [type, setType] = useState("fuzz");

  const [loadTestData, setLoadTestData] = useState(null);
  const [fuzzTestData, setFuzzTestData] = useState(null);
  const [securityTestData, setSecurityTestData] = useState(null);

  // NEW: Image URL states
  const [fuzzGraphUrl, setFuzzGraphUrl] = useState(null);
  const [loadGraphUrl, setLoadGraphUrl] = useState(null);
  const [securityGraphUrl, setSecurityGraphUrl] = useState(null);

  const [activeReportType, setActiveReportType] = useState("fuzz");

  // Progress state (persistent)
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("testProgress");
    return saved ? JSON.parse(saved) : { fuzz: 0, load: 0, security: 0 };
  });

  const [isRunning, setIsRunning] = useState(() => {
    const saved = localStorage.getItem("testRunning");
    return saved
      ? JSON.parse(saved)
      : { fuzz: false, load: false, security: false };
  });

  // Error tracking for failed tests
  const [testError, setTestError] = useState({
    fuzz: false,
    load: false,
    security: false,
  });

  const timers = useRef({}); // to store intervals

  // Memory leak cleanup for object URLs
  const prevUrls = useRef([]);
  useEffect(() => {
    return () => {
      prevUrls.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem("testProgress", JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem("testRunning", JSON.stringify(isRunning));
  }, [isRunning]);

  // Function to start progress for each test type
  const startProgress = (type, expectedMinutes) => {
    setIsRunning((prev) => ({ ...prev, [type]: true }));
    setProgress((prev) => ({ ...prev, [type]: 0 }));
    setTestError((prev) => ({ ...prev, [type]: false }));

    const totalDuration = expectedMinutes * 60 * 1000;
    const startTime = Date.now();

    localStorage.setItem(`startTime_${type}`, startTime.toString());
    localStorage.setItem(`duration_${type}`, totalDuration.toString());

    if (timers.current[type]) clearInterval(timers.current[type]);

    timers.current[type] = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let newProgress = Math.min((elapsed / totalDuration) * 100, 100);

      if (newProgress > 90 && newProgress < 100) {
        newProgress = 90 + (newProgress - 90) * 0.5;
      }

      setProgress((prev) => ({ ...prev, [type]: newProgress }));

      if (newProgress >= 100) {
        clearInterval(timers.current[type]);
        setIsRunning((p) => ({ ...p, [type]: false }));
      }
    }, 1000);

    return () => stopProgress(type);
  };

  // New function to safely stop progress
  const stopProgress = (type, error = false) => {
    if (timers.current[type]) {
      clearInterval(timers.current[type]);
      delete timers.current[type];
    }

    setIsRunning((prev) => ({ ...prev, [type]: false }));
    setProgress((prev) => ({
      ...prev,
      [type]: error ? 0 : prev[type],
    }));

    if (error) {
      setTestError((prev) => ({ ...prev, [type]: true }));
    }

    localStorage.removeItem(`startTime_${type}`);
    localStorage.removeItem(`duration_${type}`);
  };

  // Resume progress
  useEffect(() => {
    ["fuzz", "load", "security"].forEach((type) => {
      const startTime = localStorage.getItem(`startTime_${type}`);
      const duration = localStorage.getItem(`duration_${type}`);
      if (
        startTime &&
        duration &&
        JSON.parse(localStorage.getItem("testRunning") || "{}")[type]
      ) {
        const elapsed = Date.now() - parseInt(startTime);
        let newProgress = Math.min((elapsed / parseInt(duration)) * 100, 100);
        if (newProgress < 100)
          startProgress(type, parseInt(duration) / 60000);
      }
    });
  }, []);

  const fetchData = async () => {
    showLoader();
    try {
      const response = await get("api/dashboard/");
      setTests(response.total_active_targets || 0);
    } catch (error) {
      console.error("Error fetching tests:", error);
      showToast("Failed to fetch data", "error");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const testData =
    activeReportType === "fuzz"
      ? fuzzTestData
      : activeReportType === "load"
        ? loadTestData
        : securityTestData;

  const graphUrl =
    activeReportType === "fuzz"
      ? fuzzGraphUrl
      : activeReportType === "load"
        ? loadGraphUrl
        : securityGraphUrl;

  const reportTitle =
    activeReportType === "fuzz"
      ? "Fuzz Test Reports"
      : activeReportType === "load"
        ? "Load Test Reports"
        : "Security Test Reports";

  // NEW: Receive PNG image from modal
  const setGraphData = (type, data) => {
    const prevUrl = type === 'fuzz' ? fuzzGraphUrl
                  : type === 'load' ? loadGraphUrl
                  : securityGraphUrl;

    if (prevUrl) {
      URL.revokeObjectURL(prevUrl);
      prevUrls.current = prevUrls.current.filter(u => u !== prevUrl);
    }

    if (type === 'fuzz') setFuzzGraphUrl(data.url);
    if (type === 'load') setLoadGraphUrl(data.url);
    if (type === 'security') setSecurityGraphUrl(data.url);

    prevUrls.current.push(data.url);
    console.log(`[TestManagement] ${type} graph image ready`);
  };

  return (
    <div className="admin-content">
      <div className="section-header">
        <h2>Automated Security Testing</h2>
        <p>Fuzz testing and load testing performed automatically by AI agents</p>
      </div>

      {/* Testing Cards */}
      <div className="testing-grid">
        {/* Fuzz */}
        <div className="testing-card testing-fuzz">
          <div className="card-header">
            <h3><Zap className="card-icon" /> Fuzz Testing</h3>
            <p>Automated input fuzzing for vulnerability discovery</p>
          </div>
          <button
            className="btn btn-warning btn-full"
            onClick={() => {
              setModalOpen(true);
              setType("fuzz");
            }}
          >
            <Zap className="btn-icon" /> Start Fuzz Test
          </button>
        </div>

        {/* Load */}
        <div className="testing-card testing-load">
          <div className="card-header">
            <h3><Activity className="card-icon" /> Load Testing</h3>
            <p>Performance testingomass and stress testing automation</p>
          </div>
          <button
            className="btn btn-success btn-full"
            onClick={() => {
              setModalOpen(true);
              setType("load");
            }}
          >
            <Activity className="btn-icon" /> Start Load Test
          </button>
        </div>

        {/* Security */}
        <div className="testing-card testing-security">
          <div className="card-header">
            <h3><Scan className="card-icon" /> Security Testing</h3>
            <p>AI-powered security vulnerability scanning</p>
          </div>
          <button
            className="btn btn-primary btn-full"
            onClick={() => {
              setModalOpen(true);
              setType("security");
            }}
          >
            <Scan className="btn-icon" /> Start Security Test
          </button>
        </div>
      </div>

      {/* Active Tests */}
      <div className="tests-card">
        <div className="card-header">
          <h3>Active Tests</h3>
          <p>Currently running automated security tests</p>
        </div>
        <div className="tests-list">
          <p><strong>Total Active Tests:</strong> {tests}</p>

          {["fuzz", "load", "security"].map((t) =>
            isRunning[t] ? (
              <div key={t} className="progress-item">
                <p>
                  {t.toUpperCase()} Test — {progress[t].toFixed(0)}%
                </p>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${progress[t]}%`,
                      background: testError[t]
                        ? "#ef4444"
                        : t === "fuzz"
                          ? "#f59e0b"
                          : t === "load"
                            ? "#10b981"
                            : "#3b82f6",
                      transition: "width 1s linear",
                    }}
                  />
                </div>
                {testError[t] && (
                  <p style={{ color: "red", marginTop: "4px" }}>
                    {t.toUpperCase()} Test Failed
                  </p>
                )}
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Reports */}
      <div className="tests-card">
        <div className="card-header">
          <h3>{reportTitle}</h3>
          <p>Summary of completed {activeReportType} testing results</p>

          <div className="report-toggle">
            <button
              className={`btn btn-outline ${activeReportType === "fuzz" ? "btn-active" : ""}`}
              onClick={() => setActiveReportType("fuzz")}
            >
              Fuzz Test
            </button>
            <button
              className={`btn btn-outline ${activeReportType === "load" ? "btn-active" : ""}`}
              onClick={() => setActiveReportType("load")}
            >
              Load Test
            </button>
            <button
              className={`btn btn-outline ${activeReportType === "security" ? "btn-active" : ""}`}
              onClick={() => setActiveReportType("security")}
            >
              Security Test
            </button>
          </div>
        </div>

        {/* NEW: PNG Graph Display */}
        {graphUrl && (
          <div className="graph-container" style={{ margin: '1.5rem 0', textAlign: 'center' }}>
            <h4 style={{ marginBottom: '0.75rem', fontWeight: '600' }}>
              {activeReportType.toUpperCase()} Test Graph
            </h4>
            <img
              src={graphUrl}
              alt={`${activeReportType} test graph`}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #ddd',
              }}
            />
          </div>
        )}

        <div className="tests-list">
          {!testData ? (
            <p>No {activeReportType} test reports available.</p>
          ) : activeReportType === "security" ? (
            <table className="test-results-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vulnerability Type</th>
                  <th>Status</th>
                  <th>Vulnerability Counts</th>
                  <th>Accuracy</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(testData).map((key, index) => {
                  const item = testData[key];
                  return (
                    <tr key={item.id || key}>
                      <td>{index + 1}</td>
                      <td>{key}</td>
                      <td style={{ color: item.status === "PASS" ? "green" : "red", fontWeight: "bold" }}>
                        {item.status || "N/A"}
                      </td>
                      <td>
                        Critical: {item?.vulnerability_counts?.critical ?? '0'} <br />
                        High: {item?.vulnerability_counts?.high ?? '0'} <br />
                        Medium: {item?.vulnerability_counts?.medium ?? '0'} <br />
                        Low: {item?.vulnerability_counts?.low ?? '0'} <br />
                        None: {item?.vulnerability_counts?.none ?? '0'}
                      </td>
                      <td style={{ color: item.accuracy_score >= 80 ? "green" : "red" }}>
                        {item.accuracy_score ? `${item.accuracy_score}%` : "-"}
                      </td>
                      <td>{item.summary || "No summary available"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : activeReportType === "fuzz" ? (
            <table className="test-results-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Accuracy</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(testData).map((key) => {
                  const item = testData[key];
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td style={{ color: item.status === "PASS" ? "green" : "red", fontWeight: "bold" }}>
                        {item.status}
                      </td>
                      <td style={{ color: item.accuracy_score >= 80 ? "green" : "red" }}>
                        {item.accuracy_score ? `${item.accuracy_score}%` : "-"}
                      </td>
                      <td>{item.summary || "No summary available"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="test-results-table">
              <thead>
                <tr>
                  <th>Load Score</th>
                  <th>Load Weight</th>
                  <th>Accuracy Score</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{testData.load_score || "-"}</td>
                  <td>{testData.load_weight || "-"}</td>
                  <td style={{
                    color: testData.accuracy_score === "-" ? "black" : testData.accuracy_score > 50 ? "green" : "red",
                  }}>
                    {testData.accuracy_score ? `${testData.accuracy_score}%` : "-"}
                  </td>
                  <td>{testData.summary || "No summary available"}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <TargetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={type}
        setFuzzTestData={setFuzzTestData}
        setLoadTestData={setLoadTestData}
        setSecurityTestData={setSecurityTestData}
        onSubmit={fetchData}
        startProgress={startProgress}
        stopProgress={stopProgress}
        setGraphData={setGraphData}
      />
    </div>
  );
}