import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# === LOAD DATA ===
df = pd.read_csv("booking_data.csv")

# Example columns (replace with your actual columns)
X = df[['bookings', 'occupancy', 'guests']]
y = df['bookings']  # or whatever your target is

# === TRAIN / TEST SPLIT ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# === MODEL ===
model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# === PREDICT ===
predictions = model.predict(X_test)

# === METRICS ===
mae = mean_absolute_error(y_test, predictions)
rmse = np.sqrt(mean_squared_error(y_test, predictions))
r2 = r2_score(y_test, predictions)

print(f"MAE: {mae:.2f}")
print(f"RMSE: {rmse:.2f}")
print(f"R2 Score: {r2:.2f}")

# === SAVE MODEL ===
joblib.dump(model, "model.pkl")
print("Model saved to model.pkl")
