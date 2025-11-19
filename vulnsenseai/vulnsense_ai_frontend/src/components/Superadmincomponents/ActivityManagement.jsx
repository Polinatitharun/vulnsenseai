import React, { useEffect, useState } from "react";
import {
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle,
} from "lucide-react";

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
  Legend,
  ResponsiveContainer,
} from "recharts";

const ActivityManagement = ({ stats: realStats, activities: realActivities }) => {

  // -------- FLAG -------
  const useDummyData = false;

  // Local States
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [graphData, setGraphData] = useState({
    scanTrend: [],
    adminTrend: [],
    roleSplit: []
  });

  // -------- DUMMY DATA --------
  const dummyStats = {
    todayScans: 150,
    activeAdmins: 8,
    superAdmins: 3,
  };

  const dummyActivities = [
    {
      id: 1,
      action: "add_user",
      target_user: "Dummy User 1",
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      action: "activate_user",
      target_user: "Dummy User 2",
      timestamp: new Date().toISOString(),
    },
  ];

  const dummyGraphData = {
    scanTrend: [
      { day: "Mon", scans: 20 },
      { day: "Tue", scans: 10 },
      { day: "Wed", scans: 30 },
      { day: "Thu", scans: 20 },
      { day: "Fri", scans: 0 },
    ],
    adminTrend: [
      { month: "Jan", count: 2 },
      { month: "Feb", count: 3 },
      { month: "Mar", count: 4 },
      { month: "Apr", count: 6 },
      { month: "May", count: 8 },
    ],
    roleSplit: [
      { name: "Admins", value: 8 },
      { name: "Super Admins", value: 3 },
    ],
  };

  // ---------- REAL API ----------
  const fetchRealGraphs = async () => {
    try {
      const res = await fetch("/api/dashboard/graph-data/");
      const data = await res.json();
      setGraphData(data);
    } catch (err) {
      console.log("Graph fetch error:", err);
    }
  };

  // ---------- APPLY DATA BASED ON FLAG ----------
  useEffect(() => {
    if (useDummyData) {
      setStats(dummyStats);
      setActivities(dummyActivities);
      setGraphData(dummyGraphData);
    } else {
      setStats(realStats || {});
      setActivities(realActivities || []);
      fetchRealGraphs();
    }
  }, [useDummyData, realStats, realActivities]);

  const PIE_COLORS = ["#4f46e5", "#10b981", "#f59e0b"];

  return (
    <div className="admin-content">

      <div className="section-header">
        <div>
          <h2>System Activity Monitor</h2>
          <p>Real-time monitoring of system-wide activities and performance</p>
        </div>
      </div>

      {/* Main Block */}
      <div className="activity-monitor-card">
        <div className="card-header">
          <h3>System Activity Monitor</h3>
        </div>

        <div className="monitor-content">

          {/* Stats */}
          <div className="monitor-stats">
            <div className="monitor-stat monitor-stat-blue">
              <div className="monitor-number">{stats.todayScans}</div>
              <div className="monitor-label">Scans Today</div>
            </div>

            <div className="monitor-stat monitor-stat-green">
              <div className="monitor-number">{stats.activeAdmins}</div>
              <div className="monitor-label">Active Admins</div>
            </div>

            <div className="monitor-stat monitor-stat-purple">
              <div className="monitor-number">{stats.superAdmins}</div>
              <div className="monitor-label">Super Admins</div>
            </div>
          </div>

          {/* Activities */}
          <div className="activity-list">
            {activities.map((act) => (
              <div key={act.id} className="activity-item">
                {act.action === "add_user" && <UserPlus className="activity-icon" />}
                {act.action === "delete_user" && <UserMinus className="activity-danger" />}
                {act.action === "activate_user" && <CheckCircle className="activity-icon" />}
                {act.action === "deactivate_user" && <XCircle className="activity-danger" />}

                <div className="activity-content">
                  <p>{act.action.replace("_", " ")}: {act.target_user}</p>
                  <span className="activity-time">{new Date(act.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* --------- GRAPH SECTION --------- */}
          <div className="graphs-grid">

            {/* Line Chart: Scan Trend */}
            <div className="graph-card">
              <h4>Scan Trend (Last 5 Days)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={graphData.scanTrend}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="scans" stroke="#4f46e5" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart: Admin Growth */}
            <div className="graph-card">
              <h4>Admin Growth</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={graphData.adminTrend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart: Role Distribution */}
            <div className="graph-card">
              <h4>Role Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={graphData.roleSplit}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {graphData.roleSplit.map((entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
    </div>
  );
};

export default ActivityManagement;
