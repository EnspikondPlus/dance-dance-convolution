from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
from parse_link import get_thumbnail, get_title
from video_processing import get_video, cv_frame
from calculate import pipeline_similarity
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Allow all origins for simplicity

# Helper to add CORS headers manually if needed
def corsify_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response

# Preflight handler for all POST routes
@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        resp = make_response()
        return corsify_response(resp)

@app.route("/api/process_link", methods=["POST"])
def process_link():
    data = request.json
    youtube_link = data.get("link")
    thumbnail = get_thumbnail(youtube_link)
    title = get_title(youtube_link)
    if not youtube_link:
        resp = jsonify({"original": youtube_link, "message": "No link provided."})
        return corsify_response(resp), 400
    resp = jsonify({
        "original": youtube_link,
        "message": f"Received {youtube_link}",
        "thumbnail": f"{thumbnail}",
        "title": f"{title}"
    })
    return corsify_response(resp)

@app.route("/api/process_video", methods=["POST"])
def process_video():
    data = request.json
    youtube_link = data.get("link")
    output = get_video(youtube_link)
    resp = jsonify({"message": f"Processing Finished! Track and landmarks saved to ID: {output}", "id": output})
    return corsify_response(resp)

@app.route("/api/upload_frame", methods=["POST"])
def process_frame():
    data = request.json
    image = data.get("image")
    output_image, landmarks = cv_frame(image)
    resp = jsonify({"image": output_image, "landmarks": landmarks})
    return corsify_response(resp)

@app.route("/api/upload_track", methods=["POST"])
def process_track():
    data = request.json
    image = data.get("image")
    output_image, landmarks = cv_frame(image)
    resp = jsonify({"image": output_image, "landmarks": landmarks})
    return corsify_response(resp)

@app.route("/api/video", methods=["GET"])
def video():
    with open(os.path.join(os.getcwd(), "tracks/curr_track.txt"), "r") as f:
        video_id = f.readline().strip()
    video_path = os.path.join(os.getcwd(), f"tracks/{video_id}.mp4")
    response = make_response(send_file(video_path, mimetype="video/mp4"))
    return corsify_response(response)

@app.route("/api/calculate", methods=["POST"])
def calculate():
    data = request.json
    pose_points = data.get("pose")
    track_points = data.get("track")
    score = data.get("score")
    output_score = pipeline_similarity(pose_points, track_points, score)
    resp = jsonify({"score": output_score})
    return corsify_response(resp)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
