from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

# Load saved model
model = joblib.load("model.pkl")

app = FastAPI()

# Define the input schema
class BookingInput(BaseModel):
    bookings: float
    occupancy: float
    guests: float

@app.post("/predict")
def predict(data: BookingInput):
    X = np.array([[data.bookings, data.occupancy, data.guests]])
    prediction = model.predict(X)[0]
    return {"prediction": float(prediction)}
