from fastapi import FastAPI
import joblib

from schemas import FlightRequest

from airport_mapper import encode_airports
from weather_service import get_weather
from opensky_service import get_flight_data
from feature_builder import build_features

app = FastAPI(
    title="AeroSafe AI"
)

model = joblib.load(
    "models/aerosafe_model_production.pkl"
)

@app.get("/")
def home():

    return {
        "status": "running"
    }

@app.post("/predict")
def predict(
    request: FlightRequest
):

    origin_id, destination_id = (
        encode_airports(
            request.origin,
            request.destination
        )
    )

    weather = get_weather(
        request.origin
    )

    flight = get_flight_data(
        request.origin,
        request.destination
    )

    features = build_features(
        origin_id,
        destination_id,
        weather,
        flight
    )

    prediction = int(
        model.predict(features)[0]
    )

    probability = float(
        model.predict_proba(
            features
        )[0][1]
    )

    return {
        "origin":
            request.origin,

        "destination":
            request.destination,

        "risk":
            prediction,

        "probability":
            probability
    }
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)