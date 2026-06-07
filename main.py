import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Local module imports
from schemas import FlightRequest
from airport_mapper import encode_airports
from weather_service import get_weather
from opensky_service import get_flight_data
from feature_builder import build_features

app = FastAPI(title="AeroSafe AI")

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, change this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model
# Ensure the path is correct relative to where you run uvicorn
model = joblib.load("models/aerosafe_model_production.pkl")

@app.get("/")
def home():
    return {
        "status": "running",
        "service": "AeroSafe AI Risk Prediction"
    }

@app.post("/predict")
def predict(request: FlightRequest):
    # 1. Encode IATA/ICAO codes to IDs
    origin_id, destination_id = encode_airports(
        request.origin,
        request.destination
    )

    # 2. Fetch Real-time Weather Data
    weather = get_weather(request.origin)

    # 3. Fetch Real-time Flight/ADS-B Data
    flight = get_flight_data(
        request.origin,
        request.destination
    )

    # 4. Build feature vector for the model
    # Ensure this returns a 2D array or DataFrame compatible with XGBoost
    features = build_features(
        origin_id,
        destination_id,
        weather,
        flight
    )

    # 5. Model Inference
    prediction = int(model.predict(features)[0])
    probability = float(model.predict_proba(features)[0][1])

    return {
        "origin": request.origin,
        "destination": request.destination,
        "risk_level": prediction,
        "probability": round(probability, 4),
        "verdict": "High Risk" if prediction == 1 else "Low Risk"
    }