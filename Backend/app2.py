from flask import Flask, request, jsonify
from aiagent_phi import fact_check_agent
from gemini_ocr import perform_ocr_and_summarize
import tempfile

app = Flask(__name__)

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

        # Send extracted/summarized text to AI agent for fact-checking
        result = fact_check_agent.print_response(text, stream=False)

        return jsonify({"result": result.strip()})

    except Exception as e:
        return jsonify({"error": f"Fact check failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
