from flask import Flask, request, jsonify
from aiagent_phi import fact_check_agent
from gemini_ocr import perform_ocr_and_summarize
import tempfile
from flask_cors import CORS
from io import StringIO
import sys


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route("/fact_check", methods=["POST"])
def fact_check():
    """Handles both text input and image-based OCR fact-checking."""
    text = request.form.get("text", "")
    image = request.files.get("image")  # Get image from Next.js request

    if not text and not image:
        return jsonify({"error": "No input provided"}), 400

    try:
        # If an image is uploaded, perform OCR and summarization
        if image:
            with tempfile.NamedTemporaryFile(delete=True, suffix=".png") as temp_img:
                image.save(temp_img.name)  # Save in-memory
                text = perform_ocr_and_summarize(temp_img.name)  # Gemini OCR

        if not text:
            return jsonify({"error": "OCR failed to extract text"}), 500
        # Capture the output of print_response
        output_buffer = StringIO()
        sys.stdout = output_buffer  # Redirect stdout to capture print output

        fact_check_agent.print_response(text, stream=True)

        sys.stdout = sys.__stdout__  # Reset stdout to normal
        response = output_buffer.getvalue()  # Get the captured output

        # print("\n--- Final Response ---")
        # print(response)  # This prints the stored response


        return jsonify({"result": response.strip()})

    except Exception as e:
        return jsonify({"error": f"Fact check failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
