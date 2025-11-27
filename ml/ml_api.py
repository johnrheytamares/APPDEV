from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

# === Initialize Flask app ===
app = Flask(__name__)
CORS(app)  # allow cross-origin requests from frontend

# === Load trained model ===
model = joblib.load("model.pkl")

# === Predict route ===
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json  # get JSON from POST request
        
        # Extract features in correct order
        features = np.array([
            data["occupancy"],
            data["guests"],
            data["day"],
            data["month"],
            data["year"],
            data["day_of_week"]
        ]).reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(features)[0]
        
        # Return JSON response
        return jsonify({"prediction": float(prediction)})
    
    except KeyError as e:
        return jsonify({"error": f"Missing field {e}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === Run the Flask server ===
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
