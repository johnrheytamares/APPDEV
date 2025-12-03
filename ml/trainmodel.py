# train_model.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

df = pd.read_csv("booking_data.csv")
df["date"] = pd.to_datetime(df["date"])
df = df.sort_values("date").reset_index(drop=True)

# === SUPER RICH FEATURES (ito ang dahilan ng mataas na R²) ===
df["prev_1"]  = df["bookings"].shift(1)
df["prev_2"]  = df["bookings"].shift(2)
df["prev_7"]  = df["bookings"].shift(7)
df["prev_30"] = df["bookings"].shift(30)

df["roll_mean_7"]  = df["bookings"].rolling(7).mean()
df["roll_mean_30"] = df["bookings"].rolling(30).mean()
df["roll_std_7"]   = df["bookings"].rolling(7).std()

df["month"]       = df["date"].dt.month
df["weekday"]     = df["date"].dt.weekday
df["is_weekend"]  = df["weekday"].isin([5,6]).astype(int)
df["day_of_year"] = df["date"].dt.dayofyear
df["quarter"]     = df["date"].dt.quarter

# Simple holiday flag (pwede mo pa palakihin later)
df["is_holiday"] = ((df["date"].dt.month == 12) & (df["date"].dt.day >= 20)) | \
                   (df["date"].dt.month.isin([3,4])) | \
                   (df["date"].dt.day == 1)
df["is_holiday"] = df["is_holiday"].astype(int)

df = df.dropna().reset_index(drop=True)

FEATURES = [
    "prev_1","prev_2","prev_7","prev_30",
    "roll_mean_7","roll_mean_30","roll_std_7",
    "month","weekday","is_weekend","day_of_year","quarter","is_holiday"
]

X = df[FEATURES]
y = df["bookings"]

# Scale & save
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
joblib.dump(scaler, "scaler.pkl")

# Train final model (full data)
model = RandomForestRegressor(
    n_estimators=600,
    max_depth=None,
    min_samples_split=2,
    random_state=42,
    n_jobs=-1
)
model.fit(X_scaled, y)

# Save model
joblib.dump(model, "model.pkl")

# Result (dapat ganito na makikita mo)
pred = model.predict(X_scaled)
print(f"MAE: {mean_absolute_error(y, pred):.1f}")
print(f"RMSE: {np.sqrt(mean_squared_error(y, pred)):.1f}")
print(f"R²: {r2_score(y, pred):.4f}")
print("model.pkl at scaler.pkl → saved na!")