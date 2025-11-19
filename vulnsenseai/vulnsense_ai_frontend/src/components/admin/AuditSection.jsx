import { useEffect, useState } from 'react';
import {
  FileCode,
  RefreshCw,
  Eye,
  Download,
  BarChart3,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { get, post } from '../auth/api';
import { useLoader } from '../loader/Loadercontext';

export default function AuditSection() {
  const [targets, setTargets] = useState([]);
  const [reportType, setReportType] = useState(localStorage.getItem("reportType") || "fuzz_testing");
  const [selectedTarget, setSelectedTarget] = useState(localStorage.getItem("selectedTarget") || "");
  const [pdfUrl, setPdfUrl] = useState(localStorage.getItem("pdfUrl") || null);
  const { showLoader, hideLoader } = useLoader();
  const [showSecurity, setShowSecurity] = useState(false);
  const [securityResult, setSecurityResult] = useState({});
  const [completedTasks, setCompletedTasks] = useState([]);
  const [fetchComplete, setFetchComplete] = useState(false);
  const [showDownloadicons, setShowDownloadicons] = useState(false);

  // ---------- Load cached data ----------
  useEffect(() => {
    const cachedTargets = localStorage.getItem("targets");
    if (cachedTargets) {
      try {
        const parsedTargets = JSON.parse(cachedTargets);
        setTargets(parsedTargets);
      } catch {
        localStorage.removeItem("targets");
      }
    } else {
      fetchTargets();
    }
  }, []);

  // ---------- Fetch targets from API ----------
  const fetchTargets = async () => {
    showLoader();
    try {
      const data = await get('/api/models/');
      setTargets(data);
      localStorage.setItem("targets", JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching targets:', error);
    } finally {
      hideLoader();
    }
  };

  // ---------- Generate Report ----------
  const generateReports = async (id, type) => {
    try {
      setShowDownloadicons(false); // hide until ready
      showLoader(); // show global loader if available

      let response;
      if (type === "fuzz_testing") {
        response = await get(`/api/fuzzreport/${id}`, { responseType: "blob" });
      } else if (type === "load_testing") {
        response = await get(`/api/loadpdf/${id}`, { responseType: "blob" });
      } else if (type === "security_scan") {
        response = await get(`/api/securitypdf/${id}`, { responseType: "blob" });
      }

      if (!response) throw new Error("No response from server");

      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      localStorage.setItem("pdfUrl", url);

      console.log("✅ PDF ready at:", url);

      // show buttons only when ready
      setShowDownloadicons(true);
    } catch (err) {
      console.error("Error generating report:", err);
    } finally {
      hideLoader();
    }
  };


  const generate = async () => {
    console.log(reportType);
    if (reportType === 'security_scan') {
      setShowSecurity(true);
    }

    console.log(selectedTarget);

    const response = await post('/api/testids/', { target: selectedTarget, test_type: reportType });
    setFetchComplete(true);
    console.log('Full Response:', response);

    const filteredData = response.filter(item =>
      item.test === 'security_scan' &&
      item.test_status === 'completed' &&
      item.results &&
      Object.keys(item.results).length > 0 &&
      item.results.hasOwnProperty('supplyChain')
    );

    console.log('Filtered Data:', filteredData);
    setCompletedTasks(response);
  };

  const fetchSecurityResultsscores = async (id) => {
    try {
      const response = await get(`/api/securityanalytics/${id}`);
      setSecurityResult(response);
      console.log("Security analytics:", response);
    } catch (error) {
      console.error("Error fetching security results:", error);
    }
  };

  // ---------- View PDF ----------
  const handleViewPDF = () => {
    if (pdfUrl) window.open(pdfUrl, "_blank");
  };

  // ---------- Download PDF ----------
  const handleDownloadPDF = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${reportType}_report.pdf`;
    a.click();
  };

  // ---------- Sync selections to localStorage ----------
  useEffect(() => {
    localStorage.setItem("reportType", reportType);
  }, [reportType]);

  useEffect(() => {
    localStorage.setItem("selectedTarget", selectedTarget);
  }, [selectedTarget]);

  return (
    <div className="admin-content">
      <div className="section-header">
        <h2>Security Auditing & Reports</h2>
        <p>AI-generated security analysis and downloadable PDF reports</p>
      </div>

      {/* Generate Report Section */}
      <div className="audit-card">
        <div className="card-header">
          <h3><FileCode className="card-icon" /> Generate New Audit Report</h3>
          <p>Create comprehensive security audit for your targets</p>
        </div>

        <div className="audit-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="target-select">Select Target</label>
              <select
                id="target-select"
                className="form-select"
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
              >
                <option value="">Choose a target...</option>
                {targets.map((target) => (
                  <option key={target.id} value={target.id}>{target.model_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="report-type">Report Type</label>
              <select
                id="report-type"
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="fuzz_testing">Fuzz Testing</option>
                <option value="load_testing">Load Testing</option>
                <option value="security_scan">Security Testing</option>
              </select>
            </div>
          </div>

          <button className="btn btn-purple" onClick={generate}>
            <RefreshCw className="btn-icon" /> Generate Audit Report
          </button>
        </div>
      </div>

      {/* Completed Reports */}
      {fetchComplete && (
        <div className="audit-section">
          <h1 className="audit-title">Completed Tests</h1>

          {completedTasks.map((task) => (
            <div className="audit-card-wrapper" key={task.id}>
              <div className="audit-card">
                <h2 className="audit-card-title">{task.target.model_name}</h2>
                <p className="audit-card-test">{task.test}</p>

                <div className="audit-card-buttons">
                  <button
                    className="audit-btn audit-btn-report"
                    onClick={() => generateReports(task.id, task.test)}
                  >
                    View/Download Report
                  </button>

                  <button
                    className="audit-btn audit-btn-results"
                    onClick={() => fetchSecurityResultsscores(task.id)}
                  >
                    Show Results
                  </button>
                </div>

                {pdfUrl && showDownloadicons && (
                  <div className="audit-pdf-actions">
                    <button
                      className="audit-btn audit-btn-view"
                      onClick={handleViewPDF}
                    >
                      <Eye className="audit-btn-icon" /> View PDF
                    </button>

                    <button
                      className="audit-btn audit-btn-download"
                      onClick={handleDownloadPDF}
                    >
                      <Download className="audit-btn-icon" /> Download PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Analytics Section */}
      {showSecurity && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-header">
              <h3><AlertTriangle className="card-icon" /> Vulnerability Trends</h3>
            </div>
            <div className="analytics-content">
              <div className="trend-item"><span>Critical</span><span className="trend-count trend-critical">{securityResult.critical}</span></div>
              <div className="trend-item"><span>High</span><span className="trend-count trend-high">{securityResult.high}</span></div>
              <div className="trend-item"><span>Medium</span><span className="trend-count trend-medium">{securityResult.medium}</span></div>
              <div className="trend-item"><span>Low</span><span className="trend-count trend-low">{securityResult.low}</span></div>
              <div className="trend-item"><span>None</span><span className="trend-count trend-none">{securityResult.none}</span></div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <h3><BarChart3 className="card-icon" /> Risk Scores</h3>
            </div>
            <div className="analytics-center">
              <div className="metric-large">
                {Number.isFinite(securityResult?.risk_score)
                  ? securityResult.risk_score.toFixed(2)
                  : 'N/A'}
              </div>
              <p>Average Risk Score</p>
              <span>Across all targets</span>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-header">
              <h3><CheckCircle className="card-icon" /> Remediation</h3>
            </div>
            <div className="analytics-center">
              <div className="metric-large">73%</div>
              <p>Auto-Resolved</p>
              <span>Issues fixed by AI</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
