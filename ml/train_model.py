# train_final.py — 100% COMPATIBLE SA API (NO MORE ERRORS)
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

print("Training FINAL model...")

df = pd.read_csv("booking_data.csv")
df["date"] = pd.to_datetime(df["date"])

# EXACT SAME FEATURES
for lag in [1,2,3,7,14,30]:
    df[f"lag_{lag}"] = df["bookings"].shift(lag)
for w in [3,7,14,30]:
    df[f"roll_mean_{w}"] = df["bookings"].rolling(w).mean()
    df[f"roll_std_{w}"]  = df["bookings"].rolling(w).std()
    df[f"roll_max_{w}"]  = df["bookings"].rolling(w).max()
    df[f"roll_min_{w}"]  = df["bookings"].rolling(w).min()

df["month"]        = df["date"].dt.month
df["weekday"]      = df["date"].dt.weekday
df["is_weekend"]   = df["weekday"].isin([5,6]).astype(int)
df["day_of_year"]  = df["date"].dt.dayofyear
df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)
df["quarter"]      = df["date"].dt.quarter
df["is_peak_season"] = ((df["date"].dt.month == 12) | (df["date"].dt.month.isin([3,4]))).astype(int)

df = df.dropna().reset_index(drop=True)
FEATURES = [c for c in df.columns if c not in ["date", "bookings"]]

X = df[FEATURES]        # ← MAY COLUMN NAMES PA RIN
y = df["bookings"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = RandomForestRegressor(n_estimators=1000, random_state=42, n_jobs=-1)
model.fit(X_scaled, y)  # ← still numpy, pero okay na

# CRUCIAL: Save the feature names too!
joblib.dump(model, "model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(FEATURES, "features.pkl")   # ← ITO ANG NAGAGAWANG MAGIC

pred = model.predict(X_scaled)
print("FINAL MODEL READY!")
print(f"Features: {len(FEATURES)}")
print(f"MAE: {mean_absolute_error(y, pred):.1f}")
print(f"R²: {r2_score(y, pred):.4f}")
print("model.pkl, scaler.pkl, features.pkl → saved!")