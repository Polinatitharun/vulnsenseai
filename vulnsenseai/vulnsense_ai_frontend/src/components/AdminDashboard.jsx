import { useState } from 'react';
import {User , Shield, Globe, Activity, FileCode, Home } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardHome from '../components/admin/DashboardHome';
import TargetManagement from '../components/admin/TargetManagement';
import Sanitization from '../components/admin/Sanitization';
import TestManagement from '../components/admin/TestManagement';
import AuditSection from '../components/admin/AuditSection';
import '../styles/AdminDashboard.css';
import { useUser } from './auth/Authcontext';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';

import { showToast } from '../components/common/Toast'; 
export default function AdminDashboard({ onLogout, currentUser }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddTarget, setShowAddTarget] = useState(false);
  const { user } = useUser();
  const cookies = new Cookies();
  const navigate = useNavigate();

  const username = user ? user.username : "NA"
  const [targets, setTargets] = useState([
    {
      id: '1',
      name: 'Production API',
      url: 'https://api.company.com',
      autoSanitization: true,
      status: 'active',
      lastScan: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Web Application',
      url: 'https://app.company.com',
      autoSanitization: false,
      status: 'inactive',
      lastScan: '2024-01-14T15:20:00Z',
      createdAt: '2024-01-05T00:00:00Z'
    }
  ]);

  const [targetForms, setTargetForms] = useState([
    { name: '', url: '', autoSanitization: false }
  ]);

  const [testResults, setTestResults] = useState([
    {
      id: '1',
      targetId: '1',
      type: 'fuzz',
      status: 'running',
      progress: 65,
      startTime: '2024-01-15T14:30:00Z',
      findings: 3
    },
    {
      id: '2',
      targetId: '2',
      type: 'load',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-15T12:00:00Z',
      duration: '45m 32s',
      findings: 0
    }
  ]);

  const [auditReports, setAuditReports] = useState([
    {
      id: '1',
      targetId: '1',
      generatedAt: '2024-01-15T16:00:00Z',
      status: 'completed',
      vulnerabilities: 5,
      riskScore: 7.2,
      recommendations: 8
    }
  ]);

  const sidebarItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'targets', icon: Globe, label: 'Targets' },
    { id: 'sanitization', icon: Shield, label: 'Prompt Manager' },
    { id: 'testing', icon: Activity, label: 'Testing' },
    { id: 'auditing', icon: FileCode, label: 'Auditing' }
  ];
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
  const addTargetForm = () => {
    setTargetForms([...targetForms, { model_name: '', endpoint_url: '', auto_sanitization: false }]);
  };

  const removeTargetForm = (index) => {
    if (targetForms.length > 1) {
      setTargetForms(targetForms.filter((_, i) => i !== index));
    }
  };

  const updateTargetForm = (index, field, value) => {
    const newForms = [...targetForms];
    newForms[index] = { ...newForms[index], [field]: value };
    setTargetForms(newForms);
  };

  function generateSecureRandomNumber() {
    const array = new Uint32Array(1); 
    window.crypto.getRandomValues(array);
    return array[0]; 
  }
  

  const submitTargets = () => {
    const newTargets = targetForms
      .filter(form => form.name && form.url)
      .map(form => ({
        id: Date.now().toString() + generateSecureRandomNumber(),
        name: form.name,
        url: form.url,
        autoSanitization: form.autoSanitization,
        status: 'active',
        lastScan: 'Never',
        createdAt: new Date().toISOString()
      }));

    setTargets([...targets, ...newTargets]);
    setTargetForms([{ name: '', url: '', autoSanitization: false }]);
    setShowAddTarget(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome targets={targets} testResults={testResults} auditReports={auditReports} currentUser={currentUser} />;
      case 'targets':
        return (
            <TargetManagement
              // targets={targets}
              // targetForms={targetForms}
              // showAddTarget={showAddTarget}
              // setShowAddTarget={setShowAddTarget}
              // addTargetForm={addTargetForm}
              // removeTargetForm={removeTargetForm}
              // updateTargetForm={updateTargetForm}
              // submitTargets={submitTargets}
              setActiveSection={setActiveSection}   // <-- add this line
            />
          );
        
     
      case 'sanitization':
        return <Sanitization targets={targets} />;
      case 'testing':
        return <TestManagement targets={targets} testResults={testResults} />;
      case 'auditing':
        return <AuditSection targets={targets} auditReports={auditReports} />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarItems={sidebarItems}
        onLogout={logout}
        currentUser={currentUser}
      />
      <div className="main-content">
        <header className="content-header">
          <div className="header-info">
            <h2 className="section-title">{activeSection}</h2>
            <p className="section-subtitle">Security administration panel</p>
          </div>
          <div className="header-user">
            <div className="user-avatar">
              <User className="icon" />
            </div>
            <div className="user-details">
              <p className="user-role">{username.toUpperCase()}</p>
            </div>
          </div>
        </header>
        <main className="page-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}