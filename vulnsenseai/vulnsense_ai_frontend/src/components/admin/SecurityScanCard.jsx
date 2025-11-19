import { useState } from 'react';
import { Play, DownloadCloud, Loader } from 'lucide-react';
import { showToast } from '../common/Toast';
import { FaWindowClose } from 'react-icons/fa';
import TargetModal from './TargetModal';

// Dummy top 10 vulnerabilities
const DUMMY_VULNERABILITIES = [
  { id: 'LLM01', title: 'Prompt Injection', description: 'User prompts altering LLM behavior...' },
  { id: 'LLM02', title: 'Sensitive Information Disclosure', description: 'Sensitive data leakage...' },
  { id: 'LLM03', title: 'Supply Chain', description: 'Vulnerabilities in model supply chain...' },
  { id: 'LLM04', title: 'Data and Model Poisoning', description: 'Data poisoning attacks...' },
  { id: 'LLM05', title: 'Improper Output Handling', description: 'Insufficient validation or sanitization...' },
  { id: 'LLM06', title: 'Excessive Agency', description: 'LLM granted too much autonomy...' },
  { id: 'LLM07', title: 'System Prompt Leakage', description: 'System prompts exposed to users...' },
  { id: 'LLM08', title: 'Vector and Embedding Weaknesses', description: 'Security risks in embeddings...' },
  { id: 'LLM09', title: 'Misinformation', description: 'LLM generates false or misleading info...' },
  { id: 'LLM10', title: 'Unbounded Consumption', description: 'Resource exhaustion risk...' },
];

export default function SecurityScanCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [scanRunning, setScanRunning] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);

  // Function called after selecting target from modal
  const handleTargetSelect = (target) => {
    setSelectedTarget(target);
    startScan(target); // Automatically start scan after selection
  };

  const startScan = async (target) => {
    setScanRunning(true);
    setReportReady(false);
    setVulnerabilities(DUMMY_VULNERABILITIES.map(v => ({ ...v, status: 'pending' })));

    // Simulate sequential scanning
    for (let i = 0; i < DUMMY_VULNERABILITIES.length; i++) {
      setVulnerabilities(prev => prev.map((v, idx) => idx === i ? { ...v, status: 'scanning' } : v));
      await new Promise(res => setTimeout(res, 1000)); // Simulate scan delay
      setVulnerabilities(prev => prev.map((v, idx) => idx === i ? { ...v, status: 'completed' } : v));
    }

    setScanRunning(false);
    setReportReady(true);
    showToast(`Security scan completed for ${target.model_name}!`, 'success');
  };

  const downloadReport = () => {
    showToast('Downloading report...', 'info');
  };

  return (
    <>
      {/* Card to open modal */}
      <div className="testing-card testing-security">
        <div className="card-header">
          <h3>Security Scan</h3>
          <p>Top 10 LLM Vulnerabilities</p>
        </div>
        <button
          className="btn btn-primary btn-full"
          onClick={() => setModalOpen(true)}
        >
          <Play className="btn-icon" /> Start Security Scan
        </button>
      </div>

      {/* Target selection modal */}
      {modalOpen && (
        <TargetModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type="security"
          onSecuritySelect={handleTargetSelect} // Callback to start scan
        />
      )}

      {/* Scan progress modal */}
      {selectedTarget && (
        <div className="target-modal-overlay">
          <div className="target-modal" style={{ maxWidth: '600px' }}>
            <div className="target-modal-header">
              <h1>Security Scan Progress: {selectedTarget.model_name}</h1>
              <button className='close-btn' onClick={() => setSelectedTarget(null)}>
                <FaWindowClose />
              </button>
            </div>
            <div className="modal-body">
              {vulnerabilities.map(vul => (
                <div key={vul.id} className="vulnerability-item" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '11px 5px',
                  padding: '12px 10px', border: '1px solid #ccc', borderRadius: '4px'
                }}>
                  <div>
                    <strong>{vul.id}: {vul.title}</strong>
                    <p style={{ margin: 0, fontSize: '12px' }}>{vul.description}</p>
                  </div>
                  <div>
                    {vul.status === 'scanning' && <Loader className="icon spin" size={18} />}
                    {vul.status === 'completed' && <span style={{ color: 'green' }}>✔️</span>}
                    {vul.status === 'pending' && <span style={{ color: 'gray' }}>⏳</span>}
                  </div>
                </div>
              ))}

              {reportReady && (
                <button className="btn btn-success btn-full mt-2" onClick={downloadReport}>
                  <DownloadCloud className="btn-icon" /> Download Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
