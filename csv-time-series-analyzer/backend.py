from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

@app.route('/api/process-csv', methods=['POST'])
def process_csv():
    try:
        csv_file = request.files['csv_file']
        prompt = request.form['prompt']
        model = request.form['model']
        
        # Read CSV
        df = pd.read_csv(csv_file)
        
        # Simple mock response based on model
        responses = {
            'ARIMA': f"ARIMA analysis completed for {len(df)} data points.\n\nPrompt: {prompt}\n\nSample analysis: The time series shows trend patterns that can be modeled using ARIMA parameters. Recommended next steps include parameter optimization and forecast validation.",
            'SARIMA': f"SARIMA seasonal analysis completed for {len(df)} data points.\n\nPrompt: {prompt}\n\nSample analysis: Seasonal patterns detected in the data. SARIMA model can capture both trend and seasonal components for improved forecasting accuracy.",
            'GARCH': f"GARCH volatility analysis completed for {len(df)} data points.\n\nPrompt: {prompt}\n\nSample analysis: Volatility clustering patterns identified. GARCH model can help predict conditional variance and risk measures in financial time series."
        }
        
        return jsonify({
            "response": responses.get(model, "Analysis completed"),
            "data_shape": df.shape,
            "columns": df.columns.tolist()
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)