import { Shield, User, LogOut } from 'lucide-react';
import { showToast } from '../common/Toast';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../auth/Authcontext';

export default function AdminSidebar({ activeSection, setActiveSection, sidebarItems, onLogout }) {
  const navigate = useNavigate();
  const { user } = useUser();
  const username = user ? user.username : "NA";

  const handleLogout = () => {
    showToast('Logout successful!', 'success');
    onLogout?.();
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <Shield className="icon" />
          </div>
          <div className="logo-text">
            <h1>VulnSense AI</h1>
            <p>Admin Dashboard</p>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveSection(item.id)}
                className={`nav-item ${activeSection === item.id ? 'nav-item-active' : ''}`}
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
          <div className="user-avatar">
            <User className="icon" />
          </div>
          <div className="user-details">
            <p className="user-name">{username.toUpperCase()}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut className="btn-icon" />
          Logout
        </button>
      </div>
    </div>
  );
}
