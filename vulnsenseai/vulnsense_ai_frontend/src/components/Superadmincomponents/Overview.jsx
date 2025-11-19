import { useEffect, useState } from "react";

import {
  Shield,
  Activity,
  Crown,
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle
} from 'lucide-react';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from 'recharts';

// ⭐ FLAG → CHANGE THIS
const useDummyData = true; // set false to fetch real API data

function Overview() {

  const [stats, setStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    superAdmins: 0,
    todayScans: 0,
    totalScans: 0
  });

  const [activities, setActivities] = useState([]);

  // -----------------------------
  // ⭐ DUMMY DATA
  // -----------------------------
  const dummyStats = {
    totalAdmins: 20,
    activeAdmins: 16,
    superAdmins: 4,
    todayScans: 120,
    totalScans: 12400
  };

  const dummyActivities = [
    { id: 1, action: "add_user", target_user: "admin_1", timestamp: Date.now() },
    { id: 2, action: "delete_user", target_user: "admin_2", timestamp: Date.now() - 10000 },
    { id: 3, action: "activate_user", target_user: "admin_3", timestamp: Date.now() - 30000 }
  ];

  // -----------------------------
  // ⭐ REAL API FETCH (when useDummyData = false)
  // -----------------------------
  const fetchRealData = async () => {
    try {
      // Example: replace with your backend APIs:
      const resStats = await fetch("/api/admin/stats/");
      const statsData = await resStats.json();

      const resAct = await fetch("/api/admin/activity/");
      const actData = await resAct.json();

      setStats(statsData);
      setActivities(actData);

    } catch (err) {
      console.error("Error fetching real data:", err);
    }
  };

  // -----------------------------
  // ⭐ DECISION LOGIC
  // -----------------------------
  useEffect(() => {
    if (useDummyData) {
      setStats(dummyStats);
      setActivities(dummyActivities);
    } else {
      fetchRealData();
    }
  }, []);

  const safeActivities = Array.isArray(activities) ? activities : [];

  // -----------------------------
  // ⭐ GRAPH DATA (auto updates)
  // -----------------------------
  const adminTrend = [
    { month: "Jan", admins: stats.totalAdmins - 4 },
    { month: "Feb", admins: stats.totalAdmins - 2 },
    { month: "Mar", admins: stats.totalAdmins - 1 },
    { month: "Apr", admins: stats.totalAdmins }
  ];

  const scanTrend = [
    { day: "Mon", scans: stats.todayScans + 20 },
    { day: "Tue", scans: stats.todayScans + 15 },
    { day: "Wed", scans: stats.todayScans },
    { day: "Thu", scans: stats.todayScans + 35 },
    { day: "Fri", scans: stats.todayScans + 25 }
  ];

  const roleDistribution = [
    { name: "Admins", value: stats.totalAdmins },
    { name: "Super Admins", value: stats.superAdmins }
  ];

  const COLORS = ["#4F46E5", "#F59E0B"];

  // -----------------------------
  // ⭐ UI BELOW
  // -----------------------------
  return (
    <div className="admin-content">

      <div className="section-header">
        <div>
          <h2>System Overview</h2>
          <p>Monitor administrators and system-wide security operations</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Admins</span>
            <Shield className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalAdmins}</div>
            <p className="stat-description">+12 from last month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Admins</span>
            <Activity className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeAdmins}</div>
            <p className="stat-description">
              {stats.totalAdmins > 0
                ? Math.round((stats.activeAdmins / stats.totalAdmins) * 100) + "% active rate"
                : "No data yet"}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Super Admins</span>
            <Crown className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.superAdmins}</div>
            <p className="stat-description">System administrators</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Today's Scans</span>
            <Activity className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.todayScans}</div>
            <p className="stat-description">
              Total: {stats.totalScans.toLocaleString()}
            </p>
          </div>
        </div>

      </div>

      {/* ACTIVITY LIST */}
      <div className="activity-card">
        <div className="card-header">
          <h3>Recent System Activity</h3>
          <p>Latest administrative actions and system events</p>
        </div>

        <div className="activity-list">
          {safeActivities.length === 0 ? (
            <p>No recent activity found</p>
          ) : (
            safeActivities.map((act) => (
              <div key={act.id} className={`activity-item activity-${act.action}`}>
                
                {act.action === "add_user" && <UserPlus className="activity-icon" />}
                {act.action === "delete_user" && <UserMinus className="activity-icon" />}
                {act.action === "activate_user" && <CheckCircle className="activity-icon" />}
                {act.action === "deactivate_user" && <XCircle className="activity-icon" />}

                <div className="activity-content">
                  <p>{act.action.replace(/_/g, " ")}: {act.target_user}</p>
                  <span className="activity-time">
                    {new Date(act.timestamp).toLocaleString()}
                  </span>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* GRAPH SECTION */}
      <div className="trend-section">
        <h2 className="trend-title">System Trends & Graphical Insights</h2>
        <p className="trend-subtitle">Visual representation of system activity and admin distribution</p>

        <div className="trend-grid">
          
          {/* Line Chart */}
          <div className="trend-card">
            <h3 className="chart-title">Admin Count Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={adminTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="admins" stroke="#6366F1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="trend-card">
            <h3 className="chart-title">Scan Activity Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scanTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="scans" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="trend-card">
            <h3 className="chart-title">Role Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {roleDistribution.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Overview;
