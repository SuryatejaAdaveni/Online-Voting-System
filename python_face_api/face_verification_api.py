from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
import base64
import io
from PIL import Image
import requests
import numpy as np
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__)
CORS(app)

# Connect to MongoDB (replace with your connection string)
client = MongoClient("mongodb+srv://vamshiambati:venu9985@cluster0.edeyz18.mongodb.net/admin-panel?retryWrites=true&w=majority&appName=Cluster0")  # Or your cloud MongoDB URI

# Choose your DB and collection
db = client["online-voting-system"]
voter_collection = db["voters"]


def get_photo_url_from_db(voter_id):
    try:
        oid = ObjectId(voter_id)
    except Exception:
        return None
    voter = voter_collection.find_one({"_id": oid})
    if voter and "photo" in voter:
        photo_info = voter["photo"]
        if isinstance(photo_info, dict):
            return photo_info.get("url")  # <- Only return the url string
        return None
    return None



def get_voter_face_encoding_from_url(photo_url):
    try:
        response = requests.get(photo_url)
        response.raise_for_status()
        img = Image.open(io.BytesIO(response.content))
        img_array = np.array(img)
        encodings = face_recognition.face_encodings(img_array)
        return encodings[0] if encodings else None
    except Exception as e:
        print(f"Error loading known face image: {e}")
        return None

@app.route('/api/verify-face', methods=['POST'])
def verify_face():
    data = request.get_json()
    voterId = data.get("voterId")
    face_image_b64 = data.get("image")
    if not voterId or not face_image_b64:
        return jsonify({"match": False, "message": "voterId and image required."}), 400

    # Decode and prepare live image (existing code)
    try:
        image_data = base64.b64decode(face_image_b64.split(",")[-1])
        live_image = np.array(Image.open(io.BytesIO(image_data)))
    except Exception as e:
        return jsonify({"match": False, "message": "Image decoding error."}), 400

    unknown_encodings = face_recognition.face_encodings(live_image)
    if not unknown_encodings:
        return jsonify({"match": False, "message": "No face detected in live image."})
    unknown_encoding = unknown_encodings[0]

    # Fetch photo URL from DB
    photo_url = get_photo_url_from_db(voterId)

    # Add null check here for photo_url
    if not photo_url:
        print(f"No photo URL found for voterId: {voterId}")
        return jsonify({"match": False, "message": "No known face found for voter."}), 404

    known_encoding = get_voter_face_encoding_from_url(photo_url)
    if known_encoding is None:
        return jsonify({"match": False, "message": "Failed to load known face."}), 500

    matches = face_recognition.compare_faces([known_encoding], unknown_encoding)

    if matches[0]:
        return jsonify({"match": True, "message": "Face verification successful."})
    else:
        return jsonify({"match": False, "message": "Face does not match."}), 403


if __name__ == "__main__":
    app.run(debug=True, port=5000)
