from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import os
import json

APP_ROOT = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(APP_ROOT, "model.pkl")
CSV_PATH = os.path.join(APP_ROOT, "booking_data.csv")
WEB_DIR = os.path.join(APP_ROOT, "web")

app = Flask(__name__, static_folder=WEB_DIR, static_url_path="/")
CORS(app)

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"{MODEL_PATH} not found. Run train_model.py first.")

model = joblib.load(MODEL_PATH)

if not os.path.exists(CSV_PATH):
    raise FileNotFoundError(f"{CSV_PATH} not found.")

# Load dataset
df_raw = pd.read_csv(CSV_PATH)
df_raw['date'] = pd.to_datetime(df_raw['date'])
df_raw = df_raw.sort_values('date').reset_index(drop=True)

df = df_raw.copy()
df['prev_bookings'] = df['bookings'].shift(1)
df = df.dropna(subset=['prev_bookings']).reset_index(drop=True)
df['prev_bookings'] = df['prev_bookings'].astype(float)
df['day'] = df['date'].dt.day
df['month'] = df['date'].dt.month
df['weekday'] = df['date'].dt.weekday

# Historical predictions
X_hist = df[['prev_bookings', 'day', 'month', 'weekday']]
try:
    df['predicted'] = model.predict(X_hist)
except Exception:
    df['predicted'] = np.nan

valid = df['predicted'].notna()
mae_hist = float(mean_absolute_error(df.loc[valid, 'bookings'], df.loc[valid, 'predicted'])) if valid.sum() > 0 else None
rmse_hist = float(np.sqrt(mean_squared_error(df.loc[valid, 'bookings'], df.loc[valid, 'predicted']))) if valid.sum() > 0 else None
r2_hist = float(r2_score(df.loc[valid, 'bookings'], df.loc[valid, 'predicted'])) if valid.sum() > 0 else None

@app.route("/")
def home():
    return send_from_directory(WEB_DIR, "index.html")


def safe_predict(prev, date):
    """Keeps predictions realistic."""
    features = np.array([[prev, date.day, date.month, date.weekday()]])
    pred = float(model.predict(features)[0])

    # Limit extreme jumps (prevents 12 → 190 errors)
    pred = max(0, min(pred, prev * 2 + 10))

    return pred


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        if "date" not in data or "today_bookings" not in data:
            return jsonify({"error": "Missing required fields"}), 400

        today = pd.to_datetime(data["date"])
        today_bookings = float(data["today_bookings"])

        # -----------------------------------------
        # NEXT DAY FORECAST
        # -----------------------------------------
        next_day = today + pd.Timedelta(days=1)
        next_day_pred = safe_predict(today_bookings, next_day)

        # -----------------------------------------
        # NEXT WEEK FORECAST (7 days)
        # -----------------------------------------
        next_week_dates = pd.date_range(start=next_day, periods=7)
        weekly_preds = []
        prev = today_bookings
        for d in next_week_dates:
            p = safe_predict(prev, d)
            weekly_preds.append({"date": d.strftime("%Y-%m-%d"), "pred": p})
            prev = p

        # -----------------------------------------
        # NEXT MONTH FORECAST (30 days)
        # -----------------------------------------
        next_month_dates = pd.date_range(start=next_day, periods=30)
        month_preds = []
        prev = today_bookings
        for d in next_month_dates:
            p = safe_predict(prev, d)
            month_preds.append({"date": d.strftime("%Y-%m-%d"), "pred": p})
            prev = p

        # Final response
        return jsonify({
            "next_day": {
                "date": next_day.strftime("%Y-%m-%d"),
                "prediction": next_day_pred
            },
            "next_week": weekly_preds,
            "next_month": month_preds,
            "mae": mae_hist,
            "rmse": rmse_hist,
            "r2": r2_hist
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
