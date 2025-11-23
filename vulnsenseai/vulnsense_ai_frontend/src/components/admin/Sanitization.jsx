import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader, Eye, Copy, RefreshCw } from 'lucide-react';
import { get, post } from '../auth/api';
import DataTable from "react-data-table-component";
import { showToast } from '../common/Toast';
import { useLoader } from '../loader/Loadercontext';
import { useLlmLoader } from './LlmLoaderContext';

export default function Sanitization() {
  const { showLoader, hideLoader } = useLoader();
  const { setLlmLoading } = useLlmLoader();

  // State management
  const [prompt, setPrompt] = useState('');
  const [responsePrompt, setResponsePrompt] = useState('');
  const [error, setError] = useState('');
  const [generatePromptInput, setGeneratePromptInput] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptType, setPromptType] = useState('reasoning');
  const [sanitizationData, setSanitizationData] = useState([]);
  const [generatedPrompts, setGeneratedPrompts] = useState([]);
  const [hoveredPromptId, setHoveredPromptId] = useState(null);
  const [activeTab, setActiveTab] = useState('sanitize'); // 'sanitize' or 'generate'

  // Handler functions
  const handlePromptChange = (e) => setPrompt(e.target.value);
  const handleGeneratePromptChange = (e) => setGeneratePromptInput(e.target.value);
  const handlePromptTypeChange = (e) => setPromptType(e.target.value);

  // Fetch data on component mount
  useEffect(() => {
    fetchSanitizationData();
  }, []);

  const fetchSanitizationData = async () => {
    try {
      showLoader();
      const [sanitizationResponse, generatedPromptsResponse] = await Promise.all([
        get('api/list-sanitizations/'),
        get('api/list-generated-prompts/')
      ]);

      setSanitizationData(sanitizationResponse.data || sanitizationResponse || []);
      setGeneratedPrompts(generatedPromptsResponse.data || generatedPromptsResponse || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch prompts');
      showToast('Failed to load history data', 'error');
    } finally {
      hideLoader();
    }
  };

  // Combined data for table
  const combinedData = [
    ...(sanitizationData.map(s => ({
      id: s.id,
      Target: "N/A",
      Prompt: s.prompt,
      Type: 'sanitization',
      responsePrompt: s?.response_prompt?.sanitized_text || s?.response_prompt?.sanitized_prompt || 'No response',
      timestamp: s.created_at,
    }))),

    ...(generatedPrompts.map(gp => {
      let expandedPrompt = '';
      try {
        // Handle both possible response structures
        expandedPrompt = gp.generated_response?.expanded_prompt || 
                        gp.generated_response?.sanitized_text ||
                        JSON.stringify(gp.generated_response);
      } catch (err) {
        console.warn("Invalid response format:", gp.generated_response);
        expandedPrompt = 'Invalid response format';
      }
      return {
        id: gp.id + 1000,
        Target: 'N/A',
        Prompt: gp.input_prompt,
        Type: 'generated',
        responsePrompt: expandedPrompt,
        timestamp: gp.created_at,
      };
    }))
  ];

  // Enhanced columns with better formatting
  const columns = [
    { 
      name: "ID", 
      selector: row => row.id, 
      sortable: true,
      width: '80px'
    },
    { 
      name: "Type", 
      selector: row => row.Type, 
      sortable: true,
      cell: row => (
        <span className={`type-badge type-${row.Type}`}>
          {row.Type}
        </span>
      ),
      width: '120px'
    },
    {
      name: "Prompt",
      selector: row => row.Prompt,
      sortable: true,
      cell: row => (
        <div className="prompt-cell">
          <span title={row.Prompt}>
            {row.Prompt.length > 50 ? `${row.Prompt.substring(0, 50)}...` : row.Prompt}
          </span>
        </div>
      ),
      minWidth: '200px'
    },
    {
      name: "Response Preview",
      selector: row => row.responsePrompt,
      sortable: true,
      cell: row => (
        <div className="response-cell">
          <span title={row.responsePrompt}>
            {row.responsePrompt.length > 60 ? `${row.responsePrompt.substring(0, 60)}...` : row.responsePrompt}
          </span>
        </div>
      ),
      minWidth: '250px'
    },
    {
      name: "Actions",
      cell: row => (
        <div className="action-buttons">
          <button
            className="btn-icon"
            onClick={() => handleCopy(row.responsePrompt)}
            title="Copy response"
          >
            <Copy size={16} />
          </button>
          <button
            className="btn-icon"
            onClick={() => setHoveredPromptId(hoveredPromptId === row.id ? null : row.id)}
            title="View details"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
      width: '100px'
    },
    {
      name: "Time",
      selector: row => row.timestamp,
      sortable: true,
      cell: row => (
        <span className="timestamp">
          {new Date(row.timestamp).toLocaleDateString()}
        </span>
      ),
      width: '100px'
    },
  ];

  // Manual Sanitization
  const handleSendPrompt = async () => {
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
      showToast('Please enter a prompt to sanitize', 'warning');
      return;
    }

    setLlmLoading(true);
    setError('');
    setResponsePrompt('');

    try {
      const response = await post('api/sanitization/', { prompt: prompt });
      
      // Handle different response structures
      const sanitizedText = response.response_prompt?.sanitized_text || 
                           response.response_prompt?.sanitized_prompt ||
                           response.response_prompt;
      
      setResponsePrompt(sanitizedText);
      setPrompt('');
      showToast('Prompt sanitized successfully!', 'success');
      
      // Refresh the data to show new entry
      fetchSanitizationData();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error occurred';
      setError(`Error: ${errorMsg}`);
      showToast('Failed to sanitize prompt', 'error');
    } finally {
      setLlmLoading(false);
    }
  };

  // Prompt Generation
  const handleGeneratePrompt = async () => {
    if (!generatePromptInput.trim()) {
      setError('Input cannot be empty.');
      showToast('Please enter text to generate prompt', 'warning');
      return;
    }

    setLlmLoading(true);
    setError('');
    setGeneratedResponse('');

    try {
      const payload = {
        input_prompt: generatePromptInput,
        prompt_type: promptType
      };

      const response = await post('api/generate-prompt/', payload);
      
      // Handle different response structures
      const generatedText = response.generated_response?.expanded_prompt || 
                           response.generated_response?.sanitized_text ||
                           response.generated_response;
      
      setGeneratedResponse(generatedText);
      setGeneratePromptInput('');
      showToast('Prompt generated successfully!', 'success');
      
      // Refresh the data to show new entry
      fetchSanitizationData();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error occurred';
      setError(`Error: ${errorMsg}`);
      showToast('Failed to generate prompt', 'error');
    } finally {
      setLlmLoading(false);
    }
  };

  const handleCopy = async (textToCopy) => {
    try {
      if (!textToCopy) {
        showToast('No text to copy', 'warning');
        return;
      }
      await navigator.clipboard.writeText(textToCopy);
      showToast('Copied to clipboard!', 'success');
    } catch (error) {
      showToast('Copy failed', 'error');
    }
  };

  const clearAll = () => {
    setPrompt('');
    setGeneratePromptInput('');
    setResponsePrompt('');
    setGeneratedResponse('');
    setError('');
  };

  return (
    <div className="sanitization-container">
      <div className="section-header">
        <h2>AI Prompt Management</h2>
        <p>Sanitize sensitive data and generate enhanced prompts using AI</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'sanitize' ? 'active' : ''}`}
          onClick={() => setActiveTab('sanitize')}
        >
          Sanitize Prompts
        </button>
        <button 
          className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          Generate Prompts
        </button>
      </div>

      {/* Sanitization Tab */}
      {activeTab === 'sanitize' && (
        <div className="sanitization-card">
          <div className="card-header">
            <div className="card-title">
              <h3>🛡️ Input Sanitization</h3>
              <p>Remove sensitive information from your prompts before processing</p>
            </div>
            
            <textarea
              className="user-prompt"
              placeholder="Enter text containing sensitive information (passwords, emails, keys, etc.)"
              value={prompt}
              onChange={handlePromptChange}
              rows={4}
            />
            
            <div className="form-buttons">
              <button className="btn btn-primary" onClick={handleSendPrompt}>
                🛡️ Sanitize Prompt
              </button>
              <button className="btn btn-secondary" onClick={clearAll}>
                Clear
              </button>
              {responsePrompt && (
                <button className="btn btn-success" onClick={() => handleCopy(responsePrompt)}>
                  <Copy size={16} /> Copy
                </button>
              )}
            </div>

            {responsePrompt && (
              <div className="result-section">
                <h4>✅ Sanitized Result:</h4>
                <div className="output-box">
                  {responsePrompt}
                </div>
                <div className="result-actions">
                  <span className="result-info">Sensitive data has been removed and replaced with safe placeholders</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generation Tab */}
      {activeTab === 'generate' && (
        <div className="sanitization-card">
          <div className="card-header">
            <div className="card-title">
              <h3>🚀 Prompt Generation</h3>
              <p>Enhance and expand your basic prompts using AI</p>
            </div>

            <div className="generator-controls">
              <div className="input-group">
                <label>Prompt Category:</label>
                <select value={promptType} onChange={handlePromptTypeChange}>
                  <option value="reasoning">🧠 Reasoning</option>
                  <option value="code_generation">💻 Code Generation</option>
                  <option value="security_analysis">🔒 Security Analysis</option>
                  <option value="test_case_generation">🧪 Test Case Generation</option>
                  <option value="documentation">📚 Documentation</option>
                  <option value="creative_story">📖 Creative Story</option>
                  <option value="data_analysis">📊 Data Analysis</option>
                </select>
              </div>
            </div>

            <textarea
              className="user-prompt-generator"
              placeholder="Enter your basic prompt idea or topic..."
              value={generatePromptInput}
              onChange={handleGeneratePromptChange}
              rows={4}
            />

            <div className="form-buttons">
              <button className="btn btn-primary" onClick={handleGeneratePrompt}>
                🚀 Generate Prompt
              </button>
              <button className="btn btn-secondary" onClick={clearAll}>
                Clear
              </button>
              {generatedResponse && (
                <button className="btn btn-success" onClick={() => handleCopy(generatedResponse)}>
                  <Copy size={16} /> Copy
                </button>
              )}
            </div>

            {generatedResponse && (
              <div className="result-section">
                <h4>✨ Generated Prompt:</h4>
                <div className="output-box">
                  {generatedResponse}
                </div>
                <div className="result-actions">
                  <span className="result-info">AI-enhanced prompt ready for use</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="history-section">
        <div className="section-header">
          <h3>📋 History</h3>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={fetchSanitizationData}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={combinedData}
          pagination
          highlightOnHover
          striped
          responsive
          className="history-table"
        />
      </div>

      {/* Hover Card */}
      {hoveredPromptId && (
        <div className="hover-card-overlay" onClick={() => setHoveredPromptId(null)}>
          <div className="hover-card" onClick={(e) => e.stopPropagation()}>
            <div className="hover-card-header">
              <h4>Prompt Details</h4>
              <button 
                className="close-btn"
                onClick={() => setHoveredPromptId(null)}
              >
                ×
              </button>
            </div>
            <div className="hover-card-content">
              {combinedData.find(item => item.id === hoveredPromptId)?.responsePrompt}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}