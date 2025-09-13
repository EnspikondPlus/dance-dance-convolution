import yt_dlp, os
import cv2
import mediapipe as mp
import json
import re
import base64
import numpy as np

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

# def get_video(url):
#     download_dir = os.path.join(os.getcwd(), "tracks")
#     os.makedirs(download_dir, exist_ok=True)

#     match = re.search(r"(?:v=|/shorts/)([a-zA-Z0-9_-]{11})", url)
#     if match:
#         video_id = match.group(1)

#     ydl_opts = {
#         "format": "bestvideo+bestaudio/best",
#         "outtmpl": os.path.join(download_dir, f"{video_id}.mp4"),
#         "merge_output_format": "mp4"
#     }
#     with yt_dlp.YoutubeDL(ydl_opts) as ydl:
#         ydl.download([url])

#     with open(os.path.join(download_dir, "curr_track.txt"), "w") as f:
#         f.write(video_id)

#     video_path = f"tracks/{video_id}.mp4"
#     cap = cv2.VideoCapture(video_path)

#     all_landmarks = []

#     while cap.isOpened():
#         ret, frame = cap.read()
#         if not ret:
#             break

#         rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

#         # Process frame
#         results = pose.process(rgb_frame)

#         # Draw landmarks on frame
#         frame_landmarks = []

#         if results.pose_landmarks:
#             for id, lm in enumerate(results.pose_landmarks.landmark):
#                 frame_landmarks.append({
#                     "id": id,
#                     "x": lm.x,
#                     "y": lm.y,
#                     "z": lm.z,
#                     "visibility": lm.visibility
#                 })
#             # Optional: draw landmarks
#             mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

#         all_landmarks.append(frame_landmarks)

#         # Display
#         cv2.namedWindow("Pose Detection", cv2.WINDOW_NORMAL)
#         height, width = frame.shape[:2]
#         scale = 2
#         cv2.resizeWindow("Pose Detection", int(width / scale), int(height / scale))
#         cv2.imshow('Pose Detection', frame)
#         if cv2.waitKey(1) & 0xFF == 27:  # press ESC to exit
#             break

#     cap.release()
#     cv2.destroyAllWindows()

#     landmark_dir = os.path.join(os.getcwd(), "landmarks")
#     os.makedirs(landmark_dir, exist_ok=True)
#     with open(os.path.join(landmark_dir, f"{video_id}_landmarks.json"), "w") as f:
#         json.dump(all_landmarks, f)
#     return video_id

def get_video(url):
    download_dir = os.path.join(os.getcwd(), "tracks")
    os.makedirs(download_dir, exist_ok=True)

    match = re.search(r"(?:v=|/shorts/)([a-zA-Z0-9_-]{11})", url)
    if match:
        video_id = match.group(1)

    ydl_opts = {
        "format": "bestvideo+bestaudio/best",
        "outtmpl": os.path.join(download_dir, f"{video_id}.mp4"),
        "merge_output_format": "mp4"
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    with open(os.path.join(download_dir, "curr_track.txt"), "w") as f:
        f.write(video_id)

    return video_id

def base64_to_image(base64_str):
    if "," in base64_str:
        base64_str = base64_str.split(",")[1]
    img_bytes = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def base64_from_frame(frame):
    """Convert OpenCV BGR frame to base64 string"""
    _, buffer = cv2.imencode(".jpg", frame)  # encode as JPEG
    jpg_as_text = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/jpeg;base64,{jpg_as_text}"

def cv_frame(image):
    frame = base64_to_image(image)

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = pose.process(rgb_frame)
    frame_landmarks = []

    if results.pose_landmarks:
        for id, lm in enumerate(results.pose_landmarks.landmark):
            frame_landmarks.append({
                "id": id,
                "x": lm.x,
                "y": lm.y,
                "z": lm.z,
                "visibility": lm.visibility
            })
        # Optional: draw landmarks
        mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

    output = base64_from_frame(frame)
    return output, frame_landmarks