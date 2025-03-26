from flask import Flask, request, jsonify, render_template_string
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
    return render_template_string('''
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Text Similarity Checker</title>
        </head>
        <body>
            <h2>Enter two texts to check similarity</h2>
            <form id="similarity-form">
                <label for="text1">Text 1:</label><br>
                <input type="text" id="text1" name="text1"><br><br>

                <label for="text2">Text 2:</label><br>
                <input type="text" id="text2" name="text2"><br><br>

                <button type="button" onclick="checkSimilarity()">Check Similarity</button>
            </form>
            <p id="result"></p>

            <script>
                function checkSimilarity() {
                    let text1 = document.getElementById("text1").value;
                    let text2 = document.getElementById("text2").value;

                    fetch('/similarity', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text1, text2 })
                    })
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById("result").innerText = "Similarity Score: " + data.similarity_score;
                    })
                    .catch(error => console.error('Error:', error));
                }
            </script>
        </body>
        </html>
    ''')

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
