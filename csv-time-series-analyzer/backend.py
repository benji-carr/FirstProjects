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
        time_column = request.form.get('time_column')
        value_column = request.form.get('value_column')
        
        # Read CSV
        df = pd.read_csv(csv_file)
        
        # Enhanced response with column information
        response_text = f"{model} analysis completed for {len(df)} data points.\n\n"
        response_text += f"Time Column: {time_column}\n"
        response_text += f"Value Column: {value_column}\n\n"
        response_text += f"User Question: {prompt}\n\n"
        response_text += "Analysis: Ready to process time series data with selected columns."
        
        return jsonify({
            "response": response_text,
            "columns_used": {
                "time": time_column,
                "value": value_column
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)