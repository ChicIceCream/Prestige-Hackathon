from flask import Flask, render_template, request, jsonify
from aiagent_phi import fact_check_agent
from io import StringIO
import sys

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    # Render the HTML form to enter the URL
    return render_template("form.html")

@app.route("/fact_check", methods=["POST"])
def fact_check():
    data = request.get_json()
    
    # Ensure valid JSON data
    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400
    
    url = data.get("url")
    
    # Ensure the URL is provided
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        # Create a StringIO object to capture stdout
        output = StringIO()
        sys.stdout = output
        
        # Run the fact check and capture the response
        fact_check_agent.print_response(url, stream=True)
        
        # Get the captured output
        response = output.getvalue()
        
        # Reset stdout to its original state
        sys.stdout = sys.__stdout__
        
        # If no valid response is received, return an error
        if not response:
            return jsonify({"error": "Empty response from fact check agent"}), 500
            
        # Return the fact-check result as JSON
        return jsonify({"result": response.strip()})
        
    except Exception as e:
        # Handle any errors during the fact-checking process
        return jsonify({"error": f"Fact check failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
