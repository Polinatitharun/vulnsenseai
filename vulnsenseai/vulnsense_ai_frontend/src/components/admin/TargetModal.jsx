import { useEffect, useState } from 'react';
import { get, post } from '../auth/api';
import { FaWindowClose } from "react-icons/fa";
import { showToast } from '../common/Toast';
import { fuzzStaticResponseData, loadStaticResponseData, SecurityScanResponseData } from './fuzzStaticResponse';

// ---------- GRAPH URL HELPERS ----------
const GRAPH_URLS = {
  fuzz: (id) => `api/fuzzgraph/${id}`,
  load: (id) => `api/loadtestgraph/${id}`,
  security: (id) => `api/securitygraph/${id}`,
};

const TargetModal = ({
  isOpen,
  onClose,
  setFuzzTestData,
  setLoadTestData,
  setSecurityTestData,
  onSubmit,
  type,
  startProgress,
  stopProgress,
  setGraphData,
}) => {
  const [targets, setTargets] = useState([]);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [loading, setLoading] = useState(false);

  const testing_flag = true;
  const fuzzStaticResponse = fuzzStaticResponseData;
  const loadStaticResponse = loadStaticResponseData;
  const securityStaticResponse = SecurityScanResponseData;

  // Load persisted test data on mount
  useEffect(() => {
    try {
      const fuzzData = JSON.parse(localStorage.getItem('fuzzTestData'));
      const loadData = JSON.parse(localStorage.getItem('loadTestData'));
      const securityData = JSON.parse(localStorage.getItem('securityTestData'));

      if (fuzzData) setFuzzTestData(fuzzData.results);
      if (loadData) setLoadTestData(loadData.results);
      if (securityData) setSecurityTestData(securityData.results);
    } catch (err) {
      console.error('Error reading saved test data:', err);
    }
  }, [setFuzzTestData, setLoadTestData, setSecurityTestData]);

  // Fetch available targets + ADD DEFAULT
  useEffect(() => {
    if (!isOpen) return;

    const fetchTargets = async () => {
      setLoading(true);
      try {
        const data = await get('/api/models/');

        if (data && data.length > 0) {
          setTargets(data);
        } else {
          // DEFAULT TARGET WHEN NO BACKEND OR EMPTY RESPONSE
          setTargets([
            {
              id: 999,
              model_name: "Default Test Model",
              endpoint_url: "https://dummy-llm.com/api",
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching targets:', error);
        showToast('Failed to fetch targets. Using default test model...', 'warning');

        // DEFAULT TARGET ON ERROR
        setTargets([
          {
            id: 999,
            model_name: "Default Test Model",
            endpoint_url: "https://dummy-llm.com/api",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, [isOpen]);

  // Handle checkbox toggle
  const handleSelectTarget = (targetId) => {
    setSelectedTargets((prev) =>
      prev.includes(targetId)
        ? prev.filter((id) => id !== targetId)
        : [...prev, targetId]
    );
  };

  // Save to localStorage helper
  const saveTestData = (type, data) => {
    if (!data) return;
    try {
      localStorage.setItem(`${type}TestData`, JSON.stringify(data));
    } catch (err) {
      console.error(`Error saving ${type} test data:`, err);
    }
  };

  // Submit and persist test data
  const handleSubmit = async () => {
    if (!selectedTargets.length) {
      showToast('No targets selected', 'warning');
      return;
    }

    let stopProgressFn;

    if (type === 'fuzz') stopProgressFn = startProgress('fuzz', 40);
    else if (type === 'load') stopProgressFn = startProgress('load', 10);
    else if (type === 'security') stopProgressFn = startProgress('security', 20);

    try {
      const id = selectedTargets[0];
      let response;

      // ========================= SECURITY =========================
      if (type === 'security') {
        response = testing_flag ? securityStaticResponse : await post(`/api/securityscan/`, { target: id });

        const testId = response.testing_id ?? response.id ?? response.results?.id;

        if (testId) {
          try {
            const graphBlob = await get(GRAPH_URLS.security(testId), { responseType: 'blob' });
            const imgUrl = URL.createObjectURL(graphBlob);
            setGraphData?.('security', { url: imgUrl, raw: graphBlob });
          } catch (err) {
            console.error('Failed to fetch security graph PNG:', err);
          }
        }

        stopProgressFn();
        setSecurityTestData(response.results ?? null);
        saveTestData('security', response.results ?? null);

      } else {
        // ========================= FUZZ / LOAD =========================
        const model_test = type === 'load' ? 'loadtest' : 'fuzztest';
        response =
          testing_flag
            ? type === 'load'
              ? loadStaticResponse
              : fuzzStaticResponse
            : await post(`/api/${model_test}/`, { target: id });

        const testId = response.id ?? response.testing_id ?? response.results?.id;

        if (testId) {
          try {
            const url = type === 'load' ? GRAPH_URLS.load(testId) : GRAPH_URLS.fuzz(testId);
            const graphBlob = await get(url, { responseType: 'blob' });
            const imgUrl = URL.createObjectURL(graphBlob);
            setGraphData?.(type, { url: imgUrl, raw: graphBlob });
          } catch (err) {
            console.error(`Failed to fetch ${type} graph PNG:`, err);
          }
        }

        stopProgressFn();

        if (model_test === 'loadtest') {
          setLoadTestData(response.results ?? response);
          saveTestData('load', response.results ?? response);
        } else if (model_test === 'fuzztest') {
          setFuzzTestData(response.results ?? null);
          saveTestData('fuzz', response.results ?? null);
        }

        showToast(`${model_test === 'loadtest' ? 'Load' : 'Fuzz'} test started successfully`, 'success');
        onSubmit && onSubmit(selectedTargets);
      }

    } catch (err) {
      console.error(`Error starting ${type} tests:`, err);
      showToast(`Failed to start ${type} tests`, 'error');
      stopProgressFn?.(true);
    } finally {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='target-modal-overlay'>
      <div className='target-modal'>
        <div className='target-modal-header'>
          <h1>
            {type === 'load'
              ? 'Select Target for Load Testing'
              : type === 'fuzz'
                ? 'Select Target for Fuzz Testing'
                : 'Select Target for Security Scan'}
          </h1>
          <button className='close-btn' onClick={onClose}>
            <FaWindowClose />
          </button>
        </div>

        <div className='modal-body'>
          {loading ? (
            <p>Loading targets...</p>
          ) : (
            <div className='targets-list'>
              {targets.map((target) => {
                const checked = selectedTargets.includes(target.id);
                return (
                  <div key={target.id} className={`target-card ${checked ? 'selected' : ''}`}>
                    <div className="target-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="target-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4>{target.model_name}</h4>
                        <p>{target.endpoint_url}</p>
                      </div>

                      <div className="target-checkbox">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleSelectTarget(target.id)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className='modal-footer'>
          <button
            className='btn btn-primary btn-full mt-2'
            style={{ marginTop: "15px" }}
            onClick={handleSubmit}
            disabled={!selectedTargets.length}
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TargetModal;
