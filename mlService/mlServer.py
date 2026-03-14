"""
mlServer.py
──────────────────────────────────────────────────────────────────────────────
Flask ML microservice for the Placement Portal.

Endpoints
──────────
POST /recommend
    Body  : { studentProfile: [dsaScore, devScore, cpScore],
              pastPlacements: [{ dsaScore, devScore, cpScore, placedCompany }] }
    Return: { recommendations: [{ placedCompany, confidenceScore }] }

POST /predict-chance
    Body  : { studentProfile: [dsaScore, devScore, cpScore],
              pastPlacements: [...],
              targetCompany: "Amazon" }
    Return: { selectionChance: 85 }

Both endpoints use sklearn's NearestNeighbors (k=5, euclidean distance)
over the 3-dimensional score vector [dsaScore, devScore, cpScore].

Run:
    python mlServer.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.neighbors import NearestNeighbors

# ── App setup ──────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)          # Allow all origins so Node.js backend can call freely

# ── Helpers ───────────────────────────────────────────────────────────────────

def buildFeatureMatrix(pastPlacements):
    """
    Converts a list of placement dicts into a numpy feature matrix.
    Each row is [dsaScore, devScore, cpScore].

    Returns (matrix, companies) where companies[i] is the placedCompany
    for row i.
    """
    featureRows = []
    companies   = []

    for record in pastPlacements:
        dsaScore     = float(record.get("dsaScore",  0))
        devScore     = float(record.get("devScore",  0))
        cpScore      = float(record.get("cpScore",   0))
        placedCompany = str(record.get("placedCompany", "Unknown"))

        featureRows.append([dsaScore, devScore, cpScore])
        companies.append(placedCompany)

    return np.array(featureRows), companies


def fitNearestNeighbors(featureMatrix, numNeighbors):
    """
    Fits a NearestNeighbors model on the feature matrix.
    numNeighbors is clamped to the number of available samples.
    """
    k = min(numNeighbors, len(featureMatrix))
    model = NearestNeighbors(n_neighbors=k, metric="euclidean")
    model.fit(featureMatrix)
    return model, k


def calcConfidenceScore(distance):
    """
    Converts a euclidean distance into a confidence percentage.

    Formula: confidence = 100 / (1 + distance)
    - distance 0   → 100 %  (perfect match)
    - distance 10  →  ~9 %
    - distance 100 →  ~1 %
    Rounded to 1 decimal place.
    """
    return round(100.0 / (1.0 + distance), 1)


# ── Endpoint 1: /recommend ────────────────────────────────────────────────────

@app.route("/recommend", methods=["POST"])
def recommend():
    """
    Finds the 5 nearest historical students and returns a deduplicated
    list of recommended companies with their confidence scores.
    """
    body = request.get_json(force=True, silent=True) or {}

    studentProfile = body.get("studentProfile")
    pastPlacements = body.get("pastPlacements")

    # ── Input validation ──────────────────────────────────────────────────────
    if not studentProfile or len(studentProfile) != 3:
        return jsonify({"error": "studentProfile must be an array of 3 numbers [dsaScore, devScore, cpScore]"}), 400

    if not pastPlacements or len(pastPlacements) == 0:
        return jsonify({"error": "pastPlacements must be a non-empty array"}), 400

    # ── Build model ───────────────────────────────────────────────────────────
    featureMatrix, companies = buildFeatureMatrix(pastPlacements)
    model, k = fitNearestNeighbors(featureMatrix, numNeighbors=5)

    queryVector = np.array(studentProfile).reshape(1, -1)
    distances, indices = model.kneighbors(queryVector)

    distances = distances[0]
    indices   = indices[0]

    # ── Aggregate: best confidence per unique company ─────────────────────────
    companyBestScore = {}   # placedCompany → best confidenceScore so far

    for dist, idx in zip(distances, indices):
        company    = companies[idx]
        confidence = calcConfidenceScore(dist)

        if company not in companyBestScore or confidence > companyBestScore[company]:
            companyBestScore[company] = confidence

    # Sort by confidence descending
    recommendations = [
        {"placedCompany": company, "confidenceScore": score}
        for company, score in sorted(
            companyBestScore.items(), key=lambda item: item[1], reverse=True
        )
    ]

    return jsonify({"recommendations": recommendations}), 200


# ── Endpoint 2: /predict-chance ───────────────────────────────────────────────

@app.route("/predict-chance", methods=["POST"])
def predictChance():
    """
    Calculates the probability of a student getting placed at a specific
    targetCompany based on the nearest k=5 historical students.

    selectionChance = (# of k-nearest neighbors placed at targetCompany / k) × 100
    """
    body = request.get_json(force=True, silent=True) or {}

    studentProfile = body.get("studentProfile")
    pastPlacements = body.get("pastPlacements")
    targetCompany  = body.get("targetCompany", "").strip()

    # ── Input validation ──────────────────────────────────────────────────────
    if not studentProfile or len(studentProfile) != 3:
        return jsonify({"error": "studentProfile must be an array of 3 numbers [dsaScore, devScore, cpScore]"}), 400

    if not pastPlacements or len(pastPlacements) == 0:
        return jsonify({"error": "pastPlacements must be a non-empty array"}), 400

    if not targetCompany:
        return jsonify({"error": "targetCompany must be a non-empty string"}), 400

    # ── Build model ───────────────────────────────────────────────────────────
    featureMatrix, companies = buildFeatureMatrix(pastPlacements)
    model, k = fitNearestNeighbors(featureMatrix, numNeighbors=5)

    queryVector = np.array(studentProfile).reshape(1, -1)
    distances, indices = model.kneighbors(queryVector)

    indices = indices[0]

    # ── Count neighbors placed at targetCompany (case-insensitive) ────────────
    targetLower  = targetCompany.lower()
    matchCount   = sum(
        1 for idx in indices
        if companies[idx].lower() == targetLower
    )

    selectionChance = round((matchCount / k) * 100)

    return jsonify({"selectionChance": selectionChance}), 200


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("🚀  ML Service running on http://localhost:5000")
    print("     POST /recommend      → company recommendations")
    print("     POST /predict-chance → placement probability")
    app.run(host="0.0.0.0", port=5000, debug=True)
