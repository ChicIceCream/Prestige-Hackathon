from flask import Flask, render_template, request, jsonify
from aiagent_phi import fact_check_agent
from io import StringIO
import sys
from flask_cors import CORS

app = Flask(__name__)  # Define Flask app first
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


@app.route("/", methods=["GET"])
def index():
    return render_template("form.html")

@app.route("/fact_check", methods=["POST", "OPTIONS"])
def fact_check():
    if request.method == "OPTIONS":  # Handle preflight requests
        return _cors_preflight_response()

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400
    
    url = data.get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        output = StringIO()
        sys.stdout = output
        fact_check_agent.print_response(url, stream=True)
        response = output.getvalue()
        sys.stdout = sys.__stdout__

        if not response:
            return jsonify({"error": "Empty response from fact check agent"}), 500
            
        return jsonify({"result": response.strip()})
        
    except Exception as e:
        return jsonify({"error": f"Fact check failed: {str(e)}"}), 500

def _cors_preflight_response():
    response = jsonify({"message": "CORS preflight passed"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response

if __name__ == "__main__":
    app.run(debug=True)
