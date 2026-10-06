from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os
import pandas as pd

from backend.feature_extractor import extract_features


# Create FastAPI app
app = FastAPI()


# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
        "https://phisguard-ai-eight.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Find project folder
BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)


# Path to trained model
model_path = os.path.join(
    BASE_DIR,
    "model-training",
    "phishing_model.joblib"
)


# Load trained ML model
model = joblib.load(model_path)


# Request format
class URLRequest(BaseModel):
    url: str


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "PhishGuard AI Backend is Running!"
    }


# Prediction endpoint
@app.post("/predict")
def predict(request: URLRequest):

    # Extract URL features
    features = extract_features(request.url)

    # Feature order must match training
    feature_names = [
        "url_length",
        "num_dots",
        "num_hyphens",
        "num_slashes",
        "num_digits",
        "https",
        "num_at",
        "num_question",
        "num_equal",
        "num_percent",
        "num_underscore",
        "num_special",
        "uses_ip",
        "num_subdomains",
        "suspicious_keyword",
        "domain_length",
        "is_url_shortener"
    ]


    # Create DataFrame
    data = pd.DataFrame(
        [[features[name] for name in feature_names]],
        columns=feature_names
    )


    # ML prediction
    prediction = model.predict(data)[0]


    # Prediction probabilities
    probability = model.predict_proba(data)[0]


    # Phishing probability
    probability_phishing = probability[1]


    # Risk score
    risk_score = round(
        probability_phishing * 100
    )


    # Risk level
    if risk_score < 30:
        risk_level = "Low"

    elif risk_score < 70:
        risk_level = "Medium"

    else:
        risk_level = "High"


    # Prediction result
    if prediction == 1:
        result = "Phishing"

    else:
        result = "Legitimate"


    # Generate reasons
    reasons = []


    if features["uses_ip"] == 1:
        reasons.append(
            "URL uses an IP address instead of a domain name"
        )


    if features["suspicious_keyword"] == 1:
        reasons.append(
            "Suspicious keyword detected in URL"
        )


    if features["num_subdomains"] >= 2:
        reasons.append(
            "Multiple subdomains detected"
        )


    if features["is_url_shortener"] == 1:
        reasons.append(
            "URL shortener detected"
        )


    if features["num_at"] > 0:
        reasons.append(
            "URL contains @ symbol"
        )


    if features["num_percent"] > 3:
        reasons.append(
            "URL contains many encoded characters"
        )


    if features["url_length"] > 100:
        reasons.append(
            "URL is unusually long"
        )


    if features["https"] == 0:
        reasons.append(
            "URL does not use HTTPS"
        )


    # If no suspicious indicators
    if len(reasons) == 0:
        reasons.append(
            "No major suspicious URL indicators detected"
        )


    # Return result
    return {
        "url": request.url,
        "prediction": result,
        "probability": probability.tolist(),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "reasons": reasons
    }

