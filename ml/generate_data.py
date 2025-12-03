# generate_data.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

np.random.seed(42)
start = datetime(2022, 1, 1)
dates = [start + timedelta(days=i) for i in range(1095)]  # 3 years

# Seasonal + weekend + holiday pattern (very realistic)
base = 60 + 40 * np.sin(np.arange(len(dates)) * 2 * np.pi / 365)      # yearly wave
base += 30 * np.sin(np.arange(len(dates)) * 2 * np.pi / 7)          # weekend boost
holiday_boost = np.zeros(len(dates))

for i, d in enumerate(dates):
    if d.month == 12 and d.day >= 20:           # Christmas peak
        holiday_boost[i] = np.random.randint(100, 200)
    elif d.month in [3, 4]:                     # Summer + Holy Week
        holiday_boost[i] = np.random.randint(70, 140)
    elif d.month == 1 and d.day == 1:           # New Year
        holiday_boost[i] = np.random.randint(80, 130)

bookings = np.round(base + holiday_boost + np.random.normal(0, 12, len(dates)))
bookings = np.clip(bookings, 30, 350).astype(int)

df = pd.DataFrame({"date": dates, "bookings": bookings})
df.to_csv("booking_data.csv", index=False)
print("booking_data.csv created → 1095 rows (3 years) with strong patterns")