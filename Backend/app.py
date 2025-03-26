from flask import Flask, request, jsonify, render_template
from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine

app = Flask(__name__)

# Load the sentence transformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

def get_similarity(text1, text2):
    """Compute the similarity score between two texts using BERT embeddings."""
    embedding1 = model.encode(text1, convert_to_numpy=True)
    embedding2 = model.encode(text2, convert_to_numpy=True)
    similarity = 1 - cosine(embedding1, embedding2)  # Cosine similarity
    return similarity

@app.route("/")
def home():
    """Serve the HTML page for the similarity checker."""
    return render_template("index.html")

@app.route("/similarity", methods=["POST"])
def similarity_api():
    """API endpoint to compute similarity between two texts."""
    data = request.get_json()
    text1 = data.get("text1", "")
    text2 = data.get("text2", "")
    
    if not text1 or not text2:
        return jsonify({"error": "Both text1 and text2 are required."}), 400
    
    similarity_score = get_similarity(text1, text2)
    return jsonify({"similarity_score": round(similarity_score, 4)})

if __name__ == "__main__":
    app.run(debug=True)
