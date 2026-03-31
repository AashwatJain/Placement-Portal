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

POST /ats-score
    Form  : resumeFile (PDF upload), jobDescription (text)
    Return: { atsScore: 78.5 }

Run:
    python mlServer.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import PyPDF2
import io

app = Flask(__name__)
CORS(app)

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

    Formula: confidence = 100 / (1 + distance * 0.05)
    Very gentle curve — even moderate distances give high scores.
    - distance 0   → 100 %
    - distance 5   →  80 %
    - distance 10  →  67 %
    - distance 20  →  50 %
    Rounded to 1 decimal place.
    """
    return round(100.0 / (1.0 + distance * 0.05), 1)

@app.route("/recommend", methods=["POST"])
def recommend():
    """
    Finds the 5 nearest historical students and returns a deduplicated
    list of recommended companies with their confidence scores.
    """
    body = request.get_json(force=True, silent=True) or {}

    studentProfile = body.get("studentProfile")
    pastPlacements = body.get("pastPlacements")

    if not studentProfile or len(studentProfile) != 3:
        return jsonify({"error": "studentProfile must be an array of 3 numbers [dsaScore, devScore, cpScore]"}), 400

    if not pastPlacements or len(pastPlacements) == 0:
        return jsonify({"error": "pastPlacements must be a non-empty array"}), 400

    featureMatrix, companies = buildFeatureMatrix(pastPlacements)
    model, k = fitNearestNeighbors(featureMatrix, numNeighbors=12)

    queryVector = np.array(studentProfile).reshape(1, -1)
    distances, indices = model.kneighbors(queryVector)

    distances = distances[0]
    indices   = indices[0]

    companyBestScore = {}

    for dist, idx in zip(distances, indices):
        company    = companies[idx]
        confidence = calcConfidenceScore(dist)

        if company not in companyBestScore or confidence > companyBestScore[company]:
            companyBestScore[company] = confidence

    recommendations = [
        {"placedCompany": company, "confidenceScore": score}
        for company, score in sorted(
            companyBestScore.items(), key=lambda item: item[1], reverse=True
        )
    ]

    return jsonify({"recommendations": recommendations}), 200

@app.route("/predict-chance", methods=["POST"])
def predictChance():
    """
    Calculates the probability of a student getting placed at a specific
    targetCompany using a distance-based approach.

    Algorithm:
    1. Filter all past placements to only those at the targetCompany.
    2. Compute euclidean distance from student to each of those entries.
    3. Take the 5 closest distances.
    4. Average their confidence scores (using calcConfidenceScore).
    5. Return that average as selectionChance.

    This ensures meaningful scores even when the target company isn't
    among the overall nearest neighbors.
    """
    body = request.get_json(force=True, silent=True) or {}

    studentProfile = body.get("studentProfile")
    pastPlacements = body.get("pastPlacements")
    targetCompany  = body.get("targetCompany", "").strip()

    if not studentProfile or len(studentProfile) != 3:
        return jsonify({"error": "studentProfile must be an array of 3 numbers [dsaScore, devScore, cpScore]"}), 400

    if not pastPlacements or len(pastPlacements) == 0:
        return jsonify({"error": "pastPlacements must be a non-empty array"}), 400

    if not targetCompany:
        return jsonify({"error": "targetCompany must be a non-empty string"}), 400

    targetLower = targetCompany.lower()
    queryVector = np.array(studentProfile, dtype=float)

    companyDistances = []
    for record in pastPlacements:
        placedName = str(record.get("placedCompany", "")).lower()
        if placedName == targetLower:
            entryVector = np.array([
                float(record.get("dsaScore", 0)),
                float(record.get("devScore", 0)),
                float(record.get("cpScore",  0)),
            ])
            dist = np.linalg.norm(queryVector - entryVector)
            companyDistances.append(dist)

    if len(companyDistances) == 0:
        return jsonify({"selectionChance": 0}), 200

    companyDistances.sort()
    topN = companyDistances[:5]
    avgConfidence = sum(calcConfidenceScore(d) for d in topN) / len(topN)

    selectionChance = round(avgConfidence)

    return jsonify({"selectionChance": selectionChance}), 200

ATS_CATEGORIES = [
    {
        "name": "DSA & Problem Solving",
        "weight": 20,
        "keywords": [
            "data structure", "algorithm", "dsa", "problem solving",
            "array", "linked list", "tree", "graph", "dynamic programming",
            "dp", "sorting", "searching", "recursion", "backtracking",
            "hashing", "stack", "queue", "heap", "binary search",
            "greedy", "divide and conquer", "bfs", "dfs", "trie"
        ]
    },
    {
        "name": "Competitive Programming",
        "weight": 15,
        "keywords": [
            "competitive programming", "codeforces", "leetcode", "codechef",
            "icpc", "acm", "regional", "regionalist", "national",
            "olympiad", "hackerrank", "topcoder", "atcoder",
            "contest", "rating", "specialist", "expert", "candidate master",
            "div 1", "div 2", "solved", "problems solved"
        ]
    },
    {
        "name": "Programming Languages",
        "weight": 10,
        "keywords": [
            "c++", "java", "python", "javascript", "typescript",
            "go", "golang", "rust", "kotlin", "c#", "swift",
            "ruby", "php", "scala", "dart", "sql"
        ]
    },
    {
        "name": "Backend & APIs",
        "weight": 12,
        "keywords": [
            "backend", "rest", "api", "graphql", "microservice",
            "node.js", "nodejs", "express", "flask", "django",
            "spring boot", "spring", "fastapi", "server", "middleware",
            "authentication", "authorization", "jwt", "oauth"
        ]
    },
    {
        "name": "Databases",
        "weight": 8,
        "keywords": [
            "database", "sql", "mysql", "postgresql", "postgres",
            "mongodb", "redis", "firebase", "firestore", "dynamodb",
            "cassandra", "sqlite", "nosql", "orm", "prisma",
            "schema", "query", "indexing"
        ]
    },
    {
        "name": "Frontend & Full Stack",
        "weight": 8,
        "keywords": [
            "react", "angular", "vue", "next.js", "nextjs", "frontend",
            "full stack", "fullstack", "html", "css", "tailwind",
            "responsive", "ui", "ux", "web development", "component"
        ]
    },
    {
        "name": "Projects & Hackathons",
        "weight": 12,
        "keywords": [
            "project", "capstone", "hackathon", "hack", "open source",
            "contribution", "built", "developed", "implemented",
            "designed", "created", "deployed", "launched", "shipped",
            "research", "paper", "publication", "github", "portfolio"
        ]
    },
    {
        "name": "Leadership & Activities",
        "weight": 10,
        "keywords": [
            "leadership", "leader", "lead", "head", "president",
            "coordinator", "mentor", "volunteer", "organizer",
            "event", "club", "community", "team", "managed",
            "technical head", "secretary", "captain", "core member"
        ]
    },
    {
        "name": "Cloud & DevOps",
        "weight": 5,
        "keywords": [
            "aws", "azure", "gcp", "cloud", "docker", "kubernetes",
            "ci/cd", "devops", "jenkins", "github actions", "terraform",
            "deployment", "linux", "nginx", "vercel", "netlify", "heroku"
        ]
    },
]

def extractTextFromPdf(pdfFile):
    """
    Extracts and returns all text from a PDF file object using PyPDF2.
    Returns empty string if extraction fails.
    """
    try:
        reader = PyPDF2.PdfReader(pdfFile)
        text = ""
        for page in reader.pages:
            pageText = page.extract_text()
            if pageText:
                text += pageText + " "
        return text.strip()
    except Exception:
        return ""

def calcAtsKeywordScore(resumeText):
    """
    Scores a resume against weighted keyword categories.
    Each category has a weight and a list of keywords.
    Per category: hitRate = min(1.0, matchedKeywords / threshold)
    Final score = weighted average of hit rates (0–100).
    """
    textLower = resumeText.lower()
    totalWeight = sum(cat["weight"] for cat in ATS_CATEGORIES)
    weightedSum = 0.0

    for cat in ATS_CATEGORIES:
        matched = sum(1 for kw in cat["keywords"] if kw in textLower)
        threshold = max(2, len(cat["keywords"]) * 0.30)
        hitRate = min(1.0, matched / threshold)
        weightedSum += hitRate * cat["weight"]

    rawScore = (weightedSum / totalWeight) * 100
    return round(rawScore, 1)

@app.route("/ats-score", methods=["POST"])
def atsScore():
    """
    Computes ATS (Applicant Tracking System) compatibility score for
    an uploaded PDF resume using weighted keyword category matching.

    Form data:
        resumeFile – PDF file upload (required)

    Returns:
        { atsScore: 78.5 }  (0–100 percentage)
    """
    if "resumeFile" not in request.files:
        return jsonify({"error": "resumeFile is required (PDF upload)"}), 400

    resumeFile = request.files["resumeFile"]

    if not resumeFile.filename.lower().endswith(".pdf"):
        return jsonify({"error": "resumeFile must be a PDF"}), 400

    try:
        resumeText = extractTextFromPdf(resumeFile)
    except Exception as e:
        return jsonify({"error": f"Failed to parse PDF: {str(e)}"}), 400

    if not resumeText:
        return jsonify({"error": "Could not extract any text from the PDF. Ensure it is not image-based."}), 400

    try:
        score = calcAtsKeywordScore(resumeText)
    except Exception as e:
        return jsonify({"error": f"Scoring failed: {str(e)}"}), 500

    return jsonify({"atsScore": score}), 200

if __name__ == "__main__":
    import os
    print("🚀  ML Service running on http://localhost:5006")
    print("     POST /recommend      → company recommendations")
    print("     POST /predict-chance → placement probability")
    print("     POST /ats-score     → ATS resume scoring")
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5006)), debug=True)
