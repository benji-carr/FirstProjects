import React, { useState } from 'react';
import { Upload, FileText, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedModel, setSelectedModel] = useState('ARIMA');

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      setFile(uploadedFile);
      setError('');
      setUploadStatus('File ready for processing');
      
      // Preview CSV content
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').slice(0, 5); // Show first 5 lines
        setCsvData(lines);
      };
      reader.readAsText(uploadedFile);
    } else {
      setError('Please upload a valid CSV file');
      setFile(null);
      setCsvData(null);
      setUploadStatus('');
    }
  };

  const handleSubmit = async () => {
    if (!file || !prompt.trim()) {
      setError('Please upload a CSV file and enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('csv_file', file);
      formData.append('prompt', prompt);
      formData.append('model', selectedModel);

      // This would connect to your Python backend
      const response = await fetch('/api/process-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setResponse(result.response || 'Processing complete');
    } catch (err) {
      setError(`Error: ${err.message}. Make sure your Python backend is running on the expected endpoint.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8" />
              CSV Time Series Analyzer
            </h1>
            <p className="mt-2 opacity-90">Upload a CSV file and analyze your time series data with advanced models</p>
          </div>

          <div className="p-6 space-y-6">
            {/* File Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  {file ? file.name : 'Click to upload CSV file'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  CSV files only
                </p>
              </label>
              
              {uploadStatus && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>{uploadStatus}</span>
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label htmlFor="model-select" className="block text-sm font-medium text-gray-700">
                Select Analysis Model:
              </label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="ARIMA">ARIMA - AutoRegressive Integrated Moving Average</option>
                <option value="SARIMA">SARIMA - Seasonal ARIMA</option>
                <option value="GARCH">GARCH - Generalized AutoRegressive Conditional Heteroskedasticity</option>
              </select>
              <p className="text-sm text-gray-500">
                {selectedModel === 'ARIMA' && 'Best for non-seasonal time series forecasting'}
                {selectedModel === 'SARIMA' && 'Ideal for seasonal time series data'}
                {selectedModel === 'GARCH' && 'Specialized for financial volatility modeling'}
              </p>
            </div>

            {/* CSV Preview */}
            {csvData && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">CSV Preview (first 5 lines):</h3>
                <div className="bg-white rounded border font-mono text-sm overflow-x-auto">
                  {csvData.map((line, index) => (
                    <div key={index} className="p-2 border-b last:border-b-0">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  Ask a question about your data:
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Forecast the next 12 periods' or 'Analyze the volatility patterns in this time series'"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !file || !prompt.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Analyze with {selectedModel}
                  </>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-red-700">
                  <p className="font-medium">Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Response Display */}
            {response && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {selectedModel} Analysis Results:
                </h3>
                <div className="text-green-700 whitespace-pre-wrap bg-white p-4 rounded border">
                  {response}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Backend Instructions */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Backend Setup Required</h2>
          <p className="text-gray-600 text-sm">
            This React app expects a Python backend at <code className="bg-gray-100 px-1 rounded">/api/process-csv</code>. 
            The backend should accept POST requests with a CSV file, prompt, and selected model (ARIMA/SARIMA/GARCH), then return JSON with the analysis results.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;