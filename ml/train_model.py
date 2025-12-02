import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os

CSV = "booking_data.csv"
MODEL_OUT = "model.pkl"
SCALER_OUT = "scaler.pkl"

# Check CSV file
if not os.path.exists(CSV):
    raise FileNotFoundError(f"{CSV} not found.")

# Load dataset
df = pd.read_csv(CSV)
df["date"] = pd.to_datetime(df["date"])
df = df.sort_values("date").reset_index(drop=True)

# Create previous booking feature
df["prev_bookings"] = df["bookings"].shift(1)
df = df.dropna().reset_index(drop=True)
df["prev_bookings"] = df["prev_bookings"].astype(float)

# Extract date features
df["day"] = df["date"].dt.day
df["month"] = df["date"].dt.month
df["weekday"] = df["date"].dt.weekday

FEATURES = ["prev_bookings", "day", "month", "weekday"]
X = df[FEATURES]
y = df["bookings"]

# Scaling features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
joblib.dump(scaler, SCALER_OUT)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.18, random_state=42
)

# Random Forest Model (stable, no overfitting)
model = RandomForestRegressor(
    n_estimators=300,
    max_depth=7,
    min_samples_split=4,
    random_state=42
)

model.fit(X_train, y_train)

# Evaluate model
pred = model.predict(X_test)
mae = mean_absolute_error(y_test, pred)
rmse = np.sqrt(mean_squared_error(y_test, pred))
r2 = r2_score(y_test, pred)

print(f"MAE: {mae:.2f}, RMSE: {rmse:.2f}, R²: {r2:.2f}")

# Save model
joblib.dump(model, MODEL_OUT)
print("Model and scaler saved successfully.")
