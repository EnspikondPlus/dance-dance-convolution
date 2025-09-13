import yt_dlp
import re

def get_thumbnail(url):
    match = re.search(r"(?:v=|/shorts/)([a-zA-Z0-9_-]{11})", url)
    if match:
        video_id = match.group(1)
    thumb_url = "https://img.youtube.com/vi/" + video_id + "/hqdefault.jpg"
    return thumb_url

def get_title(url): 
    with yt_dlp.YoutubeDL() as ydl:
        info = ydl.extract_info(url, download=False)
        print("Title:", info["title"])
        return (info["title"])

