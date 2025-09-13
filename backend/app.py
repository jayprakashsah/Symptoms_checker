# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY not set in environment")

print("✅ GEMINI_API_KEY loaded successfully:", api_key[:10] + "...")

genai.configure(api_key=api_key)
app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json or {}
    user_msg = data.get("message", "")
    if not user_msg:
        return jsonify({"reply": "Please send a message."}), 400
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")  # pick a supported model
        response = model.generate_content(user_msg)
        # build reply string (adjust based on returned structure)
        reply = response.text if hasattr(response, "text") and response.text else (
            response.candidates[0].content[0].text if response.candidates else "No reply"
        )
    except Exception as e:
        reply = f"Error: {str(e)}"
    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)