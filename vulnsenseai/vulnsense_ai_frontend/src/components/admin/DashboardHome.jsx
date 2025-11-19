import { useEffect, useState } from 'react';
import { Globe, Activity, FileCode, Shield, Bot, CheckCircle } from 'lucide-react';
import { get } from '../auth/api';

// ⭐ NEW — IMPORT CHARTS
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
} from "recharts";

export default function DashboardHome() {
  const [targets, setTargets] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [auditReports, setAuditReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const targetsData = await get('api/models/');
        setTargets(targetsData);

        const activityData = await get('api/activity/');
        setTestResults(activityData);

        const auditsData = await get('api/test/report/');
        setAuditReports(auditsData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await get('api/dashboard/');
        setStats(response);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!stats) return <p>No data available</p>;

  // ⭐ GRAPH DATA PREPARATION
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

      {/* 🌟 Welcome Card */}
      <div className="welcome-card">
        <p>
          Ready to secure your applications? You have {stats.total_active_targets} active targets,{' '}
          {stats.total_running_tests} tests running, and {stats.total_generated_reports} reports generated.
        </p>
      </div>

      {/* 🌟 Stats Grid */}
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

      {/* ===================== 📊 GRAPH SECTION START ===================== */}

      <h2 style={{ marginTop: "30px" }}>📊 System Analytics</h2>
      <p>Visual insights from your security system</p>

      {/* 🌟 Graph Row */}
      <div className="graph-row">

        {/* 📘 Bar Chart */}
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

        {/* 🟢 Pie Chart */}
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

        {/* 🔵 Line Chart */}
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

      {/* ===================== 📊 GRAPH SECTION END ===================== */}

      {/* 🌟 Activity Logs */}
      <div className="activity-card">
        <div className="card-header">
          <h3>Recent AI Actions</h3>
          <p>Latest automated security actions performed by the AI agent</p>
        </div>
        <div className="activity-list">
          {testResults.map(test => {
            const target = targets.find(t => t.id === test.target);
            return (
              <div key={test.id} className="activity-item activity-success">
                <Bot className="activity-icon" />
                <div className="activity-content">
                  <p>Completed {test.action}</p>
                  <span className="activity-time">
                    {new Date(test.start_time).toLocaleString()} • {test.findings} findings
                  </span>
                </div>
                <CheckCircle className="activity-status" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
