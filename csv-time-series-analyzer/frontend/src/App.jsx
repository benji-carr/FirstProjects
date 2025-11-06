import React, { useState } from 'react';
import { Upload, FileText, Send, Loader2, AlertCircle, CheckCircle, Download, Camera } from 'lucide-react';
import './App.css'; // Make sure you're importing your CSS

function App() {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedModel, setSelectedModel] = useState('ARIMA');
  const [lastAnalyzedModel, setLastAnalyzedModel] = useState('');
  const [columns, setColumns] = useState([]);
  const [selectedTimeColumn, setSelectedTimeColumn] = useState('');
  const [selectedValueColumn, setSelectedValueColumn] = useState('');
  const [predictionPeriod, setPredictionPeriod] = useState('');
  const [predictionResult, setPredictionResult] = useState('');

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      setFile(uploadedFile);
      setError('');
      setUploadStatus('File ready for processing');
      
      // Preview CSV content and extract columns
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').slice(0, 5);
        setCsvData(lines);
        
        // Extract column names from first line (header)
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
          setColumns(headers);
        }
      };
      reader.readAsText(uploadedFile);
    } else {
      setError('Please upload a valid CSV file');
      setFile(null);
      setCsvData(null);
      setUploadStatus('');
      setColumns([]);
      setSelectedTimeColumn('');
      setSelectedValueColumn('');
    }
  };

  const handleSubmit = async () => {
  if (!file || !selectedTimeColumn || !selectedValueColumn) {
    setError('Please upload a CSV file and select both time and value columns');
    return;
  }

  // Clear previous results each time Analyze is clicked
  setResponse('');
  setError('');
  setPredictionResult('');
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('model', selectedModel);
    formData.append('time_column', selectedTimeColumn);
    formData.append('value_column', selectedValueColumn);

    const response = await fetch('https://csv-analyzer-mdep.onrender.com/api/process-csv', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    setResponse(result.response || 'Analysis complete');
    setLastAnalyzedModel(selectedModel); // ✅ only update this when analysis succeeds
  } catch (err) {
    setError(`Error: ${err.message}. Make sure your Python backend is running on the expected endpoint.`);
  } finally {
    setLoading(false);
  }
};


  const handleExportPNG = () => {
    // Placeholder for PNG export functionality
    console.log('Export to PNG clicked');
    alert('PNG export functionality would be implemented here');
  };

  const handleExportJPEG = () => {
    // Placeholder for JPEG export functionality
    console.log('Export to JPEG clicked');
    alert('JPEG export functionality would be implemented here');
  };

  const handleExportCSV = () => {
    // Placeholder for CSV export functionality
    console.log('Export Table to CSV clicked');
    alert('CSV export functionality would be implemented here');
  };

  const handleFindPrediction = () => {
    // Placeholder for single prediction functionality
    if (!predictionPeriod || predictionPeriod < 1) {
      alert('Please enter a valid period number');
      return;
    }
    
    console.log('Find Singular Predicted Value clicked for period:', predictionPeriod);
    // This would typically make an API call to get a specific prediction
    setPredictionResult(`Predicted value for period ${predictionPeriod}: 123.45`);
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
                <p className="text-sm text-gray-500 mt-1">CSV files only</p>
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

            {/* Column Selection */}
            {columns.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Time Column Dropdown */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-3">Select Time Column</h3>
                  <select
                    value={selectedTimeColumn}
                    onChange={(e) => setSelectedTimeColumn(e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Select Time Column --</option>
                    {columns.map((column, index) => (
                      <option key={index} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                  {selectedTimeColumn && (
                    <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-700">
                      Selected: <strong>{selectedTimeColumn}</strong>
                    </div>
                  )}
                </div>

                {/* Value Column Dropdown */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-3">Select Value Column</h3>
                  <select
                    value={selectedValueColumn}
                    onChange={(e) => setSelectedValueColumn(e.target.value)}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  >
                    <option value="">-- Select Value Column --</option>
                    {columns.map((column, index) => (
                      <option key={index} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                  {selectedValueColumn && (
                    <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-700">
                      Selected: <strong>{selectedValueColumn}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Analysis Button */}
            <div className="space-y-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !file || !selectedTimeColumn || !selectedValueColumn}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Run {selectedModel} Analysis
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
                  {lastAnalyzedModel
                    ? `${lastAnalyzedModel} Analysis Results:`
                    : 'Analysis Results:'}
                </h3>

                <div className="text-green-700 whitespace-pre-wrap bg-white p-4 rounded border">
                  {response}
                </div>
              </div>
            )}

            {/* Graph Display */}
            {response && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Time Series Graph</h3>
                <div id="chart-container" className="w-full h-96 bg-gray-50 rounded border flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>Chart will be displayed here</p>
                    <p className="text-sm mt-1">Graph visualization pending implementation</p>
                  </div>
                </div>
              </div>
            )}

            {/* Export Buttons */}
            {response && (
              <div className="space-y-3">
                <button
                  onClick={handleExportPNG}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Export to PNG
                </button>
                
                <button
                  onClick={handleExportJPEG}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Export to JPEG
                </button>
                
                <button
                  onClick={handleExportCSV}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export Table to CSV
                </button>
              </div>
            )}

            {/* Singular Prediction */}
            {response && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Singlular Value Prediction</h3>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter period number:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={predictionPeriod}
                      onChange={(e) => setPredictionPeriod(e.target.value)}
                      placeholder="e.g., 5"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Predicted value:
                    </label>
                    <div className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700">
                      {predictionResult || 'Result will appear here'}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={handleFindPrediction}
                    className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Find Singular Predicted Value
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;