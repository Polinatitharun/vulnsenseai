import React from 'react'
import {
    Shield,
    Users,
    UserPlus,
    UserMinus,
    Activity,
    LogOut,
    Crown,
    CheckCircle,
    XCircle,
    Trash2,
    Home,
    BarChart3,
    User
  } from 'lucide-react';
import { toast } from 'sonner';

const Adminsmanagement = ({setFile,handleExcelUpload,setShowAddUserForm,showAddUserForm,newUserData,setNewUserData,handleAddUser,adminUsers,getRoleBadge,getStatusBadge,handleToggleUserStatus,handleDeleteUser}) => {
  return (
    <div className="admin-content">
    <div>
      <h3>Admin Users</h3>
      <p>Manage administrator accounts and permissions</p>
    </div>
    <form>

      <div className="excel-upload-section">
        <h3>Bulk Admin Management (Excel)</h3>
        <div className="excel-upload-grid">
          {[
            { endpoint: "/auth/admins/upload_add/", label: "Upload & Add Users", btnClass: "super-btn-success" },
            { endpoint: "/auth/admins/upload_delete/", label: "Upload & Delete Users", btnClass: "super-btn-danger" },
            { endpoint: "/auth/admins/upload_activate/", label: "Upload & Activate Users", btnClass: "btn-primary" },
            { endpoint: "/auth/admins/upload_deactivate/", label: "Upload & Deactivate Users", btnClass: "btn-warning" },
          ].map((item, idx) => (
            <div key={idx} className="excel-upload-card">
              <input
                type="file"
                onChange={(e) => {
                  const selectedFile = e.target.files[0];
                 setFile(selectedFile);
                  toast.success(`${selectedFile.name} uploaded successfully`); 

                }}
                required
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleExcelUpload(e, item.endpoint);
                }}
                className={`btn ${item.btnClass}`}
              >
                {item.label}
              </button>

            </div>
          ))}
        </div>

      </div>

    </form>

    <button
      onClick={() => setShowAddUserForm(!showAddUserForm)}
      className="btn btn-primary"
    >
      <UserPlus className="btn-icon" />
      Add Admin
    </button>

    {showAddUserForm && (
      <div className="add-user-card">
        <div className="card-header">
          <h3>Add New Administrator</h3>
        </div>
        <div className="add-user-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Username</label>
              <input
                id="name"
                type="text"
                value={newUserData.username}
                onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                placeholder="Enter Username"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="Enter email address"
                className="form-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={newUserData.role}
              onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
              className="form-select"
            >
              <option value="admin">Administrator</option>
              <option value="superadmin">Super Administrator</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={newUserData.password || ""}
              onChange={(e) =>
                setNewUserData({ ...newUserData, password: e.target.value })
              }
              placeholder="Enter password"
              className="form-input"
            />
          </div>
          <div className="form-buttons">
            <button onClick={handleAddUser} className="btn btn-primary">
              Add Administrator
            </button>
            <button onClick={() => setShowAddUserForm(false)} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="users-list">
      {adminUsers.map((user) => (
        <div key={user.id} className="user-card">
          <div className="user-content">
            <div className="user-info">
              <div className="user-avatar">
                <Users className="avatar-icon" />
              </div>
              <div className="user-details">
                <h4>{user.username}</h4>
                <p>{user.email}</p>
                <div className="user-badges">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.is_active)}
                </div>
              </div>
            </div>

            <div className="user-meta">
              <div className="user-stats">
                <p>Last login: {user.lastLogin === 'Never' ? 'Never' : new Date(user.lastLogin).toLocaleDateString()}</p>
                <p>Scans: {user.scansCount}</p>
              </div>

              <div className="user-actions">
                <button
                  onClick={() => handleToggleUserStatus(user.id)}
                  className={`btn btn-outline btn-sm ${user.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                >
                  {user.is_active ? (
                    <>
                      <XCircle className="btn-icon" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="btn-icon" />
                      Activate
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="btn btn-outline btn-sm btn-danger"
                >
                  <Trash2 className="btn-icon" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
  )
}

export default Adminsmanagement
