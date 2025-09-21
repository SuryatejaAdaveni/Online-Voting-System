from flask import Flask, request, jsonify
from flask_cors import CORS  # import CORS
import face_recognition
import numpy as np
import base64
import io
from PIL import Image

app = Flask(__name__)
CORS(app)  # enable CORS for all routes

# Your existing code continues here...


# Load voter reference encodings from disk or database (for demo purposes, use a static file)
# You need to replace this part with code that looks up the voter's known photo by voterId
def get_voter_face_encoding(voter_id):
    known_image = face_recognition.load_image_file(f"./known_faces/{voter_id}.jpg")
    encodings = face_recognition.face_encodings(known_image)
    return encodings[0] if encodings else None

@app.route('/api/verify-face', methods=['POST'])
def verify_face():
    data = request.get_json()
    voter_id = data.get("voterId")
    face_image_b64 = data.get("image")
    if not voter_id or not face_image_b64:
        return jsonify({"match": False, "message": "voterId and image required."}), 400

    # Load candidate image (captured from webcam, base64)
    try:
        image_data = base64.b64decode(face_image_b64.split(",")[-1])
        image = np.array(Image.open(io.BytesIO(image_data)))
    except Exception as e:
        return jsonify({"match": False, "message": "Image decoding error."}), 400

    # Get uploaded face encoding
    unknown_encodings = face_recognition.face_encodings(image)
    if not unknown_encodings:
        return jsonify({"match": False, "message": "No face detected."})

    unknown_encoding = unknown_encodings[0]
    # Get voter's stored face encoding
    known_encoding = get_voter_face_encoding(voter_id)
    if known_encoding is None:
        return jsonify({"match": False, "message": "No known face for voter."}), 404

    # Compare faces
    results = face_recognition.compare_faces([known_encoding], unknown_encoding)
    if results[0]:
        return jsonify({"match": True, "message": "Face verification successful."})
    return jsonify({"match": False, "message": "Face does not match."}), 403

if __name__ == "__main__":
    app.run(debug=True)
