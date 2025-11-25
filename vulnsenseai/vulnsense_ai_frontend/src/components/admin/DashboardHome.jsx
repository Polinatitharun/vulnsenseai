import { useEffect, useState } from 'react';
import { Globe, Activity, FileCode, Shield, Bot, CheckCircle, Crown, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { get } from '../auth/api';

// Charts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

export default function DashboardHome() {
  const [targets, setTargets] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [auditReports, setAuditReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  // ⭐ MOCK DATA FOR DEMONSTRATION
  const generateMockAnalysisData = () => {
    const mockModels = [
      { id: 1, name: 'Llama-3-8B', overall_score: 92.5, security_score: 95.0, fuzz_score: 90.0, load_performance: 92.0, risk_score: 0.05, grade: 'A+', rating: 'Excellent' },
      { id: 2, name: 'Mistral-7B', overall_score: 85.3, security_score: 80.0, fuzz_score: 85.0, load_performance: 91.0, risk_score: 0.20, grade: 'B', rating: 'Good' },
      { id: 3, name: 'Gemma-7B', overall_score: 78.2, security_score: 75.0, fuzz_score: 70.0, load_performance: 90.0, risk_score: 0.25, grade: 'C', rating: 'Average' },
      { id: 4, name: 'Phi-3-Mini', overall_score: 65.8, security_score: 60.0, fuzz_score: 65.0, load_performance: 72.0, risk_score: 0.40, grade: 'D', rating: 'Below Average' }
    ];

    const rankedModels = mockModels.map((model, index) => ({
      ...model,
      target_id: model.id,
      model_name: model.name,
      rank: index + 1,
      percentile: 100 - (index * 25)
    }));

    return {
      analysis_type: 'model_comparison',
      total_models_compared: 4,
      comparison_timestamp: new Date().toISOString(),
      models: rankedModels,
      summary: {
        best_model: rankedModels[0],
        worst_model: rankedModels[3],
        average_score: 80.45
      }
    };
  };

  const generateMockStats = () => ({
    total_active_targets: 4,
    total_running_tests: 2,
    total_generated_reports: 8,
    total_auto_sanitised: 3,
    total_targets: 4
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Try to fetch real data first
        const [targetsData, activityData, auditsData, dashboardData, analysisData] = await Promise.all([
          get('api/models/').catch(() => []),
          get('api/activity/').catch(() => []),
          get('api/test/report/').catch(() => []),
          get('api/dashboard/').catch(() => generateMockStats()),
          get('api/analysis/?comparison=true').catch(() => generateMockAnalysisData())
        ]);

        setTargets(targetsData || []);
        setTestResults(activityData || []);
        setAuditReports(auditsData || []);
        setStats(dashboardData);
        setAnalysisData(analysisData);

        // Check if we're using mock data
        if (!targetsData || targetsData.length === 0) {
          setUsingMockData(true);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to mock data
        setStats(generateMockStats());
        setAnalysisData(generateMockAnalysisData());
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!stats) return <div className="error">No data available</div>;

  // ⭐ ANALYSIS DATA PREPARATION
  const modelComparisonData = analysisData?.models || [];
  const bestModel = analysisData?.summary?.best_model;

  // Overall Scores Bar Chart
  const overallScoresData = modelComparisonData.map(model => ({
    name: model.model_name,
    Overall: model.overall_score,
    Security: model.security_score,
    Robustness: model.fuzz_score,
    Performance: model.load_performance
  }));

  // Grade Distribution Pie Chart
  const gradeDistribution = modelComparisonData.reduce((acc, model) => {
    acc[model.grade] = (acc[model.grade] || 0) + 1;
    return acc;
  }, {});
  const gradeData = Object.keys(gradeDistribution).map(grade => ({
    name: grade,
    value: gradeDistribution[grade],
    color: getGradeColor(grade)
  }));

  // Risk Analysis Data
  const riskData = modelComparisonData.map(model => ({
    name: model.model_name,
    Risk: (model.risk_score * 100).toFixed(1),
    Security: model.security_score
  }));

  // Performance Trend Data
  const performanceTrendData = modelComparisonData
    .sort((a, b) => a.rank - b.rank)
    .map(model => ({
      name: `#${model.rank} ${model.model_name}`,
      Score: model.overall_score,
      Security: model.security_score,
      Robustness: model.fuzz_score,
      Performance: model.load_performance
    }));

  // Helper function for grade colors
  function getGradeColor(grade) {
    const colors = {
      'A+': '#10B981', 'A': '#10B981', 'B': '#3B82F6', 
      'C': '#F59E0B', 'D': '#EF4444', 'F': '#DC2626'
    };
    return colors[grade] || '#6B7280';
  }

  // ⭐ EXISTING SYSTEM DATA
  const barData = [
    { name: "Active Targets", count: stats.total_active_targets },
    { name: "Running Tests", count: stats.total_running_tests },
    { name: "Audit Reports", count: stats.total_generated_reports },
  ];

  const autoSanitData = [
    { name: "Auto Sanitized", value: stats.total_auto_sanitised },
    { name: "Not Sanitized", value: stats.total_targets - stats.total_auto_sanitised },
  ];

  const COLORS = ["#4CAF50", "#F44336"];

  const activityLineData = testResults.map((t) => ({
    date: new Date(t.start_time).toLocaleDateString(),
    findings: t.findings || 0,
  }));

  return (
    <div className="admin-content">

      {/* Demo Data Notice */}
      {usingMockData && (
        <div className="demo-notice">
          <AlertTriangle size={20} />
          <span>Showing demonstration data. Run tests to see your actual model performance.</span>
        </div>
      )}

      {/* ===================== 🏆 MODEL ANALYSIS GRAPHS ===================== */}
      
      {analysisData && modelComparisonData.length > 0 && (
        <>
          <h1>🏆 Model Performance Analysis</h1>
          <p>Comprehensive comparison of all tested AI models</p>

          {/* 🌟 Best Model Highlight Card */}
          {bestModel && (
            <div className="winner-card">
              <div className="winner-header">
                <Crown className="winner-icon" />
                <h2>Best Performing Model</h2>
                <div className="winner-badge">Rank #{bestModel.rank}</div>
              </div>
              <div className="winner-content">
                <div className="winner-model">
                  <h3>{bestModel.model_name}</h3>
                  <div className="winner-score">
                    <span className="score-number">{bestModel.overall_score}</span>
                    <span className="score-label">/100</span>
                  </div>
                  <div className="winner-grade">{bestModel.grade} - {bestModel.rating}</div>
                </div>
                <div className="winner-metrics">
                  <div className="metric">
                    <span className="metric-label">Security</span>
                    <span className="metric-value">{bestModel.security_score}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Robustness</span>
                    <span className="metric-value">{bestModel.fuzz_score}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Performance</span>
                    <span className="metric-value">{bestModel.load_performance}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Risk Level</span>
                    <span className={`metric-value risk-${bestModel.risk_score < 0.3 ? 'low' : bestModel.risk_score < 0.6 ? 'medium' : 'high'}`}>
                      {(bestModel.risk_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🌟 Model Comparison Graphs Row 1 */}
          <div className="graph-row">
            {/* Overall Scores Bar Chart */}
            <div className="graph-card large">
              <h3>📊 Overall Model Scores Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overallScoresData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Overall" fill="#4F46E5" name="Overall Score" />
                  <Bar dataKey="Security" fill="#10B981" name="Security Score" />
                  <Bar dataKey="Robustness" fill="#F59E0B" name="Robustness Score" />
                  <Bar dataKey="Performance" fill="#EF4444" name="Performance Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Grade Distribution Pie Chart */}
            <div className="graph-card">
              <h3>🎓 Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {gradeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 🌟 Model Comparison Graphs Row 2 */}
          <div className="graph-row">
            {/* Performance Trend Area Chart */}
            <div className="graph-card large">
              <h3>📈 Performance Trend by Rank</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Score" stackId="1" stroke="#4F46E5" fill="#4F46E5" name="Overall Score" />
                  <Area type="monotone" dataKey="Security" stackId="2" stroke="#10B981" fill="#10B981" name="Security" />
                  <Area type="monotone" dataKey="Robustness" stackId="3" stroke="#F59E0B" fill="#F59E0B" name="Robustness" />
                  <Area type="monotone" dataKey="Performance" stackId="4" stroke="#EF4444" fill="#EF4444" name="Performance" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Analysis Bar Chart */}
            <div className="graph-card">
              <h3>⚠️ Risk vs Security Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Risk" fill="#EF4444" name="Risk Score %" />
                  <Bar dataKey="Security" fill="#10B981" name="Security Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 🌟 Detailed Model Comparison Table */}
          <div className="table-card">
            <h3>📋 Detailed Model Comparison</h3>
            <div className="metrics-table">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Model Name</th>
                    <th>Overall Score</th>
                    <th>Grade</th>
                    <th>Security</th>
                    <th>Robustness</th>
                    <th>Performance</th>
                    <th>Risk Score</th>
                    <th>Percentile</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {modelComparisonData.map(model => (
                    <tr key={model.target_id} className={model.rank === 1 ? 'winner-row' : ''}>
                      <td>
                        <div className="rank-badge">
                          #{model.rank}
                          {model.rank === 1 && <Crown size={16} />}
                        </div>
                      </td>
                      <td className="model-name">{model.model_name}</td>
                      <td>
                        <div className="score-cell">
                          <span className="score-value">{model.overall_score}</span>
                          <div className="score-bar">
                            <div 
                              className="score-fill" 
                              style={{ width: `${model.overall_score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`grade-badge grade-${model.grade}`}>
                          {model.grade}
                        </span>
                      </td>
                      <td>{model.security_score}</td>
                      <td>{model.fuzz_score}</td>
                      <td>{model.load_performance}</td>
                      <td>
                        <span className={`risk-badge risk-${model.risk_score < 0.3 ? 'low' : model.risk_score < 0.6 ? 'medium' : 'high'}`}>
                          {(model.risk_score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td>{model.percentile}%</td>
                      <td>
                        <span className={`status-badge status-${model.rating.toLowerCase().replace(' ', '-')}`}>
                          {model.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Call to Action for Real Data */}
          {usingMockData && (
            <div className="cta-card">
              <div className="cta-content">
                <Star className="cta-icon" />
                <div>
                  <h3>Ready to Test Your Models?</h3>
                  <p>Run security scans, fuzz tests, and load tests on your AI models to see real performance data here.</p>
                </div>
                <button className="cta-button" onClick={() => window.location.href = '/testing'}>
                  Start Testing
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===================== 📊 EXISTING SYSTEM ANALYTICS ===================== */}

      <h2 style={{ marginTop: "30px" }}>📊 System Analytics</h2>
      <p>Visual insights from your security system</p>

      {/* Existing Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Targets</span>
            <Globe className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.total_active_targets}</div>
            <p className="stat-description">Total active targets</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Running Tests</span>
            <Activity className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.total_running_tests}</div>
            <p className="stat-description">Currently running fuzz tests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Generated Reports</span>
            <FileCode className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.total_generated_reports}</div>
            <p className="stat-description">Security audit reports ready</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Auto Sanitization</span>
            <Shield className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.total_auto_sanitised}</div>
            <p className="stat-description">Targets with sanitization</p>
          </div>
        </div>
      </div>

      {/* Existing Graphs */}
      <div className="graph-row">
        <div className="graph-card">
          <h3>System Summary</h3>
          <BarChart width={380} height={260} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4F46E5" />
          </BarChart>
        </div>

        <div className="graph-card">
          <h3>Auto Sanitization Ratio</h3>
          <PieChart width={380} height={260}>
            <Pie
              data={autoSanitData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label
            >
              {autoSanitData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="graph-card">
          <h3>AI Activity Over Time</h3>
          <LineChart width={380} height={260} data={activityLineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="findings" stroke="#2563EB" strokeWidth={3} />
          </LineChart>
        </div>
      </div>
    </div>
  );
}