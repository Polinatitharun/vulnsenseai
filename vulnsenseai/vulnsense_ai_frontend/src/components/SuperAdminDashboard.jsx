import { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  LogOut,
  Home,
  BarChart3,
  User
} from 'lucide-react';
import '../styles/SuperAdminDashboard.css';
import { useUser } from './auth/Authcontext';
import { get, post, del } from './auth/api';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import Overview from './Superadmincomponents/Overview';
import Adminsmanagement from './Superadmincomponents/Adminsmanagement';
import ActivityManagement from './Superadmincomponents/ActivityManagement';

import { showToast } from './common/Toast'; 

export default function SuperAdminDashboard() {
  const cookies = new Cookies();
  const navigate = useNavigate();

  const [Section, setActiveSection] = useState('overview');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [file, setFile] = useState("");
  const [activities, setActivities] = useState([]);
  const { user } = useUser();
  const username = user ? user.username : "NA";

  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    role: 'admin',
    password: ''
  });

  const [stats, setStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    inactiveAdmins: 0,
    superAdmins: 0,
    totalScans: 0,
    todayScans: 0
  });

  useEffect(() => {
    fetchOverview();
    fetchAdmins();
    fetchActivities();
  }, []);

  const fetchOverview = async () => {
    try {
      const data = await get("/auth/overview/");
      setStats({
        totalAdmins: data.total_admins ?? 0,
        activeAdmins: data.active_admins ?? 0,
        superAdmins: data.superadmins ?? 0,
        inactiveAdmins: (data.total_admins ?? 0) - (data.active_admins ?? 0),
        todayScans: data.today_scans ?? 0,
        totalScans: data.total_scans ?? 0
      });
    } catch (err) {
      console.error("Error fetching overview:", err);
      showToast("Failed to fetch overview", "error");
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await get("/auth/activity/");
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      showToast("Failed to fetch activities", "error");
    }
  };

  const fetchAdmins = async () => {
    try {
      const data = await get("/auth/admins/");
      setAdminUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching admins:", err);
      showToast("Failed to fetch admins", "error");
    }
  };

  const sidebarItems = [
    { id: 'overview', icon: Home, label: 'Overview' },
    { id: 'admins', icon: Users, label: 'Admin Management' },
    { id: 'activity', icon: BarChart3, label: 'System Activity' }
  ];


  function validateStrongPassword(password) {
    if (password.length < 8) {
      return false;
    }
  
    if (!/[A-Z]/.test(password)) {
      return false;
    }
  
    if (!/[a-z]/.test(password)) {
      return false;
    }

    if (!/[0-9]/.test(password)) {
      return false;
    }
  
    if (!/[\W_]/.test(password)) {
      return false;
    }
  
    return true;
  }

  const handleAddUser = async () => {
    if (!newUserData.username || !newUserData.email || !newUserData.password) {
      showToast("Please fill all the required fields", "error");
      return;
    }
  
    if (!validateStrongPassword(newUserData.password)) { 
      showToast("Weak password. Please use a stronger password.", "info");
      return;
    }

    try {
      await post("/auth/admins/", newUserData);
      await fetchAdmins();
      showToast("User added successfully!", "success");
    } catch (err) {
      console.error("Error adding admin:", err);
      showToast("Error adding admin", "error");
    } finally {
      setNewUserData({ username: '', email: '', role: 'admin', password: '' });
      setShowAddUserForm(false);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await post(`/auth/admins/${userId}/toggle_status/`);
      await fetchAdmins();
      showToast("User status updated!", "success");
    } catch (err) {
      console.error("Error toggling status:", err);
      showToast("Failed to toggle user status", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await del(`/auth/admins/${userId}/delete/`);
      await fetchAdmins();
      showToast("User deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting admin:", err);
      showToast("Failed to delete user", "error");
    }
  };

  const logout = () => {
    try {
      cookies.remove('access_token', { path: '/' });
      cookies.remove('refresh_token', { path: '/' });
      cookies.remove('vs_user', { path: '/' });
      showToast("Logout successful!", "success");
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      showToast("Logout failed!", "error");
    }
  };

  const handleExcelUpload = async (e, endpoint) => {
    e.preventDefault();
    if (!file) return showToast("No file selected", "error");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await post(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchAdmins();
      showToast("Operation successful!", "success");
    } catch (err) {
      console.error("Excel upload error:", err);
      showToast("Upload failed!", "error");
    } finally {
      setFile("");
    }
  };

  const getStatusBadge = (is_active) => (
    is_active ? <span className="badge badge-success">Active</span>
      : <span className="badge badge-danger">Inactive</span>
  );

  const getRoleBadge = (role) => (
    role === 'superadmin' ? <span className="badge badge-purple">Super Admin</span>
      : <span className="badge badge-primary">Admin</span>
  );

  const renderContent = () => {
    switch (Section) {
      case 'overview':
        return <Overview stats={stats} activities={activities} />;
      case 'admins':
        return (
          <Adminsmanagement
            setFile={setFile}
            handleExcelUpload={handleExcelUpload}
            setShowAddUserForm={setShowAddUserForm}
            showAddUserForm={showAddUserForm}
            newUserData={newUserData}
            setNewUserData={setNewUserData}
            handleAddUser={handleAddUser}
            adminUsers={adminUsers}
            getRoleBadge={getRoleBadge}
            getStatusBadge={getStatusBadge}
            handleToggleUserStatus={handleToggleUserStatus}
            handleDeleteUser={handleDeleteUser}
          />
        );
      case 'activity':
        return <ActivityManagement stats={stats} activities={activities} />;
      default:
        return null;
    }
  };

  return (
    <div className="superadmin-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon"><Shield className="icon" /></div>
            <div className="logo-text">
              <h1>VulnSense AI</h1>
              <p>Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {sidebarItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`nav-item ${Section === item.id ? 'nav-item-active' : ''}`}
                >
                  <item.icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar"><User className="icon" /></div>
            <div className="user-details"><p className="user-name">{username.toUpperCase()}</p></div>
          </div>
          <button onClick={logout} className="logout-btn">
            <LogOut className="btn-icon" /> Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <header className="content-header">
          <div className="header-info">
            <h2 className="section-title">{Section}</h2>
            <p className="section-subtitle">System administration panel</p>
          </div>
          <div className="header-user">
            <div className="user-avatar"><User className="icon" /></div>
            <div className="user-details"><p className="user-role">{username.toUpperCase()}</p></div>
          </div>
        </header>

        <main className="page-content">{renderContent()}</main>
      </div>
    </div>
  );
}
