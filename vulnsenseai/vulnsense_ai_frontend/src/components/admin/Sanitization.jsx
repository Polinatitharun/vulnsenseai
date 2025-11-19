import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader, Eye } from 'lucide-react';
import { get, post } from '../auth/api';
import DataTable from "react-data-table-component";
import { showToast } from '../common/Toast';
import { useLoader } from '../loader/Loadercontext';
import { useLlmLoader } from './LlmLoaderContext';

export default function Sanitization() {
  const { showLoader, hideLoader } = useLoader();

  const data = [
    { id: 1, Target: "http://www.google.com", Prompt: "algorithm for writing a fibonacci series", Type: "auto_sanitization" },
    { id: 2, Target: "http://www.google.com", Prompt: "prepare a cup of tea", Type: "manual_sanitization" },
    { id: 3, Target: "http://www.google.com", Prompt: "int main() { printf('Hello, World!'); return 0; }", Type: "auto_generate" },
    { id: 4, Target: "http://www.google.com", Prompt: "how to write a odd or even program", Type: "auto_sanitization" },
  ];

  const [prompt, setPrompt] = useState('');
  const [responsePrompt, setResponsePrompt] = useState('');
  const [originalprompt, setOriginalprompt] = useState('');
  const [error, setError] = useState('');
  const [generatePromptInput, setGeneratePromptInput] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 🔥 UPDATED STATE FOR DROPDOWN
  const [promptType, setPromptType] = useState('reasoning');

  const { setLlmLoading } = useLlmLoader();
  const [sanitizationData, setSanitizationData] = useState([]);
  const [generatedPrompts, setGeneratedPrompts] = useState([]);
  const [hoveredPromptId, setHoveredPromptId] = useState(null);

  const handlePromptChange = (e) => setPrompt(e.target.value);
  const handleGeneratePromptChange = (e) => setGeneratePromptInput(e.target.value);

  // 🔥 UPDATED: handle dropdown change
  const handlePromptTypeChange = (e) => setPromptType(e.target.value);

  useEffect(() => {
    const fetchSanitizationData = async () => {
      try {
        const [sanitizationResponse, generatedPromptsResponse] = await Promise.all([
          get('api/list-sanitizations/'),
          get('api/list-generated-prompts/')
        ]);

        setSanitizationData(sanitizationResponse.data || sanitizationResponse || []);
        setGeneratedPrompts(generatedPromptsResponse.data || generatedPromptsResponse || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch prompts');
      }
    };
    fetchSanitizationData();
  }, []);

  const combinedData = [
    ...(sanitizationData.map(s => ({
      id: s.id,
      Target: "N/A",
      Prompt: s.prompt,
      Type: 'sanitization',
      responsePrompt: s?.response_prompt?.sanitized_prompt,
    }))),

    ...(generatedPrompts.map(gp => {
      let expandedPrompt = '';
      try {
        expandedPrompt = JSON.parse(gp.generated_response)?.expanded_prompt || '';
      } catch (err) {
        console.warn("Invalid JSON:", gp.generated_response);
      }
      return {
        id: gp.id + 1000,
        Target: 'N/A',
        Prompt: gp.input_prompt,
        Type: 'generated',
        AdditionalInfo: expandedPrompt
      };
    }))
  ];

  const columns = [
    { name: "ID", selector: row => row.id, sortable: true },
    { name: "Target", selector: row => row.Target, sortable: true },

    {
      name: "Prompt",
      selector: row => row.Prompt,
      sortable: true,
      cell: row => (
        <span>{row.Prompt.length > 30 ? `${row.Prompt.substring(0, 30)}...` : row.Prompt}</span>
      )
    },

    {
      name: "View",
      cell: row => (
        <div className="prompt-view-cell">
          <Eye
            className="eye-icon"
            size={18}
            onClickCapture={() => setHoveredPromptId(row.id)}
          />
          {hoveredPromptId === row.id && (
            <div className="prompt-hover-card">
              <h4>Prompt Details</h4>
              <p>{row.responsePrompt}</p>
            </div>
          )}
        </div>
      ),
      sortable: false,
      width: '80px'
    },

    { name: "Type", selector: row => row.Type, sortable: false },
  ];

  // ================================
  // 🔥 UPDATED: SEND DROPDOWN + INPUT TO API
  // ================================
  const handleGeneratePrompt = async () => {
    setLlmLoading(true);
    setError('');
    setGeneratedResponse('');

    try {
      const apiEndpoint = 'api/generate-prompt/';

      // 🔥 NEW PAYLOAD INCLUDING prompt_type
      const payload = {
        input_prompt: generatePromptInput,
        prompt_type: promptType
      };

      const response = await post(apiEndpoint, payload);

      setGeneratedResponse(response.generated_response.expanded_prompt);
      setGeneratePromptInput('');
      showToast("Prompt generated successfully!", "success");

    } catch (err) {
      setError(`Error generating prompt: ${err.message}`);
      console.error('Error details:', err);
    } finally {
      setLlmLoading(false);
    }
  };

  // Manual Sanitization Send
  const handleSendPrompt = async () => {
    setLlmLoading(true);
    setError('');
    setResponsePrompt('');
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
      return;
    }

    try {
      const apiEndpoint = 'api/sanitization/';
      const payload = { prompt: prompt };
      const response = await post(apiEndpoint, payload);

      setResponsePrompt(response.response_prompt.sanitized_prompt);
      setOriginalprompt(response.response_prompt.original_prompt);
      setPrompt('');
    } catch (err) {
      setError(`Error sending prompt: ${err.message}`);
    } finally {
      setLlmLoading(false);
    }
  };

  const handleCopy = async (textToCopy) => {
    try {
      if (!textToCopy) {
        showToast('No text to copy', 'error');
        return;
      }
      await navigator.clipboard.writeText(textToCopy || '');
      showToast('Copied to clipboard!', 'info');
    } catch (error) {
      showToast('Copy failed', 'error');
    }
  };

  return (
    <div className="admin-content">

      <div className="section-header">
        <h2>Prompt Sanitization</h2>
        <p>Review all prompts sanitized by AI</p>
      </div>

      {/* ================================
          MANUAL SANITIZATION BLOCK
         ================================ */}
      <div className="sanitization-card">
        <div className="card-header">
          <h3>Manual Sanitization</h3>
          <textarea
            className="user-prompt"
            placeholder="Enter your prompt here to sanitize"
            value={prompt}
            onChange={handlePromptChange}
          />
          <div className="form-buttons">
            <button className="btn btn-primary" onClick={handleSendPrompt}>Sanitize</button>
            <button className="btn btn-outline">Cancel</button>
            <button className="btn btn-primary" onClick={() => handleCopy(responsePrompt)}>
              Copy
            </button>
          </div>

          {responsePrompt && (
            <div className="sout">
              <h4><strong>Sanitized Response:</strong></h4>
              <div className="output-box">{responsePrompt}</div>
            </div>
          )}
        </div>
      </div>

      {/* ================================
          AUTO PROMPT GENERATION BLOCK
          🔥 FULLY UPDATED
         ================================ */}
      <div className="sanitization-card">
        <div className="card-header">

          <div className="pg-dropdown">
            <h3>Prompt Generator</h3>

            {/* 🔥 REAL Prompt Categories */}
            <div style={{ margin: "10px 0" }}>
              <label>Prompt Category: </label>
              <select value={promptType} onChange={handlePromptTypeChange}>
                <option value="reasoning">Reasoning</option>
                <option value="code_generation">Code Generation</option>
                <option value="security_analysis">Security Analysis</option>
                <option value="test_case_generation">Test Case Generation</option>
                <option value="documentation">Documentation Writing</option>
                <option value="creative_story">Creative Story</option>
                <option value="data_analysis">Data Analysis</option>
              </select>
            </div>
          </div>

          <textarea
            className="user-prompt-generator"
            placeholder="Enter your text here to generate a prompt"
            value={generatePromptInput}
            onChange={handleGeneratePromptChange}
          />

          <div className="form-buttons">
            <button className="btn btn-primary" onClick={handleGeneratePrompt}>Generate</button>
            <button className="btn btn-outline">Cancel</button>
            <button className="btn btn-primary" onClick={() => handleCopy(generatedResponse)}>
              Copy
            </button>
          </div>

          {isGenerating && (
            <div style={{ margin: "10px 0" }}>
              <span>Generating...</span>
              <Loader className="inline-loader" size={20} />
            </div>
          )}

          {generatedResponse && (
            <div className="sout">
              <h4><strong>Generated Prompt:</strong></h4>
              <div className="output-box">{generatedResponse}</div>
            </div>
          )}
        </div>
      </div>

      {/* ================================
          TABLE OF ALL PROMPTS
         ================================ */}
      <div style={{ padding: "20px" }}>
        <DataTable
          title="Prompts Overview"
          columns={columns}
          data={combinedData}
          pagination
          highlightOnHover
          striped
        />
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
