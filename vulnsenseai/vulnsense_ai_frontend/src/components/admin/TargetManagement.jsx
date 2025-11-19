import { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Trash2,
  Plus,
  Minus,
  Play,
  Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { del, get, post } from '../auth/api';
import { useLoader } from '../loader/Loadercontext';
import { showToast } from '../common/Toast';

// NOTE: This file expects you to import the CSS below (TargetManagement.css)
// either globally or in this component: `import './TargetManagement.css'`.

export default function TargetManagement({ setActiveSection }) {
  const [targets, setTargets] = useState([]);
  const [targetForms, setTargetForms] = useState([
    { model_name: '', endpoint_url: '', auto_sanitization: false },
  ]);
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [status, setStatus] = useState("inactive");
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();

  const [dropdownStates, setDropdownStates] = useState([]);

  // ⭐ NEW — For edit modal
  const [editingTarget, setEditingTarget] = useState(null);

  useEffect(() => {
    setDropdownStates(prev =>
      prev.length === targetForms.length
        ? prev
        : targetForms.map(() => ({ open: false, loading: false, options: [] }))
    );
  }, [targetForms.length]);

  useEffect(() => {
    showLoader();
    const fetchTargets = async () => {
      try {
        const data = await get('api/models/');
        setTargets(data);
      } catch (error) {
        console.error('Error fetching targets:', error);
      } finally {
        hideLoader();
      }
    };
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      const data = await get('api/models/');
      setTargets(data);
    } catch (error) {
      console.error('Error fetching targets:', error);
    }
  };

  const targetStatus = async (id) => {
    try {
      await post(`api/target/status/${id}/`);
      await fetchTargets();
    } catch (e) {}
  };

  const addTargetForm = () =>
    setTargetForms([
      ...targetForms,
      { model_name: '', endpoint_url: '', auto_sanitization: false },
    ]);

  const removeTargetForm = (index) =>
    setTargetForms(targetForms.filter((_, i) => i !== index));

  const updateTargetForm = (index, field, value) => {
    const updated = [...targetForms];
    updated[index][field] = value;
    setTargetForms(updated);
  };

  const targetDelete = async (id) => {
    try {
      await del(`api/target/delete/${id}/`);
      await fetchTargets();
      showToast("Target Deleted", "success");
    } catch (error) {
      console.error(error);
    }
  };

  const submitTargets = async () => {
    try {
      await Promise.all(targetForms.map(form => post('/api/models/', form)));
      const data = await get('/api/models/');
      setTargets(data);
      setTargetForms([{ model_name: '', endpoint_url: '', auto_sanitization: false }]);
      setShowAddTarget(false);
      showToast("Targets added successfully", "success");
    } catch (error) {
      console.error('Error submitting targets:', error);
      showToast("Failed to add targets", "error");
    }
  };

  const fetchModelOptions = async (url, formIdx) => {
    if (!url.trim()) {
      showToast("Please enter a valid URL first", "warning");
      return;
    }

    setDropdownStates(prev => {
      const copy = [...prev];
      copy[formIdx] = { ...copy[formIdx], loading: true, options: [], open: false };
      return copy;
    });

    try {
      const payload = { url };
      const data = await post('/api/dropdown', payload);
      const options = Object.values(data).filter(Boolean);

      setDropdownStates(prev => {
        const copy = [...prev];
        copy[formIdx] = { ...copy[formIdx], loading: false, options, open: true };
        return copy;
      });
    } catch (err) {
      console.error('Dropdown fetch error', err);
      showToast('Failed to load models', 'error');
      setDropdownStates(prev => {
        const copy = [...prev];
        copy[formIdx] = { ...copy[formIdx], loading: false, open: false };
        return copy;
      });
    }
  };

  const toggleDropdown = (idx) => {
    setDropdownStates(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], open: !copy[idx].open };
      return copy;
    });
  };

  const selectModel = (idx, model) => {
    updateTargetForm(idx, 'model_name', model);
    setDropdownStates(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], open: false };
      return copy;
    });
  };

  // ⭐ NEW — Save edited target
  const saveEditedTarget = async () => {
    try {
      await post(`/api/models/${editingTarget.id}/`, editingTarget);
      showToast("Target Updated Successfully", "success");
      setEditingTarget(null);
      fetchTargets();
    } catch (err) {
      console.error(err);
      showToast("Failed to update target", "error");
    }
  };

  return (
    <div className="admin-content">
      <div className="section-header">
        <div>
          <h2>Target Management</h2>
          <p>Configure AI models and applications for security testing</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddTarget(!showAddTarget)}
        >
          <Plus className="btn-icon" />
          Add Target
        </button>
      </div>

      {/* ---------------- ADD TARGET FORM (UNCHANGED) ---------------- */}
      {showAddTarget && (
        <div className="add-target-card">
          <div className="card-header">
            <h3>Add New Target</h3>
            <p>Configure models or applications for AI-powered security testing</p>
          </div>

          <div className="target-forms">
            {targetForms.map((form, index) => {
              const dd = dropdownStates[index] ?? {
                open: false,
                loading: false,
                options: [],
              };

              return (
                <div key={index} className="target-form">
                  <div className="form-header">
                    <h4>Target {index + 1}</h4>
                    {targetForms.length > 1 && (
                      <button
                        className="btn btn-outline btn-danger"
                        onClick={() => removeTargetForm(index)}
                      >
                        <Minus className="btn-icon" />
                      </button>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>URL of Model/Application</label>
                      <input
                        type="text"
                        value={form.endpoint_url}
                        onChange={(e) =>
                          updateTargetForm(index, 'endpoint_url', e.target.value)
                        }
                        placeholder="https://api.example.com"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                      <label>Model Name</label>

                      <div className="model-selector">
                        <input
                          type="text"
                          readOnly
                          value={form.model_name}
                          placeholder="Click arrow to select model"
                          className="form-input"
                          style={{ paddingRight: '2.5rem', cursor: 'default' }}
                        />

                        <button
                          type="button"
                          className="model-arrow-btn"
                          onClick={() => {
                            if (dd.loading) return;
                            if (dd.options.length > 0) {
                              toggleDropdown(index);
                            } else {
                              fetchModelOptions(form.endpoint_url, index);
                            }
                          }}
                          disabled={dd.loading}
                          title="Fetch and select model"
                        >
                          {dd.loading ? (
                            <div className="spinner-sm"></div>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          )}
                        </button>
                      </div>

                      {dd.open && (
                        <div className="model-dropdown">
                          {dd.options.length === 0 ? (
                            <div className="dropdown-item disabled">
                              No models available
                            </div>
                          ) : (
                            dd.options.map((opt, i) => (
                              <div
                                key={i}
                                className="dropdown-item"
                                onClick={() => selectModel(index, opt)}
                              >
                                {opt}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={form.auto_sanitization}
                      onChange={(e) =>
                        updateTargetForm(index, 'auto_sanitization', e.target.checked)
                      }
                    />
                    <label>Enable automatic prompt sanitization</label>
                  </div>
                </div>
              );
            })}

            <div className="form-actions">
              <button
                className="btn btn-outline btn-primary"
                onClick={addTargetForm}
              >
                <Plus className="btn-icon" />
                Add Another Target
              </button>
              <div className="form-buttons">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowAddTarget(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={submitTargets}>
                  Submit Targets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EXISTING TARGETS LIST ==================== */}
      <div className="targets-list">

        {/* === DEFAULT DUMMY TARGET CARD WITH EDIT BUTTON === */}
        <div className="target-card">
          <div className="target-content">
            <div className="target-info">
              <div className="target-icon">
                <Globe className="icon" />
              </div>
              <div className="target-details">
                <h4>Dummy Model</h4>
                <p>https://dummy.api.com</p>
                <div className="target-badges">
                  <span className="badge badge-secondary">inactive</span>
                  <span className="badge badge-primary">Auto-Sanitization</span>
                </div>
              </div>
            </div>

            <div className="target-actions">
              <button className="btn btn-outline btn-sm">
                <Play className="btn-icon" /> Go to Test Management
              </button>

              <button className="btn btn-activate">
                <CheckCircle /> Activate
              </button>

              {/* ⭐ NEW — Edit button */}
              <button
                className="btn btn-outline btn-sm"
                onClick={() =>
                  setEditingTarget({
                    id: 0,
                    model_name: "Dummy Model",
                    endpoint_url: "https://dummy.api.com",
                    auto_sanitization: true,
                  })
                }
              >
                ✏ Edit
              </button>

              <button className="btn btn-outline btn-sm btn-danger">
                <Trash2 className="btn-icon" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* REAL TARGETS */}
        {targets.map((target) => (
          <div key={target.id} className="target-card">
            <div className="target-content">
              <div className="target-info">
                <div className="target-icon">
                  <Globe className="icon" />
                </div>
                <div className="target-details">
                  <h4>{target.model_name}</h4>
                  <p>{target.endpoint_url}</p>
                  <div className="target-badges">
                    <span
                      className={`badge ${
                        target.status === 'active'
                          ? 'badge-success'
                          : 'badge-secondary'
                      }`}
                    >
                      {target.status}
                    </span>
                    {target.auto_sanitization && (
                      <span className="badge badge-primary">
                        Auto-Sanitization
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="target-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveSection('testing')}
                >
                  <Play className="btn-icon" /> Go to Test Management
                </button>

                <button
                  className={`btn ${
                    target.status === 'active'
                      ? 'btn-deactivate'
                      : 'btn-activate'
                  }`}
                  onClick={() => targetStatus(target.id)}
                >
                  {target.status === 'active' ? (
                    <>
                      <XCircle />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle />
                      Activate
                    </>
                  )}
                </button>

                {/* ⭐ NEW — Edit Button */}
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditingTarget(target)}
                >
                  ✏ Edit
                </button>

                <button
                  className="btn btn-outline btn-sm btn-danger"
                  onClick={() => targetDelete(target.id)}
                >
                  <Trash2 className="btn-icon" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ⭐ NEW — EDIT MODAL */}
      {editingTarget && (
        <div className="modal-overlay">
          <div className="modal-card">

            <h3>Edit Target</h3>

            <label>Model Name</label>
            <input
              type="text"
              value={editingTarget.model_name}
              onChange={(e) =>
                setEditingTarget({ ...editingTarget, model_name: e.target.value })
              }
              className="form-input"
            />

            <label>Endpoint URL</label>
            <input
              type="text"
              value={editingTarget.endpoint_url}
              onChange={(e) =>
                setEditingTarget({
                  ...editingTarget,
                  endpoint_url: e.target.value,
                })
              }
              className="form-input"
            />

            <label className="checkbox-group" style={{ marginTop: '10px' }}>
              <input
                type="checkbox"
                checked={editingTarget.auto_sanitization}
                onChange={(e) =>
                  setEditingTarget({
                    ...editingTarget,
                    auto_sanitization: e.target.checked,
                  })
                }
              />
              Enable Auto Sanitization
            </label>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setEditingTarget(null)}
              >
                Cancel
              </button>

              {/* Save updated target */}
              {editingTarget.id !== 0 && (
                <button className="btn btn-primary" onClick={saveEditedTarget}>
                  Save
                </button>
              )}

              {/* Dummy save (does nothing) */}
              {editingTarget.id === 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    showToast("Dummy updated (UI only)", "success");
                    setEditingTarget(null);
                  }}
                >
                  Save
                </button>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}


