import google.generativeai as genai
import PIL.Image
import os
from dotenv import load_dotenv

# Load environment variables (for API Key)
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

def perform_ocr_and_summarize(image_path: str) -> str:
    """Performs OCR using Gemini 2.0 Flash and summarizes the extracted text."""
    try:
        # Load image
        img = PIL.Image.open(image_path)
        
        # Use Gemini model for OCR
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content([img], stream=False)

        if not response or not response.text:
            return "Error: No text extracted from image."

        extracted_text = response.text
        # print("\n[Extracted OCR Text]:\n", extracted_text)

        # Summarize extracted text using Gemini
        summary_prompt = f"""
                        You are an OCR and summarizing model. You are being used for an application that takes in a news, 
                        searches about it on the internet and confirms if it is Real or Fake.
                        Summarize this extracted text in a manner that would be good for searching and performing cosine 
                        similarity on and should be mainly key points:
                        \n{extracted_text}
                        """
        summary_response = model.generate_content(summary_prompt, stream=False)

        return summary_response.text if summary_response else "Error: Could not summarize."
    
    except Exception as e:
        return f"Error: {str(e)}"

# Example usage
if __name__ == "__main__":
    image_path = "image.png"  # Replace with actual image path
    summary = perform_ocr_and_summarize(image_path)
    print("\n[Summarized Output]:\n", summary)
